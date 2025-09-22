import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/database/connectToDB";
import Employee from "@/model/hr/employee";
import Department from "@/model/hr/department";
import Team from "@/model/hr/team";
import BRANCH from "@/model/branchData";
import ACTIVITYLOG from "@/model/activities";
import { getMockData } from "@/lib/hr/mockData";

// GET /api/hr/employees - List employees with pagination and search
export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const department = searchParams.get("department");
    const team = searchParams.get("team");
    const status = searchParams.get("status") || "active";
    const useMockData = searchParams.get("mock") === "true";

    // Use mock data if requested
    if (useMockData) {
      let employees = getMockData('employees');

      // Apply filters
      if (search) {
        employees = employees.filter((emp: any) =>
          emp.firstName.toLowerCase().includes(search.toLowerCase()) ||
          emp.lastName.toLowerCase().includes(search.toLowerCase()) ||
          emp.employeeId.toLowerCase().includes(search.toLowerCase()) ||
          emp.email.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (department) {
        employees = employees.filter((emp: any) => emp.department === department);
      }

      if (team) {
        employees = employees.filter((emp: any) => emp.team === team);
      }

      if (status) {
        employees = employees.filter((emp: any) => emp.status === status);
      }

      // Apply pagination
      const total = employees.length;
      const startIndex = (page - 1) * limit;
      const paginatedEmployees = employees.slice(startIndex, startIndex + limit);

      return NextResponse.json({
        meta: {
          status: 200,
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        data: { employees: paginatedEmployees }
      });
    }

    // Database operations (for when models are connected)
    await connectToDB();

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Build query
    let query: any = { status };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (department) {
      query.department = department;
    }

    if (team) {
      query.team = team;
    }

    // Count total documents
    const total = await Employee.countDocuments(query);

    // Get employees with pagination
    const employees = await Employee.find(query)
      .populate('department', 'name code')
      .populate('team', 'name code')
      .populate('manager', 'firstName lastName employeeId')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return NextResponse.json({
      meta: {
        status: 200,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      data: { employees }
    });

  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

// POST /api/hr/employees - Create new employee
export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const useMockData = body.useMockData;

    if (useMockData) {
      // Simulate creating an employee with mock data
      const newEmployeeId = `EMP${String(Date.now()).slice(-3).padStart(3, '0')}`;
      const newEmployee = {
        _id: new Date().getTime().toString(),
        employeeId: newEmployeeId,
        ...body,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return NextResponse.json({
        meta: {
          status: 201,
          message: "Employee created successfully (mock mode)"
        },
        data: { employee: newEmployee }
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

    // Generate employee ID
    const employeeCount = await Employee.countDocuments();
    const employeeId = `EMP${String(employeeCount + 1).padStart(3, '0')}`;

    // Create new employee
    const employee = new Employee({
      ...body,
      employeeId,
      createdBy: session.user.sub
    });

    const savedEmployee = await employee.save();

    // Log activity
    const log = new ACTIVITYLOG({
      branch: savedEmployee.branch,
      process: "Employee Added"
    });
    await log.save();

    return NextResponse.json({
      meta: {
        status: 201,
        message: "Employee created successfully"
      },
      data: { employee: savedEmployee }
    });

  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};