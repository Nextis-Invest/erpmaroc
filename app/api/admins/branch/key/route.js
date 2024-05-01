import { connectToDB } from "@/lib/database/connectToDB";
import { generateRandomString } from "@/lib/keyGenerator";
import BRANCH from "@/model/branchData";
import { NextResponse } from "next/server";

//////////  /api/admins/branch/key
export const PATCH = async (Request) => {
  try {
    const body = await Request.json();
    const { _id, name, description } = body;
    console.log("🗝️ Adding KEY", _id, name, description);
    await connectToDB();
    const existingBranch = await BRANCH.findById({ _id });
    // console.log("🚀 ~ PATCH ~ existingBranch:", existingBranch)

    if (!existingBranch) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const generateKey = generateRandomString(20);

    const key = {
      name: name,
      description: description,
      key: generateKey
    };

    const updatedBranch = await BRANCH.findOneAndUpdate(
      {_id: _id},
      { $push: { keys: key } },
      { new: true }
    );
    console.log("🚀 ~ PATCH ~ updatedBranch:", updatedBranch);

    if (!updatedBranch) {
      return NextResponse.json(
        { error: "Branch with updated key not found." },
        { status: 404 }
      );
    }
    const log = new ACTIVITYLOG({
      branch: _id,
      process: "New Key Generated"
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
        message: "Internal Server Error in Branch route while updating",
        error: error,
      },
      { status: 500 }
    );
  }
};


