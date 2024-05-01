import { connectToDB } from "@/lib/database/connectToDB";
import BRANCH from "@/model/branchData";
import { NextResponse } from "next/server";

export const PATCH = async (Request) => {
    try {
      const body = await Request.json();
      const { _id, branchId } = body;
      console.log("🗝️ Deleting KEY", _id, branchId);
      await connectToDB();
  

  
      const updatedBranch = await BRANCH.findOneAndUpdate(
        {_id: branchId},
        { $pull: { keys: {_id: _id} } },
        { new: true }
      );
      console.log("🚀 ~ PATCH ~ updatedBranch:", updatedBranch);
  
      if (!updatedBranch) {
        return NextResponse.json(
          { error: "Branch with deleted key not found." },
          { status: 404 }
        );
      }

      const log = new ACTIVITYLOG({
        branch: branchId,
        process: "Key Removed"
      })

      const createdLog = await log.save();
  
      return NextResponse.json({
        meta: {
          status: 201,
          branch: updatedBranch.companyName,
          branchId: updatedBranch._id,
        },
        data: updatedBranch,
      });
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        {
          message: "Internal Server Error in delete key route while updating",
          error: error,
        },
        { status: 500 }
      );
    }
  };
  