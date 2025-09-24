import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDB } from '@/lib/database/connectToDB';
import Site from '@/model/site';
import Region from '@/model/region';

// GET /api/sites/[id] - Get site by ID
export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    const site = await Site.findById(id)
      .populate('region', 'name code')
      .populate('manager', 'firstName lastName employeeId');

    if (!site) {
      return NextResponse.json(
        { error: "Site not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      meta: {
        status: 200,
        message: "Site fetched successfully"
      },
      data: { site }
    });

  } catch (error) {
    console.error("Error fetching site:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

// PUT /api/sites/[id] - Update site
export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await req.json();

    // Verify region exists if provided
    if (body.region) {
      const region = await Region.findById(body.region);
      if (!region) {
        return NextResponse.json(
          { error: "Invalid region ID" },
          { status: 400 }
        );
      }
    }

    const updatedSite = await Site.findByIdAndUpdate(
      id,
      {
        ...body,
        lastModifiedBy: session.user.sub,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('region', 'name code')
     .populate('manager', 'firstName lastName employeeId');

    if (!updatedSite) {
      return NextResponse.json(
        { error: "Site not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      meta: {
        status: 200,
        message: "Site updated successfully"
      },
      data: { site: updatedSite }
    });

  } catch (error) {
    console.error("Error updating site:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

// DELETE /api/sites/[id] - Delete site (soft delete)
export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admin can delete sites
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { id } = params;

    // Check if site has employees
    const Employee = require('@/model/hr/employee');
    const employeeCount = await Employee.countDocuments({
      $or: [
        { primarySite: id },
        { sites: id }
      ],
      isArchived: false
    });

    if (employeeCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete site with ${employeeCount} active employees. Please reassign employees first.` },
        { status: 400 }
      );
    }

    // Soft delete the site
    const deletedSite = await Site.findByIdAndUpdate(
      id,
      {
        isActive: false,
        lastModifiedBy: session.user.sub,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!deletedSite) {
      return NextResponse.json(
        { error: "Site not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      meta: {
        status: 200,
        message: "Site deleted successfully"
      },
      data: { site: deletedSite }
    });

  } catch (error) {
    console.error("Error deleting site:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};