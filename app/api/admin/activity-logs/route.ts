import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/database/connectToDB";
import ACTIVITYLOG from "@/model/activities";
import { checkAdminAccess } from "@/lib/utils/adminAuth";

// GET /api/admin/activity-logs - Get activity logs with filtering and pagination
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

    // Check admin access
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const userId = searchParams.get("userId");
    const userEmail = searchParams.get("userEmail");
    const action = searchParams.get("action");
    const actionType = searchParams.get("actionType");
    const module = searchParams.get("module");
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const securityOnly = searchParams.get("securityOnly") === "true";

    // Build query
    let query: any = {};

    if (userId) query.userId = userId;
    if (userEmail) query.userEmail = { $regex: userEmail, $options: "i" };
    if (action) query.action = { $regex: action, $options: "i" };
    if (actionType) query.actionType = actionType;
    if (module) query.module = module;
    if (status) query.status = status;

    // Date range filter
    if (dateFrom || dateTo) {
      query.timestamp = {};
      if (dateFrom) query.timestamp.$gte = new Date(dateFrom);
      if (dateTo) query.timestamp.$lte = new Date(dateTo);
    }

    // Security events filter
    if (securityOnly) {
      const securityActions = [
        'login', 'logout', 'failed_login', 'password_change',
        'permission_change', 'user_created', 'user_deleted', 'data_export'
      ];

      query.$or = [
        { action: { $in: securityActions } },
        { actionType: 'authentication' },
        { status: 'error' }
      ];
    }

    // Count total documents
    const total = await ACTIVITYLOG.countDocuments(query);

    // Get activity logs with pagination
    const activityLogs = await ACTIVITYLOG.find(query)
      .populate('userId', 'email firstName lastName')
      .populate('branch', 'companyName cityName')
      .select('-requestBody') // Exclude sensitive request body data by default
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ timestamp: -1 });

    return NextResponse.json({
      meta: {
        status: 200,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      data: { activityLogs }
    });

  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

// POST /api/admin/activity-logs - Create new activity log entry
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

    // Check admin access for creating logs (optional, may be used by system)
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Extract user info from session
    const logData = {
      userId: session.user.sub,
      userEmail: session.user.email,
      userRole: body.userRole || 'employee', // Should be determined from user profile
      action: body.action,
      actionType: body.actionType,
      module: body.module,
      targetType: body.targetType,
      targetId: body.targetId,
      targetDescription: body.targetDescription,
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent'),
      httpMethod: body.httpMethod || 'POST',
      endpoint: body.endpoint,
      status: body.status || 'success',
      errorMessage: body.errorMessage,
      metadata: body.metadata || {},
      branch: body.branch
    };

    const activityLog = await ACTIVITYLOG.createLog(logData);

    return NextResponse.json({
      meta: {
        status: 201,
        message: "Activity log created successfully"
      },
      data: { activityLog: activityLog.toSafeObject() }
    });

  } catch (error) {
    console.error("Error creating activity log:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};