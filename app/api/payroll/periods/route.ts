import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PayrollPeriod from '@/models/PayrollPeriod';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id') || 'default';
    const statut = searchParams.get('statut');
    const annee = searchParams.get('annee');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const query: any = { company_id };

    if (statut) {
      query.statut = statut;
    }

    if (annee) {
      query.annee = parseInt(annee);
    }

    const [periods, total] = await Promise.all([
      PayrollPeriod.find(query)
        .sort({ annee: -1, mois: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PayrollPeriod.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: periods,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des périodes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des périodes'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const session = await auth();
    const body = await request.json();
    const { mois, annee, company_id = 'default' } = body;

    // Validation des données
    if (!mois || !annee) {
      return NextResponse.json(
        {
          success: false,
          error: 'Mois et année sont requis'
        },
        { status: 400 }
      );
    }

    if (mois < 1 || mois > 12) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le mois doit être entre 1 et 12'
        },
        { status: 400 }
      );
    }

    const currentYear = new Date().getFullYear();
    if (annee < 2020 || annee > currentYear + 1) {
      return NextResponse.json(
        {
          success: false,
          error: `L'année doit être entre 2020 et ${currentYear + 1}`
        },
        { status: 400 }
      );
    }

    // Vérifier si une période existe déjà
    const existingPeriod = await PayrollPeriod.findOne({
      mois,
      annee,
      company_id
    });

    if (existingPeriod) {
      return NextResponse.json(
        {
          success: false,
          error: `Une période existe déjà pour ${mois}/${annee}`,
          data: existingPeriod
        },
        { status: 409 }
      );
    }

    // Créer la nouvelle période
    const newPeriod = await PayrollPeriod.create({
      mois,
      annee,
      date_debut: new Date(annee, mois - 1, 1),
      date_fin: new Date(annee, mois, 0, 23, 59, 59),
      company_id,
      created_by: session?.user?.email || 'system',
      statut: 'BROUILLON'
    });

    return NextResponse.json({
      success: true,
      message: `Période ${mois}/${annee} créée avec succès`,
      data: newPeriod
    });
  } catch (error) {
    console.error('Erreur lors de la création de la période:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la création de la période'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const session = await auth();
    const body = await request.json();
    const { id, statut, notes, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de la période requis'
        },
        { status: 400 }
      );
    }

    const period = await PayrollPeriod.findById(id);

    if (!period) {
      return NextResponse.json(
        {
          success: false,
          error: 'Période non trouvée'
        },
        { status: 404 }
      );
    }

    // Vérifier si la période peut être modifiée
    if (!period.canBeModified()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cette période ne peut plus être modifiée'
        },
        { status: 403 }
      );
    }

    // Mettre à jour les champs autorisés
    if (statut && ['BROUILLON', 'EN_COURS', 'CLOTURE'].includes(statut)) {
      period.statut = statut;

      if (statut === 'CLOTURE') {
        period.closed_at = new Date();
        period.closed_by = session?.user?.email || 'system';
      }
    }

    if (notes !== undefined) {
      period.notes = notes;
    }

    // Mettre à jour les totaux si fournis
    if (updates.total_employees !== undefined) period.total_employees = updates.total_employees;
    if (updates.total_salaries !== undefined) period.total_salaries = updates.total_salaries;
    if (updates.total_cotisations !== undefined) period.total_cotisations = updates.total_cotisations;
    if (updates.total_net !== undefined) period.total_net = updates.total_net;

    const updatedPeriod = await period.save();

    return NextResponse.json({
      success: true,
      message: 'Période mise à jour avec succès',
      data: updatedPeriod
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la période:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la mise à jour de la période'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de la période requis'
        },
        { status: 400 }
      );
    }

    const period = await PayrollPeriod.findById(id);

    if (!period) {
      return NextResponse.json(
        {
          success: false,
          error: 'Période non trouvée'
        },
        { status: 404 }
      );
    }

    // Seules les périodes en BROUILLON peuvent être supprimées
    if (period.statut !== 'BROUILLON') {
      return NextResponse.json(
        {
          success: false,
          error: 'Seules les périodes en BROUILLON peuvent être supprimées'
        },
        { status: 403 }
      );
    }

    await PayrollPeriod.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Période supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la période:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la suppression de la période'
      },
      { status: 500 }
    );
  }
}