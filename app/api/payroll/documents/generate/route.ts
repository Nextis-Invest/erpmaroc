import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/database/connectToDB";
import PayrollDocument from "@/models/PayrollDocument";
import Employee from "@/model/hr/employee";
import { documentStorageService } from "@/services/DocumentStorageService";
import { documentStatusService } from "@/services/DocumentStatusService";
import {
  DocumentStatus,
  DocumentType,
  GenerationMode,
  ProcessingPriority,
  DocumentErrorCode,
  GenerationConfig,
  StatusTransitionTrigger
} from "@/types/document-workflow";

// Generation queue configuration
const GENERATION_QUEUE = {
  maxConcurrent: 5,
  timeout: 120000, // 2 minutes
  retryAttempts: 3,
  retryDelay: 5000 // 5 seconds
};

// In-memory generation tracking (use Redis in production)
const generationQueue = new Map<string, {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  startedAt?: number;
  completedAt?: number;
  error?: string;
  retryCount: number;
}>();

let currentlyProcessing = 0;

// POST /api/payroll/documents/generate - Generate final document
export const POST = async (req: NextRequest) => {
  const startTime = Date.now();
  let employeeData: any = null;
  let documentId: string | null = null;
  let generationContext: any = null;

  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          error: "Non autorisé",
          code: "UNAUTHORIZED",
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      );
    }

    const userId = session.user.sub || session.user.id || session.user.email;

    // Initialize services
    await documentStorageService.initialize();
    await documentStatusService.initialize();

    const body = await req.json();
    const {
      employeeId,
      documentType,
      periodYear,
      periodMonth,
      periodStart,
      periodEnd,
      payrollData,
      priority = ProcessingPriority.NORMAL,
      generationConfig = {},
      approvalInfo,
      forceRegenerate = false,
      previewDocumentId
    } = body;

    // Validate required fields
    if (!employeeId || !documentType || !periodYear || !payrollData) {
      return NextResponse.json(
        {
          error: "Champs obligatoires manquants",
          code: "MISSING_REQUIRED_FIELDS",
          details: {
            required: ["employeeId", "documentType", "periodYear", "payrollData"],
            received: Object.keys(body)
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Validate document type
    if (!Object.values(DocumentType).includes(documentType)) {
      return NextResponse.json(
        {
          error: "Type de document invalide",
          code: "INVALID_DOCUMENT_TYPE",
          details: {
            received: documentType,
            allowed: Object.values(DocumentType)
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Fetch employee data with comprehensive validation
    employeeData = await Employee.findOne({
      $or: [
        { _id: employeeId },
        { employeeId: employeeId }
      ],
      status: 'active',
      isArchived: false
    }).populate('department', 'name code')
      .populate('team', 'name code')
      .populate('manager', 'firstName lastName employeeId');

    if (!employeeData) {
      return NextResponse.json(
        {
          error: "Employé introuvable ou inactif",
          code: "EMPLOYEE_NOT_FOUND",
          details: { employeeId },
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    // Validate employee has required data for document generation
    const employeeValidation = validateEmployeeData(employeeData, documentType);
    if (!employeeValidation.valid) {
      return NextResponse.json(
        {
          error: "Données employé insuffisantes",
          code: "INVALID_EMPLOYEE_DATA",
          details: employeeValidation.errors,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Comprehensive payroll data validation
    const payrollValidation = validatePayrollData(payrollData, documentType);
    if (!payrollValidation.valid) {
      return NextResponse.json(
        {
          error: "Données de paie invalides",
          code: "INVALID_PAYROLL_DATA",
          details: payrollValidation.errors,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Check for existing final document
    const existingDocument = await PayrollDocument.findOne({
      employeeId: employeeData._id,
      documentType,
      periodYear,
      ...(periodMonth && { periodMonth }),
      documentId: { $not: { $regex: /^PREVIEW_/ } },
      isDeleted: false,
      status: { $in: ['generated', 'approved', 'sent'] }
    });

    if (existingDocument && !forceRegenerate) {
      return NextResponse.json(
        {
          error: "Document final déjà existant",
          code: "DOCUMENT_ALREADY_EXISTS",
          details: {
            existingDocumentId: existingDocument.documentId,
            status: existingDocument.status,
            createdAt: existingDocument.createdAt
          },
          timestamp: new Date().toISOString(),
          suggestion: "Utilisez forceRegenerate=true pour régénérer"
        },
        { status: 409 }
      );
    }

    // Generate unique document ID
    const timestamp = Date.now();
    documentId = `${documentType}_${employeeData.employeeId || employeeId}_${periodYear}${periodMonth ? '_' + String(periodMonth).padStart(2, '0') : ''}_${timestamp}`;

    // Create period label
    const periodLabel = periodMonth
      ? `${getMonthName(periodMonth)} ${periodYear}`
      : `Année ${periodYear}`;

    // Configure generation settings
    const defaultGenerationConfig: GenerationConfig = {
      mode: GenerationMode.FINAL,
      quality: 'high',
      resolution: 300,
      includeMetadata: true,
      includeDigitalSignature: true,
      compressionLevel: 5
    };

    const finalGenerationConfig = { ...defaultGenerationConfig, ...generationConfig };

    // Check generation queue capacity
    if (currentlyProcessing >= GENERATION_QUEUE.maxConcurrent) {
      // Queue the generation
      generationQueue.set(documentId, {
        status: 'queued',
        retryCount: 0
      });

      // Create placeholder document with GENERATING status
      const placeholderDocument = new PayrollDocument({
        documentId,
        documentType,
        title: `${getDocumentTypeLabel(documentType)} - ${employeeData.firstName} ${employeeData.lastName}`,
        description: `Document généré pour ${periodLabel}`,
        employeeId: employeeData._id,
        employeeName: `${employeeData.firstName} ${employeeData.lastName}`,
        employeeCode: employeeData.employeeId,
        periodType: periodMonth ? 'monthly' : 'yearly',
        periodMonth,
        periodYear,
        periodStart: periodStart ? new Date(periodStart) : null,
        periodEnd: periodEnd ? new Date(periodEnd) : null,
        periodLabel,
        pdfData: {
          buffer: Buffer.from(''), // Empty buffer, will be filled when processed
          size: 0,
          mimetype: 'application/pdf'
        },
        salaryData: {
          baseSalary: payrollData.salaireBrut || 0,
          totalAllowances: payrollData.totalAllowances || 0,
          totalDeductions: payrollData.totalDeductions || 0,
          netSalary: payrollData.salaireNet || 0,
          cnssEmployee: payrollData.cnssEmployee || 0,
          cnssEmployer: payrollData.cnssEmployer || 0,
          incomeTax: payrollData.incomeTax || 0
        },
        generatedBy: userId,
        status: DocumentStatus.GENERATING,
        branch: employeeData.branch,
        company: process.env.COMPANY_NAME || 'ERP Maroc',
        tags: [documentType.toLowerCase(), 'final'],
        category: 'payroll',
        version: existingDocument ? (existingDocument.version + 1) : 1,
        parentDocument: existingDocument?._id
      });

      const savedPlaceholder = await placeholderDocument.save();

      // Process the queue asynchronously
      processGenerationQueue();

      return NextResponse.json({
        success: true,
        message: "Document mis en file d'attente pour génération",
        data: {
          documentId,
          status: DocumentStatus.GENERATING,
          queuePosition: Array.from(generationQueue.values()).filter(item => item.status === 'queued').length,
          estimatedWaitTime: Math.ceil(currentlyProcessing * GENERATION_QUEUE.timeout / 1000)
        },
        meta: {
          isQueued: true,
          processingTime: Date.now() - startTime
        }
      });
    }

    // Process immediately
    currentlyProcessing++;
    generationQueue.set(documentId, {
      status: 'processing',
      startedAt: Date.now(),
      retryCount: 0
    });

    try {
      // Update existing document to mark as superseded
      if (existingDocument) {
        existingDocument.isLatestVersion = false;
        await existingDocument.save();
      }

      // Generate final PDF with high quality
      console.log(`Generating final PDF for document: ${documentId}`);

      generationContext = {
        employee: employeeData,
        documentType,
        payrollData,
        periodLabel,
        config: finalGenerationConfig,
        metadata: {
          generatedBy: userId,
          generatedAt: new Date(),
          version: existingDocument ? (existingDocument.version + 1) : 1,
          environment: process.env.NODE_ENV || 'development'
        }
      };

      const finalPdfBuffer = await generateFinalPDF(generationContext);

      // Validate generated PDF
      const pdfValidation = validateGeneratedPDF(finalPdfBuffer, finalGenerationConfig);
      if (!pdfValidation.valid) {
        throw new Error(`PDF validation failed: ${pdfValidation.errors.join(', ')}`);
      }

      // Store document using storage service
      const storageResult = await documentStorageService.storeDocument(
        documentId,
        documentType,
        employeeData._id.toString(),
        periodYear,
        periodMonth || 1,
        finalPdfBuffer,
        {
          generatedBy: userId,
          generationConfig: finalGenerationConfig,
          employeeName: `${employeeData.firstName} ${employeeData.lastName}`,
          periodLabel
        }
      );

      if (!storageResult.success || !storageResult.fileInfo) {
        throw new Error(`Storage failed: ${storageResult.error?.message || 'Unknown storage error'}`);
      }

      // Create final payroll document
      const payrollDocument = new PayrollDocument({
        documentId,
        documentType,
        title: `${getDocumentTypeLabel(documentType)} - ${employeeData.firstName} ${employeeData.lastName}`,
        description: `Document officiel généré pour ${periodLabel}`,
        employeeId: employeeData._id,
        employeeName: `${employeeData.firstName} ${employeeData.lastName}`,
        employeeCode: employeeData.employeeId,
        periodType: periodMonth ? 'monthly' : 'yearly',
        periodMonth,
        periodYear,
        periodStart: periodStart ? new Date(periodStart) : null,
        periodEnd: periodEnd ? new Date(periodEnd) : null,
        periodLabel,
        pdfData: {
          buffer: finalPdfBuffer,
          size: finalPdfBuffer.length,
          mimetype: 'application/pdf'
        },
        salaryData: {
          baseSalary: payrollData.salaireBrut || 0,
          totalAllowances: payrollData.totalAllowances || 0,
          totalDeductions: payrollData.totalDeductions || 0,
          netSalary: payrollData.salaireNet || 0,
          cnssEmployee: payrollData.cnssEmployee || 0,
          cnssEmployer: payrollData.cnssEmployer || 0,
          incomeTax: payrollData.incomeTax || 0
        },
        generatedBy: userId,
        status: DocumentStatus.GENERATED,
        branch: employeeData.branch,
        company: process.env.COMPANY_NAME || 'ERP Maroc',
        tags: [documentType.toLowerCase(), 'final'],
        category: 'payroll',
        version: existingDocument ? (existingDocument.version + 1) : 1,
        parentDocument: existingDocument?._id,
        isLatestVersion: true
      });

      // Add approval info if provided
      if (approvalInfo) {
        payrollDocument.approvedBy = approvalInfo.approvedBy || userId;
        payrollDocument.approvedAt = new Date();
        payrollDocument.status = DocumentStatus.APPROVED;
      }

      const savedDocument = await payrollDocument.save();

      // Update generation queue status
      generationQueue.set(documentId, {
        status: 'completed',
        startedAt: generationQueue.get(documentId)?.startedAt,
        completedAt: Date.now(),
        retryCount: 0
      });

      // Transition status using status service
      if (!approvalInfo) {
        await documentStatusService.transitionStatus(
          documentId,
          DocumentStatus.GENERATED,
          {
            userId,
            reason: 'Document generation completed',
            metadata: {
              processingTime: Date.now() - startTime,
              fileSize: finalPdfBuffer.length,
              storageProvider: storageResult.fileInfo.provider
            }
          }
        );
      }

      console.log(`Final document generated successfully: ${documentId} (${finalPdfBuffer.length} bytes)`);

      // Remove PDF data from response
      const responseDocument = savedDocument.toObject();
      delete responseDocument.pdfData;

      // Clean up preview document if provided
      if (previewDocumentId) {
        try {
          await PayrollDocument.findOneAndUpdate(
            { documentId: previewDocumentId, documentId: { $regex: /^PREVIEW_/ } },
            { isDeleted: true, deletedAt: new Date(), deletedBy: userId }
          );
        } catch (error) {
          console.warn(`Failed to cleanup preview document ${previewDocumentId}:`, error);
        }
      }

      return NextResponse.json({
        success: true,
        message: "Document final généré avec succès",
        data: {
          document: responseDocument,
          processingTime: Date.now() - startTime,
          fileSize: finalPdfBuffer.length,
          version: responseDocument.version
        },
        meta: {
          documentId,
          storageProvider: storageResult.fileInfo.provider,
          generationConfig: finalGenerationConfig,
          isLatestVersion: true
        }
      });

    } catch (error) {
      // Update generation queue with error
      generationQueue.set(documentId, {
        status: 'failed',
        startedAt: generationQueue.get(documentId)?.startedAt,
        error: error.message,
        retryCount: generationQueue.get(documentId)?.retryCount || 0
      });

      // Attempt retry if applicable
      const queueItem = generationQueue.get(documentId);
      if (queueItem && queueItem.retryCount < GENERATION_QUEUE.retryAttempts) {
        queueItem.retryCount++;
        queueItem.status = 'queued';
        console.log(`Retrying generation for ${documentId}, attempt ${queueItem.retryCount}`);

        // Schedule retry
        setTimeout(() => processGenerationQueue(), GENERATION_QUEUE.retryDelay);
      }

      throw error;
    } finally {
      currentlyProcessing--;

      // Process next item in queue
      if (generationQueue.size > 0) {
        setTimeout(() => processGenerationQueue(), 1000);
      }
    }

  } catch (error) {
    console.error("Erreur lors de la génération du document final:", error);

    // Log comprehensive error details
    const errorDetails = {
      documentId,
      employeeId: employeeData?._id || body?.employeeId,
      documentType: body?.documentType,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
      generationContext: generationContext ? {
        config: generationContext.config,
        metadata: generationContext.metadata
      } : null,
      endpoint: "/api/payroll/documents/generate",
      method: "POST"
    };

    console.error("Generation error details:", errorDetails);

    // Handle specific error types
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));

      return NextResponse.json(
        {
          error: "Erreur de validation",
          code: "VALIDATION_ERROR",
          details: validationErrors,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        {
          error: "Document final déjà existant",
          code: "DUPLICATE_DOCUMENT",
          details: { documentId },
          timestamp: new Date().toISOString()
        },
        { status: 409 }
      );
    }

    if (error.message.includes('timeout')) {
      return NextResponse.json(
        {
          error: "Délai de génération dépassé",
          code: "GENERATION_TIMEOUT",
          details: {
            documentId,
            timeout: GENERATION_QUEUE.timeout
          },
          timestamp: new Date().toISOString()
        },
        { status: 408 }
      );
    }

    // Generic server error
    return NextResponse.json(
      {
        error: "Erreur serveur lors de la génération du document",
        code: "INTERNAL_SERVER_ERROR",
        requestId: `gen_${Date.now()}`,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
};

// GET /api/payroll/documents/generate - Get generation status
export const GET = async (req: NextRequest) => {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json(
        { error: "ID de document requis" },
        { status: 400 }
      );
    }

    const queueStatus = generationQueue.get(documentId);
    if (!queueStatus) {
      return NextResponse.json(
        { error: "Document non trouvé dans la file de génération" },
        { status: 404 }
      );
    }

    const response: any = {
      documentId,
      status: queueStatus.status,
      retryCount: queueStatus.retryCount
    };

    if (queueStatus.startedAt) {
      response.startedAt = new Date(queueStatus.startedAt);
      response.processingTime = Date.now() - queueStatus.startedAt;
    }

    if (queueStatus.completedAt) {
      response.completedAt = new Date(queueStatus.completedAt);
      response.totalTime = queueStatus.completedAt - (queueStatus.startedAt || 0);
    }

    if (queueStatus.error) {
      response.error = queueStatus.error;
    }

    if (queueStatus.status === 'queued') {
      const queuePosition = Array.from(generationQueue.entries())
        .filter(([_, item]) => item.status === 'queued')
        .findIndex(([id]) => id === documentId) + 1;

      response.queuePosition = queuePosition;
      response.estimatedWaitTime = Math.ceil(queuePosition * GENERATION_QUEUE.timeout / 1000);
    }

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error("Erreur lors de la récupération du statut de génération:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
};

// Helper functions

async function processGenerationQueue(): Promise<void> {
  if (currentlyProcessing >= GENERATION_QUEUE.maxConcurrent) {
    return;
  }

  const queuedItem = Array.from(generationQueue.entries())
    .find(([_, item]) => item.status === 'queued');

  if (!queuedItem) {
    return;
  }

  const [documentId, queueStatus] = queuedItem;

  // This would be implemented to process queued items
  // For now, just log the processing
  console.log(`Processing queued document: ${documentId}`);
}

function validateEmployeeData(employee: any, documentType: DocumentType): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!employee.firstName || !employee.lastName) {
    errors.push("Nom et prénom de l'employé requis");
  }

  if (!employee.employeeId) {
    errors.push("ID employé requis");
  }

  // Document-specific validations
  switch (documentType) {
    case DocumentType.ORDRE_VIREMENT:
      if (!employee.bankAccount && !employee.rib) {
        errors.push("Informations bancaires requises pour l'ordre de virement");
      }
      break;

    case DocumentType.CNSS_DECLARATION:
      if (!employee.cnssNumber) {
        errors.push("Numéro CNSS requis pour la déclaration CNSS");
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validatePayrollData(payrollData: any, documentType: DocumentType): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Basic validations
  if (typeof payrollData.salaireBrut !== 'number' || payrollData.salaireBrut < 0) {
    errors.push("Salaire brut invalide");
  }

  if (typeof payrollData.salaireNet !== 'number' || payrollData.salaireNet < 0) {
    errors.push("Salaire net invalide");
  }

  if (payrollData.salaireNet > payrollData.salaireBrut) {
    errors.push("Le salaire net ne peut pas être supérieur au salaire brut");
  }

  // Ensure required calculations are present
  const requiredFields = ['salaireBrut', 'salaireNet', 'totalDeductions'];
  for (const field of requiredFields) {
    if (payrollData[field] === undefined || payrollData[field] === null) {
      errors.push(`Champ requis manquant: ${field}`);
    }
  }

  // Document type specific validations
  switch (documentType) {
    case DocumentType.BULLETIN_PAIE:
      if (!payrollData.cnssEmployee || payrollData.cnssEmployee < 0) {
        errors.push("Cotisation CNSS employé requise et positive");
      }
      if (!payrollData.cnssEmployer || payrollData.cnssEmployer < 0) {
        errors.push("Cotisation CNSS employeur requise et positive");
      }
      if (payrollData.incomeTax !== undefined && payrollData.incomeTax < 0) {
        errors.push("Impôt sur le revenu ne peut pas être négatif");
      }
      break;

    case DocumentType.ORDRE_VIREMENT:
      if (!payrollData.salaireNet || payrollData.salaireNet <= 0) {
        errors.push("Montant à virer doit être positif");
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateGeneratedPDF(pdfBuffer: Buffer, config: GenerationConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check buffer is not empty
  if (!pdfBuffer || pdfBuffer.length === 0) {
    errors.push("PDF buffer is empty");
    return { valid: false, errors };
  }

  // Check PDF header
  if (!pdfBuffer.subarray(0, 4).equals(Buffer.from('%PDF'))) {
    errors.push("Invalid PDF format");
  }

  // Check minimum size (should be at least a few KB for a valid document)
  if (pdfBuffer.length < 1024) {
    errors.push("PDF too small, likely corrupted");
  }

  // Check maximum size (configurable limit)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (pdfBuffer.length > maxSize) {
    errors.push(`PDF too large: ${pdfBuffer.length} bytes > ${maxSize} bytes`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function getDocumentTypeLabel(documentType: DocumentType): string {
  const labels: Record<DocumentType, string> = {
    [DocumentType.BULLETIN_PAIE]: 'Bulletin de Paie',
    [DocumentType.ORDRE_VIREMENT]: 'Ordre de Virement',
    [DocumentType.CNSS_DECLARATION]: 'Déclaration CNSS',
    [DocumentType.SALARY_CERTIFICATE]: 'Certificat de Salaire',
    [DocumentType.PAYROLL_SUMMARY]: 'Récapitulatif de Paie'
  };

  return labels[documentType] || documentType;
}

function getMonthName(month: number): string {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return months[month - 1] || `Mois ${month}`;
}

// Simulate final PDF generation (replace with actual service)
async function generateFinalPDF(context: {
  employee: any;
  documentType: DocumentType;
  payrollData: any;
  periodLabel: string;
  config: GenerationConfig;
  metadata: any;
}): Promise<Buffer> {
  // This is a simulation - replace with actual PDF generation
  // For production, use libraries like pdfkit, puppeteer, or integrate with a PDF service

  const pdfContent = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 400 >>
stream
BT
/F1 20 Tf
50 750 Td
(DOCUMENT OFFICIEL) Tj
/F1 16 Tf
0 -40 Td
(Type: ${getDocumentTypeLabel(context.documentType)}) Tj
0 -30 Td
(Employe: ${context.employee.firstName} ${context.employee.lastName}) Tj
0 -30 Td
(ID Employe: ${context.employee.employeeId}) Tj
0 -30 Td
(Periode: ${context.periodLabel}) Tj
0 -40 Td
(DETAILS FINANCIERS:) Tj
0 -25 Td
(Salaire Brut: ${context.payrollData.salaireBrut} MAD) Tj
0 -20 Td
(Deductions: ${context.payrollData.totalDeductions || 0} MAD) Tj
0 -20 Td
(Salaire Net: ${context.payrollData.salaireNet} MAD) Tj
0 -40 Td
(CNSS Employe: ${context.payrollData.cnssEmployee || 0} MAD) Tj
0 -20 Td
(CNSS Employeur: ${context.payrollData.cnssEmployer || 0} MAD) Tj
0 -20 Td
(Impot: ${context.payrollData.incomeTax || 0} MAD) Tj
0 -40 Td
(Genere le: ${context.metadata.generatedAt.toLocaleDateString('fr-FR')}) Tj
0 -20 Td
(Version: ${context.metadata.version}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000053 00000 n
0000000109 00000 n
0000000205 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
655
%%EOF
  `;

  // Simulate processing time based on quality
  const processingTime = context.config.quality === 'high' ? 2000 : 1000;
  await new Promise(resolve => setTimeout(resolve, processingTime));

  return Buffer.from(pdfContent);
}