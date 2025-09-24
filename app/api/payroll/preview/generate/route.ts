import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { renderToStream } from "@react-pdf/renderer";
import BulletinPaiePDF from "@/components/payroll/BulletinPaie";
import { getCompanyInfoForPDF } from "@/lib/config/companyInfo";

// POST /api/payroll/preview/generate - Generate preview document for workflow
export const POST = async (req: NextRequest) => {
  const startTime = Date.now();

  try {
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

    const body = await req.json();
    const {
      employee,
      calculation,
      period,
      sessionId,
      quality = 'standard',
      options = {}
    } = body;

    // Validate required fields
    if (!employee || !calculation || !period) {
      return NextResponse.json(
        {
          error: "Champs obligatoires manquants",
          code: "MISSING_REQUIRED_FIELDS",
          details: {
            required: ["employee", "calculation", "period"],
            received: Object.keys(body)
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Generate preview document using React PDF
    try {
      const pdfDocument = BulletinPaiePDF({
        employee,
        calculation,
        period,
        companyInfo: getCompanyInfoForPDF()
      });

      // Render PDF to stream
      const stream = await renderToStream(pdfDocument);
      const chunks: Uint8Array[] = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const pdfBuffer = Buffer.concat(chunks);
      const base64Pdf = pdfBuffer.toString('base64');

      // Generate unique document ID for preview
      const timestamp = Date.now();
      const documentId = `PREVIEW_BULLETIN_${employee._id}_${period.annee}_${period.mois}_${timestamp}`;

      return NextResponse.json({
        success: true,
        message: "Prévisualisation générée avec succès",
        data: {
          documentId,
          pdfData: `data:application/pdf;base64,${base64Pdf}`,
          processingTime: Date.now() - startTime,
          quality,
          metadata: {
            employee: {
              id: employee._id,
              nom: employee.nom,
              prenom: employee.prenom
            },
            period: {
              mois: period.mois,
              annee: period.annee
            },
            calculation: {
              salaireBrut: calculation.salaire_brut_global,
              salaireNet: calculation.salaire_net
            }
          }
        },
        meta: {
          documentId,
          isPreview: true,
          watermark: "PRÉVISUALISATION - NON OFFICIEL",
          fileSize: pdfBuffer.length
        }
      });

    } catch (pdfError) {
      console.error("Erreur génération PDF:", pdfError);
      return NextResponse.json(
        {
          error: "Erreur lors de la génération du PDF",
          code: "PDF_GENERATION_ERROR",
          details: pdfError.message,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Erreur lors de la génération de la prévisualisation:", error);

    // Log error details for monitoring
    const errorDetails = {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
      endpoint: "/api/payroll/preview/generate",
      method: "POST"
    };

    console.error("Preview generation error details:", errorDetails);

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