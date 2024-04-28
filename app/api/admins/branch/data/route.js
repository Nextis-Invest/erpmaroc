import { connectToDB } from "@/lib/database/connectToDB";
import RECORD from "@/model/record";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

////////    api/admins/branch/data?id="_id"
export const GET = async (req, Request, Response) => {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");
    const branchId = new mongoose.Types.ObjectId(id);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // Adding 1 since January is 0-indexed

  // Construct the start date of the current year (January 1st)
  const startDate = new Date(currentYear, 0, 1); // Month is 0-indexed, so January is 0

  // Construct the end date of the current month (e.g., April 30th)
  const endDate = new Date(
    currentYear,
    currentMonth - 1,
    currentDate.getDate()
  ); // Subtracting 1 from currentMonth to get the correct index

  console.log(
    "📊 ~ GET ~ Summerizing data:",
    branchId,
    currentDate,
    currentYear,
    currentMonth,
    startDate,
    endDate
  );

  try {
    await connectToDB();

    // const branchData = await RECORD.aggregate([{$match: {
    //     branch: branchId
    // }}])

    const branchData = await RECORD.aggregate([
      {
        $match: {
          branch: branchId, // Filter by branch _id
        //   branch: branchId, // Filter by branch _id
        //   branch: branchObjectId, // Filter by branch _id
        //   branch: mongoose.Types.ObjectId(branchId), // Filter by branch _id
          date: { $gte: startDate, $lte: endDate }, // Filter records for the current year and up to the current month
        },
      },
      {
        $group: {
          _id: { $month: "$date" }, // Group by month
          totalRecords: { $sum: 1 }, // Count total records
          totalSales: { $sum: "$totalPrice" }, // Sum totalPrice
        },
      },
      {
        $project: {
          _id: 0, // Exclude _id field
          month: "$_id", // Rename _id to month
          totalRecords: 1,
          totalSales: 1,
        },
      },
    ]);
    console.log("🚀 ~ GET ~ branchData:", branchData);

    if (!branchData) {
      return NextResponse.json({
        status: "204",
        message: "Failed to retrieve branch data",
        errorCode: 204,
        details: {
          error: "Branch doesn't exist",
        },
      });
    }
    return NextResponse.json({
      meta: {
        status: 201,
        manager: branchData?.manager,
        branchId: branchData._id,
      },
      data: {
        branchData,
      },
    });
  } catch (error) {
    throw error;
  }
};
