import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/database/connectToDB";
import PayrollDocument from "@/models/PayrollDocument";

// GET /api/payroll/documents/[id]/download - Download PDF
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const searchParams = req.nextUrl.searchParams;
    const inline = searchParams.get("inline") === "true"; // For preview vs download

    const document = await PayrollDocument.findOne({
      _id: id,
      isDeleted: false
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document introuvable" },
        { status: 404 }
      );
    }

    if (!document.pdfData || !document.pdfData.buffer) {
      return NextResponse.json(
        { error: "Données PDF introuvables" },
        { status: 404 }
      );
    }

    // Set appropriate headers for PDF response
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Length', document.pdfData.size.toString());

    if (inline) {
      // For preview - display in browser
      headers.set('Content-Disposition', `inline; filename="${document.downloadFilename}"`);
    } else {
      // For download - force download
      headers.set('Content-Disposition', `attachment; filename="${document.downloadFilename}"`);
    }

    // Add cache headers
    headers.set('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour
    headers.set('Last-Modified', document.updatedAt.toUTCString());

    return new NextResponse(document.pdfData.buffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error("Erreur lors du téléchargement du document:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
};