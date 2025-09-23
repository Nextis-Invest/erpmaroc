import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/database/connectToDB";
import PayrollDocument from "@/models/PayrollDocument";
import Employee from "@/model/hr/employee";
import { documentStorageService } from "@/services/DocumentStorageService";
import { documentStatusService } from "@/services/DocumentStatusService";
import { createSecurityMiddleware } from "@/lib/middleware/rateLimiting";
import { createErrorHandler, APIError, ErrorCreators, logger } from "@/lib/middleware/errorHandler";
import {
  DocumentStatus,
  DocumentType,
  GenerationMode,
  ProcessingPriority,
  DocumentErrorCode,
  PreviewConfig
} from "@/types/document-workflow";

// Initialize security middleware and error handler
const securityMiddleware = createSecurityMiddleware('preview');
const errorHandler = createErrorHandler();

// POST /api/payroll/documents/preview - Generate preview document
export const POST = async (req: NextRequest) => {
  const startTime = Date.now();
  let employeeData: any = null;
  let documentId: string | null = null;

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

    // Rate limiting check
    const rateLimitKey = `preview_${userId}`;
    const now = Date.now();
    const userLimit = rateLimitStore.get(rateLimitKey);

    if (userLimit && userLimit.resetTime > now) {
      if (userLimit.count >= RATE_LIMIT.maxRequests) {
        return NextResponse.json(
          {
            error: "Limite de taux dépassée",
            code: "RATE_LIMIT_EXCEEDED",
            retryAfter: Math.ceil((userLimit.resetTime - now) / 1000),
            timestamp: new Date().toISOString()
          },
          {
            status: 429,
            headers: {
              'Retry-After': Math.ceil((userLimit.resetTime - now) / 1000).toString(),
              'X-RateLimit-Limit': RATE_LIMIT.maxRequests.toString(),
              'X-RateLimit-Remaining': Math.max(0, RATE_LIMIT.maxRequests - userLimit.count - 1).toString(),
              'X-RateLimit-Reset': new Date(userLimit.resetTime).toISOString()
            }
          }
        );
      }
      userLimit.count++;
    } else {
      rateLimitStore.set(rateLimitKey, {
        count: 1,
        resetTime: now + RATE_LIMIT.windowMs
      });
    }

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
      previewConfig = {}
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

    // Fetch employee data
    employeeData = await Employee.findOne({
      $or: [
        { _id: employeeId },
        { employeeId: employeeId }
      ],
      status: 'active',
      isArchived: false
    }).populate('department', 'name code')
      .populate('team', 'name code');

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

    // Validate payroll data
    const validationResult = validatePayrollData(payrollData, documentType);
    if (!validationResult.valid) {
      return NextResponse.json(
        {
          error: "Données de paie invalides",
          code: "INVALID_PAYROLL_DATA",
          details: validationResult.errors,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Generate unique document ID for preview
    const timestamp = Date.now();
    documentId = `PREVIEW_${documentType}_${employeeData.employeeId || employeeId}_${periodYear}${periodMonth ? '_' + String(periodMonth).padStart(2, '0') : ''}_${timestamp}`;

    // Create period label
    const periodLabel = periodMonth
      ? `${getMonthName(periodMonth)} ${periodYear}`
      : `Année ${periodYear}`;

    // Configure preview settings
    const defaultPreviewConfig: PreviewConfig = {
      expiryTime: 30 * 60 * 1000, // 30 minutes
      reducedSections: true,
      watermarkText: "PRÉVISUALISATION - NON OFFICIEL",
      maxFileSize: 5 * 1024 * 1024, // 5MB
      cacheKey: `preview_${documentId}`
    };

    const finalPreviewConfig = { ...defaultPreviewConfig, ...previewConfig };

    // Initialize document status service
    await documentStatusService.initialize();

    // Check if there's an existing preview for this employee/period
    const existingPreview = await PayrollDocument.findOne({
      employeeId,
      documentType,
      periodYear,
      ...(periodMonth && { periodMonth }),
      documentId: { $regex: /^PREVIEW_/ },
      isDeleted: false,
      createdAt: { $gte: new Date(Date.now() - finalPreviewConfig.expiryTime) }
    });

    if (existingPreview) {
      console.log(`Using existing preview: ${existingPreview.documentId}`);

      // Update access timestamp
      existingPreview.updatedAt = new Date();
      await existingPreview.save();

      // Return existing preview without PDF data
      const response = existingPreview.toObject();
      delete response.pdfData;

      return NextResponse.json({
        success: true,
        message: "Prévisualisation existante récupérée",
        data: {
          document: response,
          processingTime: Date.now() - startTime,
          cached: true
        },
        meta: {
          documentId: existingPreview.documentId,
          expiresAt: new Date(existingPreview.createdAt.getTime() + finalPreviewConfig.expiryTime),
          isPreview: true
        }
      });
    }

    // Generate preview PDF
    console.log(`Generating preview PDF for document: ${documentId}`);

    // Simulate PDF generation (replace with actual PDF generation service)
    const previewPdfBuffer = await generatePreviewPDF({
      employee: employeeData,
      documentType,
      payrollData,
      periodLabel,
      watermark: finalPreviewConfig.watermarkText,
      reducedSections: finalPreviewConfig.reducedSections
    });

    if (previewPdfBuffer.length > finalPreviewConfig.maxFileSize) {
      return NextResponse.json(
        {
          error: "Fichier de prévisualisation trop volumineux",
          code: "FILE_TOO_LARGE",
          details: {
            size: previewPdfBuffer.length,
            maxSize: finalPreviewConfig.maxFileSize
          },
          timestamp: new Date().toISOString()
        },
        { status: 413 }
      );
    }

    // Create payroll document with preview status
    const payrollDocument = new PayrollDocument({
      documentId,
      documentType,
      title: `Prévisualisation ${documentType} - ${employeeData.firstName} ${employeeData.lastName}`,
      description: `Prévisualisation générée pour ${periodLabel}`,
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
        buffer: previewPdfBuffer,
        size: previewPdfBuffer.length,
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
      status: 'preview_generated', // Custom status for previews
      branch: employeeData.branch,
      company: process.env.COMPANY_NAME || 'ERP Maroc',
      tags: ['preview', documentType.toLowerCase()],
      category: 'preview'
    });

    const savedDocument = await payrollDocument.save();

    console.log(`Preview generated successfully: ${documentId} (${previewPdfBuffer.length} bytes)`);

    // Return document without PDF data in response
    const responseDocument = savedDocument.toObject();
    delete responseDocument.pdfData;

    return NextResponse.json({
      success: true,
      message: "Prévisualisation générée avec succès",
      data: {
        document: responseDocument,
        processingTime: Date.now() - startTime,
        cached: false
      },
      meta: {
        documentId,
        expiresAt: new Date(savedDocument.createdAt.getTime() + finalPreviewConfig.expiryTime),
        isPreview: true,
        watermark: finalPreviewConfig.watermarkText,
        fileSize: previewPdfBuffer.length
      }
    });

  } catch (error) {
    console.error("Erreur lors de la génération de la prévisualisation:", error);

    // Log error details for monitoring
    const errorDetails = {
      documentId,
      employeeId: employeeData?._id || body?.employeeId,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
      endpoint: "/api/payroll/documents/preview",
      method: "POST"
    };

    console.error("Preview generation error details:", errorDetails);

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
          error: "Document de prévisualisation déjà existant",
          code: "DUPLICATE_PREVIEW",
          details: { documentId },
          timestamp: new Date().toISOString()
        },
        { status: 409 }
      );
    }

    // Generic server error
    return NextResponse.json(
      {
        error: "Erreur serveur lors de la génération de la prévisualisation",
        code: "INTERNAL_SERVER_ERROR",
        requestId: `preview_${Date.now()}`,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
};

// GET /api/payroll/documents/preview - Stream preview document
export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const documentId = searchParams.get("documentId");
    const inline = searchParams.get("inline") === "true";

    if (!documentId) {
      return NextResponse.json(
        { error: "ID de document requis" },
        { status: 400 }
      );
    }

    const document = await PayrollDocument.findOne({
      documentId,
      documentId: { $regex: /^PREVIEW_/ },
      isDeleted: false
    });

    if (!document) {
      return NextResponse.json(
        { error: "Prévisualisation introuvable ou expirée" },
        { status: 404 }
      );
    }

    // Check if preview has expired (30 minutes)
    const expiryTime = 30 * 60 * 1000;
    if (Date.now() - document.createdAt.getTime() > expiryTime) {
      return NextResponse.json(
        { error: "Prévisualisation expirée" },
        { status: 410 }
      );
    }

    if (!document.pdfData || !document.pdfData.buffer) {
      return NextResponse.json(
        { error: "Données PDF de prévisualisation introuvables" },
        { status: 404 }
      );
    }

    // Set appropriate headers for PDF streaming
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Length', document.pdfData.size.toString());
    headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    if (inline) {
      headers.set('Content-Disposition', `inline; filename="preview_${document.downloadFilename}"`);
    } else {
      headers.set('Content-Disposition', `attachment; filename="preview_${document.downloadFilename}"`);
    }

    // Add preview-specific headers
    headers.set('X-Preview-Document', 'true');
    headers.set('X-Document-ID', documentId);
    headers.set('X-Expires-At', new Date(document.createdAt.getTime() + expiryTime).toISOString());

    return new NextResponse(document.pdfData.buffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error("Erreur lors de la récupération de la prévisualisation:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
};

// Helper functions

function validatePayrollData(payrollData: any, documentType: DocumentType): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Common validations
  if (typeof payrollData.salaireBrut !== 'number' || payrollData.salaireBrut < 0) {
    errors.push("Salaire brut invalide");
  }

  if (typeof payrollData.salaireNet !== 'number' || payrollData.salaireNet < 0) {
    errors.push("Salaire net invalide");
  }

  if (payrollData.salaireNet > payrollData.salaireBrut) {
    errors.push("Le salaire net ne peut pas être supérieur au salaire brut");
  }

  // Document type specific validations
  switch (documentType) {
    case DocumentType.BULLETIN_PAIE:
      if (!payrollData.cnssEmployee || payrollData.cnssEmployee < 0) {
        errors.push("Cotisation CNSS employé invalide");
      }
      if (!payrollData.cnssEmployer || payrollData.cnssEmployer < 0) {
        errors.push("Cotisation CNSS employeur invalide");
      }
      break;

    case DocumentType.ORDRE_VIREMENT:
      if (!payrollData.bankAccount || typeof payrollData.bankAccount !== 'string') {
        errors.push("Numéro de compte bancaire requis pour l'ordre de virement");
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function getMonthName(month: number): string {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return months[month - 1] || `Mois ${month}`;
}

// Simulate PDF generation (replace with actual service)
async function generatePreviewPDF(options: {
  employee: any;
  documentType: DocumentType;
  payrollData: any;
  periodLabel: string;
  watermark: string;
  reducedSections: boolean;
}): Promise<Buffer> {
  // This is a simulation - replace with actual PDF generation
  // For example, using libraries like pdfkit, puppeteer, or jsPDF

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
<< /Length 200 >>
stream
BT
/F1 24 Tf
50 750 Td
(${options.watermark}) Tj
/F1 16 Tf
0 -50 Td
(Document: ${options.documentType}) Tj
0 -30 Td
(Employe: ${options.employee.firstName} ${options.employee.lastName}) Tj
0 -30 Td
(Periode: ${options.periodLabel}) Tj
0 -30 Td
(Salaire Net: ${options.payrollData.salaireNet} MAD) Tj
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
455
%%EOF
  `;

  return Buffer.from(pdfContent);
}