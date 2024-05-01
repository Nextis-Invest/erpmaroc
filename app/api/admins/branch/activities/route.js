import { connectToDB } from "@/lib/database/connectToDB";
import ACTIVITYLOG from "@/model/activities";
import { NextResponse } from "next/server";

export const GET = async (req, res) => {
  try {
    const searchParams = req.nextUrl.searchParams;

    // Extract query parameters
    const branch = searchParams.get("branch");

    // Connect to the database
    await connectToDB();
    console.log("🚀 ~ GET ~ ACTIVITIES:", "Branch: ", branch);

    const activities = await ACTIVITYLOG.find({ branch: branch })
      .sort({ timestamp: -1 })
      .limit(20);

    console.log("🚀 ~ GET ~ activities:", activities);

    // Return response
    return NextResponse.json({
      meta: {
        status: 201,
        branchId: branch,
      },
      data: { activities },
    });
  } catch (error) {
    throw error;
  }
};
