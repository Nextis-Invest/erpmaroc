import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDB } from '@/lib/database/connectToDB';
import Employee from '@/model/hr/employee';
import Site from '@/model/site';
import Region from '@/model/region';

// POST /api/hr/employees/[id]/assign-sites - Assign employee to sites within their region
export const POST = async (
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
    const { regionId, siteIds, primarySiteId } = body;

    // Validate input
    if (!regionId || !siteIds || !Array.isArray(siteIds) || siteIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid input. Region and at least one site required." },
        { status: 400 }
      );
    }

    // Find the employee
    const employee = await Employee.findById(id);
    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Verify region exists
    const region = await Region.findById(regionId);
    if (!region) {
      return NextResponse.json(
        { error: "Invalid region" },
        { status: 400 }
      );
    }

    // Verify all sites exist and belong to the region
    const sites = await Site.find({
      _id: { $in: siteIds },
      region: regionId,
      isActive: true
    });

    if (sites.length !== siteIds.length) {
      return NextResponse.json(
        { error: "Some sites are invalid or don't belong to the selected region" },
        { status: 400 }
      );
    }

    // Verify primary site is in the list
    if (primarySiteId && !siteIds.includes(primarySiteId)) {
      return NextResponse.json(
        { error: "Primary site must be one of the assigned sites" },
        { status: 400 }
      );
    }

    // Update employee
    employee.region = regionId;
    employee.sites = siteIds;
    employee.primarySite = primarySiteId || siteIds[0];
    employee.lastModifiedBy = session.user.sub;

    const updatedEmployee = await employee.save();

    // Populate references for response
    const populatedEmployee = await Employee.findById(updatedEmployee._id)
      .populate('region', 'name code')
      .populate('sites', 'name siteId type')
      .populate('primarySite', 'name siteId');

    return NextResponse.json({
      meta: {
        status: 200,
        message: "Employee site assignment updated successfully"
      },
      data: { employee: populatedEmployee }
    });

  } catch (error) {
    console.error("Error assigning employee to sites:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
};

// GET /api/hr/employees/[id]/assign-sites - Get employee's current site assignments
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

    const employee = await Employee.findById(id)
      .populate('region', 'name code')
      .populate('sites', 'name siteId type address')
      .populate('primarySite', 'name siteId type address');

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      meta: {
        status: 200,
        message: "Employee site assignments fetched successfully"
      },
      data: {
        employee: {
          _id: employee._id,
          employeeId: employee.employeeId,
          name: `${employee.firstName} ${employee.lastName}`,
          region: employee.region,
          sites: employee.sites,
          primarySite: employee.primarySite
        }
      }
    });

  } catch (error) {
    console.error("Error fetching employee sites:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};