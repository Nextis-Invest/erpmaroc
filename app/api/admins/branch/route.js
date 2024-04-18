import BRANCH from "@/model/branchData";
import ADMIN from "@/model/admin";
import { NextResponse, NextRequest } from "next/server";

import { connectToDB } from "@/lib/database/connectToDB";


export const POST = async (Request) => {
  try {
    const body = await Request.json();
    const { companyName, countryName, stateName, cityName, streetName, websiteUrl, email, branchemail, phone } = body;
    console.log(
      "😐",
      companyName,
      countryName,
      stateName,
      cityName,
      streetName,
      websiteUrl,
      email,
      phone,
      branchemail
    );
    await connectToDB();
    const admin = await ADMIN.findOne({ email:email });

    if (!admin) {
      return NextResponse.json(
        { error: "Admin doesn't exist." },
        { status: 404 }
      );
    }
    const newBranch = new BRANCH({
      companyName: companyName,
      cityName: cityName,
      countryName: countryName,
      email: branchemail,
      phone: phone,
      stateName: stateName,
      streetName: streetName,
      websiteUrl: websiteUrl,
      manager: email, 
    });
    const b = await newBranch.save();

    console.log(b)
    return new NextResponse(b);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
