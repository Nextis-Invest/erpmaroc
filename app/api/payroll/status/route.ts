import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/database/connectToDB";
import PayrollStatus from "@/models/PayrollStatus";

// GET /api/payroll/status - Get payroll statuses with filters
export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const employeeId = searchParams.get("employeeId");
    const periodYear = searchParams.get("periodYear");
    const periodMonth = searchParams.get("periodMonth");
    const status = searchParams.get("status");

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

    if (employeeId) query.employeeId = employeeId;
    if (periodYear) query.periodYear = parseInt(periodYear);
    if (periodMonth) query.periodMonth = parseInt(periodMonth);
    if (status) query.status = status;

    const statuses = await PayrollStatus.find(query)
      .sort({ periodYear: -1, periodMonth: -1, employeeName: 1 });

    // Get summary statistics
    const summary = {
      total: statuses.length,
      nonGenere: statuses.filter(s => s.status === 'NON_GENERE').length,
      brouillon: statuses.filter(s => s.status === 'BROUILLON').length,
      genere: statuses.filter(s => s.status === 'GENERE').length,
      verifie: statuses.filter(s => s.status === 'VERIFIE').length,
      approuve: statuses.filter(s => s.status === 'APPROUVE').length,
      envoye: statuses.filter(s => s.status === 'ENVOYE').length,
      archive: statuses.filter(s => s.status === 'ARCHIVE').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        statuses,
        summary
      }
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des statuts:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
};

// POST /api/payroll/status - Create or update payroll status
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

    const userId = session.user.sub || session.user.id || session.user.email;

    const body = await req.json();
    const {
      employeeId,
      employeeName,
      employeeCode,
      periodMonth,
      periodYear,
      status,
      bulletinPaieId,
      financialSummary,
      branch,
      company,
      notes
    } = body;

    // Validate required fields
    if (!employeeId || !employeeName || !periodMonth || !periodYear) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    // Find existing status or create new one
    let payrollStatus = await PayrollStatus.findOne({
      employeeId,
      periodYear,
      periodMonth,
      isDeleted: false
    });

    if (payrollStatus) {
      // Update existing status
      payrollStatus.status = status || payrollStatus.status;
      payrollStatus.bulletinPaieId = bulletinPaieId || payrollStatus.bulletinPaieId;
      payrollStatus.financialSummary = financialSummary || payrollStatus.financialSummary;
      payrollStatus.notes = notes || payrollStatus.notes;
      payrollStatus.updatedAt = new Date();

      // Update status-specific fields
      if (status === 'GENERE') {
        payrollStatus.generatedAt = new Date();
        payrollStatus.generatedBy = userId;
      }
    } else {
      // Create new status
      payrollStatus = new PayrollStatus({
        employeeId,
        employeeName,
        employeeCode,
        periodMonth,
        periodYear,
        status: status || 'NON_GENERE',
        bulletinPaieId,
        financialSummary,
        branch,
        company,
        notes,
        generatedBy: status === 'GENERE' ? userId : undefined,
        generatedAt: status === 'GENERE' ? new Date() : undefined
      });
    }

    await payrollStatus.save();

    return NextResponse.json({
      success: true,
      message: "Statut de paie mis à jour avec succès",
      data: { status: payrollStatus }
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Un statut existe déjà pour cet employé et cette période" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur serveur lors de la mise à jour" },
      { status: 500 }
    );
  }
};

// PATCH /api/payroll/status - Progress status to next stage
export const PATCH = async (req: NextRequest) => {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const userId = session.user.sub || session.user.id || session.user.email;

    const body = await req.json();
    const { employeeId, periodMonth, periodYear, action } = body;

    if (!employeeId || !periodMonth || !periodYear) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    const payrollStatus = await PayrollStatus.findOne({
      employeeId,
      periodYear,
      periodMonth,
      isDeleted: false
    });

    if (!payrollStatus) {
      return NextResponse.json(
        { error: "Statut de paie non trouvé" },
        { status: 404 }
      );
    }

    // Handle different actions
    switch (action) {
      case 'progress':
        await payrollStatus.progressStatus(userId);
        break;
      case 'lock':
        await payrollStatus.toggleLock();
        break;
      case 'verify':
        payrollStatus.status = 'VERIFIE';
        payrollStatus.verifiedAt = new Date();
        payrollStatus.verifiedBy = userId;
        await payrollStatus.save();
        break;
      case 'approve':
        payrollStatus.status = 'APPROUVE';
        payrollStatus.approvedAt = new Date();
        payrollStatus.approvedBy = userId;
        await payrollStatus.save();
        break;
      case 'send':
        payrollStatus.status = 'ENVOYE';
        payrollStatus.sentAt = new Date();
        payrollStatus.sentBy = userId;
        await payrollStatus.save();
        break;
      default:
        return NextResponse.json(
          { error: "Action non reconnue" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: "Statut mis à jour avec succès",
      data: { status: payrollStatus }
    });

  } catch (error) {
    console.error("Erreur lors de la progression du statut:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
};