///// Get record Data with pagination

import { connectToDB } from "@/lib/database/connectToDB";
import RECORD from "@/model/record";
import { NextResponse } from "next/server";

//// `/api/admins/branch/record?branch=${branch}&page=${page}&limit=${limit}`
export const GET = async (req, res) => {
    try {
      const searchParams = req.nextUrl.searchParams;
  
      // Extract query parameters
      const search = searchParams.get("search");
      const branch = searchParams.get("branch");
      const page = searchParams.get("page");
      const limit = searchParams.get("limit");
  
      // Connect to the database
      await connectToDB();
      console.log(
        "🚀 ~ GET ~ search:",
        search,
        "Branch: ",
        branch,
        "Page:",
        page,
        "limit:",
        limit
      );
  
      // Count total documents
      const totalRecords = await RECORD.countDocuments({ branch });
  
      // Validate pagination
      if ((page - 1) * limit > totalRecords) {
        return NextResponse.json({
          status: "204",
          message: "Failed to retrieve product data.",
          errorCode: 204,
          details: {
            error: "Product doesn't exist",
          },
        });
      }
  
      // Construct query
      let query = { branch };
      if (search) {
        query = {
          $and: [
            { branch },
            {
              $or: [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
                { notes: { $regex: search, $options: "i" } },
              ],
            },
          ],
        };
      }
  
      const products = await RECORD.find(query).populate({
        path: "branch",
        select: "companyName -_id",
      })
        .skip(search ? 0 : (page - 1 ) * limit)
        .limit(search ? undefined : parseInt(limit));
  
      console.log("🚀 ~ GET ~ query:", query);
  
      // Return response
      return NextResponse.json({
        meta: {
          status: 201,
          message:
            "If this was a search operation, page and limit will be neglected.",
          ...(!search == undefined && { page: page }),
          ...(!search == undefined && { count: limit }),
          totalRecords,
          branchId: branch,
        },
        data: { products },
      });
    } catch (error) {
      throw error;
    }
  };