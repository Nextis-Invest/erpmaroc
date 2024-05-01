import { connectToDB } from "@/lib/database/connectToDB";
import { generateRandomString } from "@/lib/keyGenerator";
import BRANCH from "@/model/branchData";
import { NextResponse } from "next/server";

//////////  /api/admins/branch/node
export const PATCH = async (Request) => {
  try {
    const body = await Request.json();
    const { _id, key } = body;
    console.log("🗝️ Adding branch", _id, key);
    await connectToDB();
    const childBranch = await BRANCH.findOne({ keys: { $elemMatch: { key: key } } });
    console.log("🚀 ~ PATCH ~ childBranch:", childBranch)

    if (!childBranch) {
      return NextResponse.json({ error: "There is no branch." }, { status: 401 });
    }

    if(_id == childBranch._id){
      return NextResponse.json(
        { error: "Sub-branch can't add itself." },
        { status: 404 }
      );
    }

    const updatedBranch = await BRANCH.findOneAndUpdate(
      {_id: _id},
      { $push: { childBranch: childBranch._id } },
      { new: true }
    );
    console.log("🚀 ~ PATCH ~ updatedBranch:", updatedBranch);

    if (!updatedBranch) {
      return NextResponse.json(
        { error: "Branch with updated key not found." },
        { status: 404 }
      );
    }
    const log = new ActivityLog({
      branch: _id,
      process: "Branch Added"
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
        message: "Internal Server Error in adding child branch route while updating",
        error: error,
      },
      { status: 500 }
    );
  }
};


