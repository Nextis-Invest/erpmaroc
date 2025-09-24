import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/database/connectToDB";
import { auth } from "@/auth";
import { isValidObjectId } from "mongoose";

const Employee = require("@/model/hr/employee");
const ACTIVITYLOG = require("@/model/activities");

// POST /api/hr/employees/[id]/restore - Restore archived employee (admin only)
export const POST = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;

    await connectToDB();

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // TODO: Add admin role check here
    // For now, allowing restore with warning
    console.warn(`Employee restore requested for ${id} by ${session.user.email}`);

    // Handle both ObjectId and employeeId string formats
    const query = isValidObjectId(id)
      ? { $or: [{ _id: id }, { employeeId: id }] }
      : { employeeId: id };

    const employee = await Employee.findOne({ ...query, isArchived: true });

    if (!employee) {
      return NextResponse.json(
        { error: "Archived employee not found" },
        { status: 404 }
      );
    }

    // Restore employee
    await employee.restore(session.user.sub);

    // Log activity
    const log = new ACTIVITYLOG({
      branch: employee.branch,
      process: "Employee Restored (ADMIN)"
    });
    await log.save();

    return NextResponse.json({
      meta: {
        status: 200,
        message: "Employee restored successfully"
      },
      data: {
        employee: {
          _id: employee._id,
          employeeId: employee.employeeId,
          firstName: employee.firstName,
          lastName: employee.lastName,
          status: employee.status,
          isArchived: employee.isArchived
        }
      }
    });

  } catch (error) {
    console.error("Error restoring employee:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};