import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/database/connectToDB";
import ACTIVITYLOG from "@/model/activities";
import { checkAdminAccess } from "@/lib/utils/adminAuth";

// GET /api/admin/activity-logs/stats - Get activity logs statistics
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
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Build date range query
    let dateQuery: any = {};
    if (dateFrom || dateTo) {
      dateQuery.timestamp = {};
      if (dateFrom) dateQuery.timestamp.$gte = new Date(dateFrom);
      if (dateTo) dateQuery.timestamp.$lte = new Date(dateTo);
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateQuery.timestamp = { $gte: thirtyDaysAgo };
    }

    // Get total activity count
    const totalActivities = await ACTIVITYLOG.countDocuments(dateQuery);

    // Get activity by module
    const moduleStats = await ACTIVITYLOG.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: "$module",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get activity by action type
    const actionTypeStats = await ACTIVITYLOG.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: "$actionType",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get activity by status
    const statusStats = await ACTIVITYLOG.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Get most active users
    const userActivityStats = await ACTIVITYLOG.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: {
            userId: "$userId",
            userEmail: "$userEmail"
          },
          count: { $sum: 1 },
          lastActivity: { $max: "$timestamp" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get daily activity trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyTrend = await ACTIVITYLOG.aggregate([
      {
        $match: {
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    // Get security events count
    const securityEventsCount = await ACTIVITYLOG.countDocuments({
      ...dateQuery,
      $or: [
        { actionType: 'authentication' },
        { status: 'error' },
        { action: { $in: ['login', 'logout', 'failed_login', 'password_change', 'data_export'] } }
      ]
    });

    // Get error rate
    const errorCount = await ACTIVITYLOG.countDocuments({
      ...dateQuery,
      status: 'error'
    });

    const errorRate = totalActivities > 0 ? (errorCount / totalActivities) * 100 : 0;

    const stats = {
      totalActivities,
      securityEventsCount,
      errorCount,
      errorRate: Number(errorRate.toFixed(2)),
      moduleDistribution: moduleStats,
      actionTypeDistribution: actionTypeStats,
      statusDistribution: statusStats,
      topUsers: userActivityStats,
      dailyTrend,
      periodStart: dateQuery.timestamp?.$gte || sevenDaysAgo,
      periodEnd: dateQuery.timestamp?.$lte || new Date()
    };

    return NextResponse.json({
      meta: { status: 200 },
      data: { stats }
    });

  } catch (error) {
    console.error("Error fetching activity log statistics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};