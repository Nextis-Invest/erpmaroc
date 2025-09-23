import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/database/connectToDB';
import Succursale from '@/models/succursale';
import { auth } from '@/auth';
import { moroccanCities } from '@/lib/data/moroccan-cities';

// GET /api/succursales - Get all succursales with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const region = searchParams.get('region') || '';
    const status = searchParams.get('status') || '';
    const city = searchParams.get('city') || '';
    const type = searchParams.get('type') || '';

    // Build filter object
    const filter: any = { isDeleted: false };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { 'manager.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (region) filter.region = region;
    if (status) filter.status = status;
    if (city) filter.city = city;
    if (type) filter.type = type;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [succursales, total] = await Promise.all([
      Succursale.find(filter)
        .select('-__v -isDeleted')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .lean(),
      Succursale.countDocuments(filter)
    ]);

    // Calculate aggregated statistics
    const stats = await Succursale.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalSuccursales: { $sum: 1 },
          activeSuccursales: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          totalEmployees: { $sum: '$employees.total' },
          totalRevenue: { $sum: '$financials.revenue.yearly' },
          avgRevenue: { $avg: '$financials.revenue.yearly' }
        }
      }
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: succursales,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      statistics: stats[0] || {
        totalSuccursales: 0,
        activeSuccursales: 0,
        totalEmployees: 0,
        totalRevenue: 0,
        avgRevenue: 0
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des succursales:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/succursales - Create a new succursale
export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'city', 'region', 'address', 'manager', 'phone', 'email'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Le champ ${field} est requis` },
          { status: 400 }
        );
      }
    }

    // Validate city exists in our data
    const cityExists = moroccanCities.find(c => c.name === body.city);
    if (!cityExists) {
      return NextResponse.json(
        { error: 'Ville non reconnue dans la base de données marocaine' },
        { status: 400 }
      );
    }

    // Check if succursale code already exists
    if (body.code) {
      const existingCode = await Succursale.findOne({ code: body.code, isDeleted: false });
      if (existingCode) {
        return NextResponse.json(
          { error: 'Ce code de succursale existe déjà' },
          { status: 400 }
        );
      }
    }

    // Check if email already exists
    const existingEmail = await Succursale.findOne({ email: body.email, isDeleted: false });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Cette adresse email est déjà utilisée' },
        { status: 400 }
      );
    }

    // Create new succursale
    const succursaleData = {
      ...body,
      createdBy: session.user.id,
      updatedBy: session.user.id,
      coordinates: cityExists.coordinates, // Auto-set coordinates from city data
      region: cityExists.region // Ensure region matches city data
    };

    const newSuccursale = new Succursale(succursaleData);
    await newSuccursale.save();

    // Populate the response
    const populatedSuccursale = await Succursale.findById(newSuccursale._id)
      .select('-__v -isDeleted')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Succursale créée avec succès',
      data: populatedSuccursale
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de la succursale:', error);

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
      { error: 'Erreur serveur lors de la création' },
      { status: 500 }
    );
  }
}

// PUT /api/succursales - Bulk update multiple succursales
export async function PUT(request: NextRequest) {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ids, updates } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Liste d\'IDs requise' },
        { status: 400 }
      );
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Données de mise à jour requises' },
        { status: 400 }
      );
    }

    // Add updatedBy to the updates
    updates.updatedBy = session.user.id;

    // Perform bulk update
    const result = await Succursale.updateMany(
      { _id: { $in: ids }, isDeleted: false },
      { $set: updates }
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} succursale(s) mise(s) à jour`,
      modified: result.modifiedCount
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour en masse:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/succursales - Bulk soft delete multiple succursales
export async function DELETE(request: NextRequest) {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Liste d\'IDs requise' },
        { status: 400 }
      );
    }

    // Soft delete (mark as deleted)
    const result = await Succursale.updateMany(
      { _id: { $in: ids }, isDeleted: false },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: session.user.id,
          status: 'inactive'
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} succursale(s) supprimée(s)`,
      deleted: result.modifiedCount
    });

  } catch (error) {
    console.error('Erreur lors de la suppression en masse:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}