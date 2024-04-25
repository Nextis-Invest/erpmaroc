import BRANCH from "@/model/branchData";
import { NextResponse } from "next/server";

export const GET = async (req, Request, Response) => {
  const searchParams = req.nextUrl.searchParams;
  const managerEmail = searchParams.get("email");

  try {
    await connectToDB();
    const branch = await BRANCH.findOne({ manager: managerEmail });

    if (!branch) {
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
        branch: branch.companyName,
        branchId: branch._id,
      },
      data: {
        branch,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const PATCH = async (Request) => {
  try {
    const body = await Request.json();
    const { _id, name, description } = body;
    console.log("🗝️ Adding KEY", _id, name, description);
    await connectToDB();
    const existingBranch = await BRANCH.findOne({ _id: _id });
    // console.log("🚀 ~ PATCH ~ existingBranch:", existingBranch)

    if (!existingBranch) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const key = {};

    const updatedBranch = await BRANCH.findOneAndUpdate(
      { manager: managerEmail },
      { $push: { key: key } },
      { new: true }
    );
    console.log("🚀 ~ PATCH ~ updateFields:", updateFields);
    console.log("🚀 ~ PATCH ~ updatedBranch:", updatedBranch);

    if (!updatedBranch) {
      return NextResponse.json({ error: "Branch not found." }, { status: 404 });
    }

    return NextResponse.json({
      meta: {
        status: 201,
        manager: updatedBranch.manager,
        branchId: updatedBranch._id,
      },
      data: { updatedBranch },
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
