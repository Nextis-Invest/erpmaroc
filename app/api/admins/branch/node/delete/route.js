import { connectToDB } from "@/lib/database/connectToDB";
import BRANCH from "@/model/branchData";
import { NextResponse } from "next/server";

export const PATCH = async (Request) => {
    try {
      const body = await Request.json();
      const { _id, branchId } = body;
      console.log("🧩 removing Node", _id, branchId);
      await connectToDB();
  

  
      const updatedBranch = await BRANCH.findOneAndUpdate(
        {_id: branchId},
        { $pull: { childBranch: _id } },
        { new: true }
      );
      console.log("🚀 ~ PATCH ~ updatedBranch:", updatedBranch);
  
      if (!updatedBranch) {
        return NextResponse.json(
          { error: "Branch with deleted key not found." },
          { status: 404 }
        );
      }
  
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
  