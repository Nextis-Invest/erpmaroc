import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/database/connectToDB";
import PayrollDocument from "@/models/PayrollDocument";

// GET /api/payroll/documents/[id] - Get specific document
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
    const includePdf = searchParams.get("includePdf") === "true";

    // Build projection based on whether PDF is needed
    const projection = includePdf ? {} : { pdfData: 0 };

    const document = await PayrollDocument.findOne({
      _id: id,
      isDeleted: false
    }, projection)
      .populate('employeeId', 'firstName lastName employeeId email')
      .populate('generatedBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!document) {
      return NextResponse.json(
        { error: "Document introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { document }
    });

  } catch (error) {
    console.error("Erreur lors de la récupération du document:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
};

// PUT /api/payroll/documents/[id] - Update document metadata
export const PUT = async (
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
    const body = await req.json();

    // Fields that can be updated
    const allowedUpdates = [
      'title',
      'description',
      'status',
      'tags',
      'category',
      'approvedBy',
      'approvedAt',
      'sentAt',
      'sentTo'
    ];

    const updateData: any = {};
    for (const field of allowedUpdates) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Handle approval
    if (body.status === 'approved' && !updateData.approvedBy) {
      updateData.approvedBy = session.user.sub;
      updateData.approvedAt = new Date();
    }

    // Handle sending
    if (body.status === 'sent' && !updateData.sentAt) {
      updateData.sentAt = new Date();
    }

    const updatedDocument = await PayrollDocument.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    ).populate('employeeId', 'firstName lastName employeeId')
      .populate('generatedBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!updatedDocument) {
      return NextResponse.json(
        { error: "Document introuvable" },
        { status: 404 }
      );
    }

    // Remove PDF data from response
    const responseDocument = updatedDocument.toObject();
    delete responseDocument.pdfData;

    return NextResponse.json({
      success: true,
      message: "Document mis à jour avec succès",
      data: { document: responseDocument }
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du document:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
};

// DELETE /api/payroll/documents/[id] - Soft delete document
export const DELETE = async (
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

    // Soft delete
    await document.softDelete();

    return NextResponse.json({
      success: true,
      message: "Document supprimé avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de la suppression du document:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
};