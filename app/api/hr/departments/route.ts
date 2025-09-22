import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { connectToDB } from "@/lib/database/connectToDB";
import Department from "@/model/hr/department";
import Employee from "@/model/hr/employee";
import ACTIVITYLOG from "@/model/activities";
import { getMockData } from "@/lib/hr/mockData";

// GET /api/hr/departments - List departments
export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const useMockData = searchParams.get("mock") === "true";

    if (useMockData) {
      const departments = getMockData('departments');
      const employees = getMockData('employees');

      // Add employee count to each department
      const departmentsWithCounts = departments.map((dept: any) => ({
        ...dept,
        employeeCount: employees.filter((emp: any) => emp.department === dept._id).length
      }));

      return NextResponse.json({
        meta: { status: 200, total: departments.length },
        data: { departments: departmentsWithCounts }
      });
    }

    await connectToDB();

    const res = new NextResponse();
    const session = await getSession(res);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const departments = await Department.find({ status: 'active' })
      .populate('head', 'firstName lastName employeeId')
      .populate('parentDepartment', 'name code')
      .sort({ name: 1 });

    // Get employee count for each department
    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const employeeCount = await Employee.countDocuments({
          department: dept._id,
          status: 'active'
        });
        return {
          ...dept.toObject(),
          employeeCount
        };
      })
    );

    return NextResponse.json({
      meta: { status: 200, total: departments.length },
      data: { departments: departmentsWithCounts }
    });

  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

// POST /api/hr/departments - Create department
export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const useMockData = body.useMockData;

    if (useMockData) {
      const newDepartment = {
        _id: new Date().getTime().toString(),
        ...body,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return NextResponse.json({
        meta: {
          status: 201,
          message: "Department created successfully (mock mode)"
        },
        data: { department: newDepartment }
      });
    }

    await connectToDB();

    const res = new NextResponse();
    const session = await getSession(res);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if department code already exists
    const existingDept = await Department.findOne({ code: body.code });
    if (existingDept) {
      return NextResponse.json(
        { error: "Department code already exists" },
        { status: 400 }
      );
    }

    const department = new Department({
      ...body,
      createdBy: session.user.sub
    });

    const savedDepartment = await department.save();

    // Log activity
    const log = new ACTIVITYLOG({
      branch: savedDepartment.branch,
      process: "Department Created"
    });
    await log.save();

    return NextResponse.json({
      meta: {
        status: 201,
        message: "Department created successfully"
      },
      data: { department: savedDepartment }
    });

  } catch (error) {
    console.error("Error creating department:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};