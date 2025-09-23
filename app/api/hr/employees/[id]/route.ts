import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/database/connectToDB";
import Employee from "@/model/hr/employee";
import ACTIVITYLOG from "@/model/activities";
import { getMockData } from "@/lib/hr/mockData";

// GET /api/hr/employees/[id] - Get employee by ID
export const GET = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const searchParams = req.nextUrl.searchParams;
    const useMockData = searchParams.get("mock") === "true";

    if (useMockData) {
      const employees = getMockData('employees');
      const employee = employees.find((emp: any) => emp._id === id || emp.employeeId === id);

      if (!employee) {
        return NextResponse.json(
          { error: "Employee not found" },
          { status: 404 }
        );
      }

      // Get related data
      const departments = getMockData('departments');
      const teams = getMockData('teams');

      const department = departments.find((dept: any) => dept._id === employee.department);
      const team = teams.find((t: any) => t._id === employee.team);
      const manager = employees.find((emp: any) => emp._id === employee.manager);

      return NextResponse.json({
        meta: { status: 200 },
        data: {
          employee: {
            ...employee,
            department,
            team,
            manager
          }
        }
      });
    }

    await connectToDB();

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const employee = await Employee.findOne({
      $or: [{ _id: id }, { employeeId: id }]
    })
      .populate('department', 'name code description')
      .populate('team', 'name code description')
      .populate('manager', 'firstName lastName employeeId email')
      .populate('branch', 'companyName cityName');

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      meta: { status: 200 },
      data: { employee }
    });

  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

// PUT /api/hr/employees/[id] - Update employee
export const PUT = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const useMockData = body.useMockData;

    if (useMockData) {
      return NextResponse.json({
        meta: {
          status: 200,
          message: "Employee updated successfully (mock mode)"
        },
        data: {
          employee: {
            _id: id,
            ...body,
            updatedAt: new Date()
          }
        }
      });
    }

    await connectToDB();

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const employee = await Employee.findOne({
      $or: [{ _id: id }, { employeeId: id }]
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Update fields
    Object.keys(body).forEach(key => {
      if (key !== 'useMockData') {
        employee[key] = body[key];
      }
    });

    employee.lastModifiedBy = session.user.sub;
    employee.updatedAt = new Date();

    const updatedEmployee = await employee.save();

    // Log activity
    const log = new ACTIVITYLOG({
      branch: updatedEmployee.branch,
      process: "Employee Updated"
    });
    await log.save();

    return NextResponse.json({
      meta: {
        status: 200,
        message: "Employee updated successfully"
      },
      data: { employee: updatedEmployee }
    });

  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

// DELETE /api/hr/employees/[id] - Soft delete employee
export const DELETE = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const searchParams = req.nextUrl.searchParams;
    const useMockData = searchParams.get("mock") === "true";

    if (useMockData) {
      return NextResponse.json({
        meta: {
          status: 200,
          message: "Employee deactivated successfully (mock mode)"
        }
      });
    }

    await connectToDB();

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const employee = await Employee.findOne({
      $or: [{ _id: id }, { employeeId: id }]
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting status to inactive
    employee.status = 'inactive';
    employee.lastWorkingDate = new Date();
    employee.lastModifiedBy = session.user.sub;

    await employee.save();

    // Log activity
    const log = new ACTIVITYLOG({
      branch: employee.branch,
      process: "Employee Deactivated"
    });
    await log.save();

    return NextResponse.json({
      meta: {
        status: 200,
        message: "Employee deactivated successfully"
      }
    });

  } catch (error) {
    console.error("Error deactivating employee:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};