import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/database/connectToDB';
import Succursale from '@/models/succursale';
import { auth } from '@/auth';
import { moroccanCities } from '@/lib/data/moroccan-cities';

// GET /api/succursales/[id] - Get a specific succursale
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de succursale requis' },
        { status: 400 }
      );
    }

    const succursale = await Succursale.findOne({ _id: id, isDeleted: false })
      .select('-__v -isDeleted')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('parentBranch', 'name code city')
      .populate('childBranches', 'name code city status')
      .lean();

    if (!succursale) {
      return NextResponse.json(
        { error: 'Succursale introuvable' },
        { status: 404 }
      );
    }

    // Get additional analytics for this succursale
    const analytics = await Succursale.aggregate([
      { $match: { _id: succursale._id } },
      {
        $lookup: {
          from: 'records', // Assuming you have a records collection
          localField: '_id',
          foreignField: 'succursale',
          as: 'recentRecords'
        }
      },
      {
        $addFields: {
          recentRecordsCount: { $size: '$recentRecords' }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...succursale,
        analytics: analytics[0] || {}
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la succursale:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT /api/succursales/[id] - Update a specific succursale
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID de succursale requis' },
        { status: 400 }
      );
    }

    // Check if succursale exists
    const existingSuccursale = await Succursale.findOne({ _id: id, isDeleted: false });
    if (!existingSuccursale) {
      return NextResponse.json(
        { error: 'Succursale introuvable' },
        { status: 404 }
      );
    }

    // Validate city if being updated
    if (body.city) {
      const cityExists = moroccanCities.find(c => c.name === body.city);
      if (!cityExists) {
        return NextResponse.json(
          { error: 'Ville non reconnue dans la base de données marocaine' },
          { status: 400 }
        );
      }
      // Auto-update coordinates and region if city changes
      if (body.city !== existingSuccursale.city) {
        body.coordinates = cityExists.coordinates;
        body.region = cityExists.region;
      }
    }

    // Check for duplicate code if being updated
    if (body.code && body.code !== existingSuccursale.code) {
      const duplicateCode = await Succursale.findOne({
        code: body.code,
        isDeleted: false,
        _id: { $ne: id }
      });
      if (duplicateCode) {
        return NextResponse.json(
          { error: 'Ce code de succursale existe déjà' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate email if being updated
    if (body.email && body.email !== existingSuccursale.email) {
      const duplicateEmail = await Succursale.findOne({
        email: body.email,
        isDeleted: false,
        _id: { $ne: id }
      });
      if (duplicateEmail) {
        return NextResponse.json(
          { error: 'Cette adresse email est déjà utilisée' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {
      ...body,
      updatedBy: session.user.id
    };

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.createdBy;
    delete updateData.version;

    // Update the succursale
    const updatedSuccursale = await Succursale.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
        select: '-__v -isDeleted'
      }
    )
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .lean();

    return NextResponse.json({
      success: true,
      message: 'Succursale mise à jour avec succès',
      data: updatedSuccursale
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la succursale:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: 'Erreur de validation', details: validationErrors },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { error: `Ce ${field} existe déjà` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

// DELETE /api/succursales/[id] - Soft delete a specific succursale
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de succursale requis' },
        { status: 400 }
      );
    }

    // Check if succursale exists and is not already deleted
    const existingSuccursale = await Succursale.findOne({ _id: id, isDeleted: false });
    if (!existingSuccursale) {
      return NextResponse.json(
        { error: 'Succursale introuvable' },
        { status: 404 }
      );
    }

    // Check if this succursale has child branches
    const childBranches = await Succursale.find({
      parentBranch: id,
      isDeleted: false
    });

    if (childBranches.length > 0) {
      return NextResponse.json(
        {
          error: 'Impossible de supprimer cette succursale car elle a des succursales enfants',
          details: `${childBranches.length} succursale(s) enfant(s) trouvée(s)`
        },
        { status: 400 }
      );
    }

    // Soft delete the succursale
    const deletedSuccursale = await Succursale.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: session.user.id,
        status: 'inactive'
      },
      { new: true, select: 'name code city status' }
    );

    return NextResponse.json({
      success: true,
      message: 'Succursale supprimée avec succès',
      data: deletedSuccursale
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la succursale:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la suppression' },
      { status: 500 }
    );
  }
}