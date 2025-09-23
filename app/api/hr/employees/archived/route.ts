import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/db/connectToDB";
import { auth } from "@/auth";

const Employee = require("@/model/hr/employee");

// GET /api/hr/employees/archived - Get archived employees (admin only)
export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    await connectToDB();

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // TODO: Add admin role check here
    console.warn(`Archived employees access by ${session.user.email}`);

    // Build search query
    const searchQuery: any = { isArchived: true };

    if (search) {
      searchQuery.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get archived employees with pagination
    const [employees, total] = await Promise.all([
      Employee.find(searchQuery)
        .select('employeeId firstName lastName email position department status isArchived archivedAt archivedBy archiveReason')
        .populate('department', 'name')
        .populate('archivedBy', 'name email')
        .sort({ archivedAt: -1 })
        .skip(skip)
        .limit(limit),
      Employee.countDocuments(searchQuery)
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      meta: {
        status: 200,
        message: "Archived employees retrieved successfully",
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      data: {
        employees: employees.map((emp: any) => ({
          _id: emp._id,
          employeeId: emp.employeeId,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          position: emp.position,
          department: emp.department,
          status: emp.status,
          isArchived: emp.isArchived,
          archivedAt: emp.archivedAt,
          archivedBy: emp.archivedBy,
          archiveReason: emp.archiveReason
        }))
      }
    });

  } catch (error) {
    console.error("Error fetching archived employees:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};