import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDB } from '@/lib/database/connectToDB';
import Site from '@/model/site';
import Region from '@/model/region';

// GET /api/sites - List all sites
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
    const regionId = searchParams.get('regionId');
    const type = searchParams.get('type');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let query: any = {};
    if (!includeInactive) {
      query.isActive = true;
    }
    if (regionId) {
      query.region = regionId;
    }
    if (type) {
      query.type = type;
    }

    const sites = await Site.find(query)
      .populate('region', 'name code')
      .populate('manager', 'firstName lastName employeeId')
      .sort({ name: 1 });

    return NextResponse.json({
      meta: {
        status: 200,
        message: "Sites fetched successfully"
      },
      data: { sites }
    });

  } catch (error) {
    console.error("Error fetching sites:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

// POST /api/sites - Create new site
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

    const body = await req.json();

    // Verify region exists
    const region = await Region.findById(body.region);
    if (!region) {
      return NextResponse.json(
        { error: "Invalid region ID" },
        { status: 400 }
      );
    }

    // Generate siteId if not provided
    if (!body.siteId) {
      // Generate unique siteId
      const timestamp = Date.now().toString().slice(-6);
      body.siteId = `SITE${timestamp}`;
    }

    // Check if site with same siteId already exists
    const existingSite = await Site.findOne({ siteId: body.siteId });
    if (existingSite) {
      return NextResponse.json(
        { error: "Site with this ID already exists" },
        { status: 400 }
      );
    }

    const site = new Site({
      ...body,
      createdBy: session.user.sub
    });

    const savedSite = await site.save();

    // Populate references for response
    const populatedSite = await Site.findById(savedSite._id)
      .populate('region', 'name code')
      .populate('manager', 'firstName lastName employeeId');

    return NextResponse.json({
      meta: {
        status: 201,
        message: "Site created successfully"
      },
      data: { site: populatedSite }
    });

  } catch (error) {
    console.error("Error creating site:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};