import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDB } from '@/lib/database/connectToDB';
import Region from '@/model/region';

// GET /api/regions - List all regions
export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const withSites = searchParams.get('withSites') === 'true';

    let query: any = {};
    if (!includeInactive) {
      query.isActive = true;
    }

    let regions = await Region.find(query).sort({ name: 1 });

    // Optionally populate sites count
    if (withSites) {
      regions = await Region.find(query)
        .populate('sitesCount')
        .sort({ name: 1 });
    }

    return NextResponse.json({
      meta: {
        status: 200,
        message: "Regions fetched successfully"
      },
      data: { regions }
    });

  } catch (error) {
    console.error("Error fetching regions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

// POST /api/regions - Create new region
export const POST = async (req: NextRequest) => {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admin can create regions
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Check if region with same code or name already exists
    const existingRegion = await Region.findOne({
      $or: [
        { code: body.code?.toUpperCase() },
        { name: body.name }
      ]
    });

    if (existingRegion) {
      return NextResponse.json(
        { error: "Region with this code or name already exists" },
        { status: 400 }
      );
    }

    const region = new Region({
      ...body,
      createdBy: session.user.sub
    });

    const savedRegion = await region.save();

    return NextResponse.json({
      meta: {
        status: 201,
        message: "Region created successfully"
      },
      data: { region: savedRegion }
    });

  } catch (error) {
    console.error("Error creating region:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};