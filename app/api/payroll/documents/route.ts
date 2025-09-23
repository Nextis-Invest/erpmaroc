import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/database/connectToDB";
import PayrollDocument from "@/models/PayrollDocument";
import Employee from "@/model/hr/employee";

// GET /api/payroll/documents - List payroll documents with pagination and filters
export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const documentType = searchParams.get("documentType");
    const employeeId = searchParams.get("employeeId");
    const periodYear = searchParams.get("periodYear");
    const periodMonth = searchParams.get("periodMonth");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Build query
    let query: any = { isDeleted: false };

    // Search functionality
    if (search) {
      query.$or = [
        { employeeName: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { documentId: { $regex: search, $options: "i" } },
        { employeeCode: { $regex: search, $options: "i" } },
        { searchTerms: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Apply filters
    if (documentType) query.documentType = documentType;
    if (employeeId) query.employeeId = employeeId;
    if (periodYear) query.periodYear = parseInt(periodYear);
    if (periodMonth) query.periodMonth = parseInt(periodMonth);
    if (status) query.status = status;

    // Date range filter
    if (startDate || endDate) {
      query.generatedAt = {};
      if (startDate) query.generatedAt.$gte = new Date(startDate);
      if (endDate) query.generatedAt.$lte = new Date(endDate);
    }

    // Count total documents
    const total = await PayrollDocument.countDocuments(query);

    // Get documents with pagination
    const documents = await PayrollDocument.find(query, {
      pdfData: 0 // Exclude PDF data from list view for performance
    })
      .populate('employeeId', 'firstName lastName employeeId')
      .populate('generatedBy', 'name email')
      .populate('approvedBy', 'name email')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ generatedAt: -1 });

    return NextResponse.json({
      success: true,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      data: { documents }
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des documents:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
};

// POST /api/payroll/documents - Create new payroll document
export const POST = async (req: NextRequest) => {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Get user ID from session
    console.log('Session user data:', {
      email: session.user.email,
      sub: session.user.sub,
      id: session.user.id,
      fullSession: session.user
    });

    const userId = session.user.sub || session.user.id || session.user.email;
    if (!userId) {
      return NextResponse.json(
        { error: "Impossible de récupérer l'ID utilisateur de la session" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      documentType,
      title,
      description,
      employeeId,
      employeeName,
      employeeCode,
      periodType,
      periodMonth,
      periodYear,
      periodStart,
      periodEnd,
      periodLabel,
      pdfBase64,
      salaryData,
      branch,
      company,
      tags,
      category
    } = body;

    // Validate required fields
    if (!documentType || !title || !employeeId || !employeeName || !periodYear || !pdfBase64) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    // Convert base64 PDF to buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    // Generate unique document ID
    const timestamp = Date.now();
    const documentId = `${documentType.toUpperCase()}_${employeeCode || employeeId}_${periodYear}${periodMonth ? '_' + String(periodMonth).padStart(2, '0') : ''}_${timestamp}`;

    // Create payroll document
    const payrollDocument = new PayrollDocument({
      documentId,
      documentType,
      title,
      description,
      employeeId,
      employeeName,
      employeeCode,
      periodType: periodType || 'monthly',
      periodMonth,
      periodYear,
      periodStart: periodStart ? new Date(periodStart) : null,
      periodEnd: periodEnd ? new Date(periodEnd) : null,
      periodLabel,
      pdfData: {
        buffer: pdfBuffer,
        size: pdfBuffer.length,
        mimetype: 'application/pdf'
      },
      salaryData,
      generatedBy: userId,
      branch,
      company,
      tags: tags || [],
      category
    });

    const savedDocument = await payrollDocument.save();

    // Return document without PDF data
    const responseDocument = savedDocument.toObject();
    delete responseDocument.pdfData;

    return NextResponse.json({
      success: true,
      message: "Document de paie créé avec succès",
      data: { document: responseDocument }
    });

  } catch (error) {
    console.error("Erreur lors de la création du document:", error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: "Erreur de validation", details: validationErrors },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Un document avec cet ID existe déjà" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur serveur lors de la création" },
      { status: 500 }
    );
  }
};