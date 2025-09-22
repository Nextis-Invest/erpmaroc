import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/database/connectToDB";
import LeaveRequest from "@/model/hr/leaveRequest";
import LeaveType from "@/model/hr/leaveType";
import Employee from "@/model/hr/employee";
import ACTIVITYLOG from "@/model/activities";
import { getMockData } from "@/lib/hr/mockData";

// GET /api/hr/leave-requests - List leave requests
export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const employeeId = searchParams.get("employeeId");
    const approverId = searchParams.get("approverId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const useMockData = searchParams.get("mock") === "true";

    if (useMockData) {
      let leaveRequests = getMockData('leaveRequests');
      const employees = getMockData('employees');
      const leaveTypes = getMockData('leaveTypes');

      // Apply filters
      if (status) {
        leaveRequests = leaveRequests.filter((req: any) => req.status === status);
      }

      if (employeeId) {
        leaveRequests = leaveRequests.filter((req: any) => req.employee === employeeId);
      }

      if (approverId) {
        leaveRequests = leaveRequests.filter((req: any) =>
          req.approvalLevels.some((level: any) => level.approver === approverId)
        );
      }

      // Add related data
      const enrichedRequests = leaveRequests.map((req: any) => ({
        ...req,
        employee: employees.find((emp: any) => emp._id === req.employee),
        leaveType: leaveTypes.find((type: any) => type._id === req.leaveType)
      }));

      // Apply pagination
      const total = enrichedRequests.length;
      const startIndex = (page - 1) * limit;
      const paginatedRequests = enrichedRequests.slice(startIndex, startIndex + limit);

      return NextResponse.json({
        meta: {
          status: 200,
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        data: { leaveRequests: paginatedRequests }
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

    // Build query
    let query: any = {};

    if (status) {
      query.status = status;
    }

    if (employeeId) {
      query.employee = employeeId;
    }

    if (approverId) {
      query['approvalLevels.approver'] = approverId;
    }

    const total = await LeaveRequest.countDocuments(query);

    const leaveRequests = await LeaveRequest.find(query)
      .populate('employee', 'firstName lastName employeeId email')
      .populate('leaveType', 'name code description')
      .populate('approvalLevels.approver', 'firstName lastName employeeId')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ requestDate: -1 });

    return NextResponse.json({
      meta: {
        status: 200,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      data: { leaveRequests }
    });

  } catch (error) {
    console.error("Error fetching leave requests:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

// POST /api/hr/leave-requests - Create leave request
export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const useMockData = body.useMockData;

    if (useMockData) {
      const requestId = `LR${String(Date.now()).slice(-3).padStart(3, '0')}`;
      const newRequest = {
        _id: new Date().getTime().toString(),
        requestId,
        ...body,
        status: 'pending',
        requestDate: new Date(),
        lastModified: new Date()
      };

      return NextResponse.json({
        meta: {
          status: 201,
          message: "Leave request submitted successfully (mock mode)"
        },
        data: { leaveRequest: newRequest }
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

    // Generate request ID
    const requestId = await LeaveRequest.generateRequestId();

    // Get employee and leave type details
    const employee = await Employee.findById(body.employee);
    const leaveType = await LeaveType.findById(body.leaveType);

    if (!employee || !leaveType) {
      return NextResponse.json(
        { error: "Invalid employee or leave type" },
        { status: 400 }
      );
    }

    // Check eligibility
    if (!employee.isEligibleForLeave(leaveType)) {
      return NextResponse.json(
        { error: "Employee not eligible for this leave type" },
        { status: 400 }
      );
    }

    // Calculate number of days
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const numberOfDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    // Create leave request
    const leaveRequest = new LeaveRequest({
      ...body,
      requestId,
      numberOfDays: body.isHalfDay ? numberOfDays * 0.5 : numberOfDays,
      status: 'pending',
      approvalLevels: [
        {
          level: 1,
          approver: employee.manager,
          status: 'pending'
        }
      ],
      createdBy: employee._id
    });

    // Check for overlapping requests
    const hasOverlap = await leaveRequest.hasOverlap();
    if (hasOverlap) {
      return NextResponse.json(
        { error: "Leave request overlaps with existing request" },
        { status: 400 }
      );
    }

    const savedRequest = await leaveRequest.save();

    // Log activity
    const log = new ACTIVITYLOG({
      branch: employee.branch,
      process: "Leave Request Submitted"
    });
    await log.save();

    return NextResponse.json({
      meta: {
        status: 201,
        message: "Leave request submitted successfully"
      },
      data: { leaveRequest: savedRequest }
    });

  } catch (error) {
    console.error("Error creating leave request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};