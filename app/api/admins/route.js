import { connectToDB } from "@/lib/database/connectToDB";
import ADMIN from "@/model/admin";
import { NextResponse, NextRequest } from "next/server";


//// TODO Rate Limiting (Optional)

export const GET = async (NextRequest) => {
  const ip = NextRequest.headers.get("x-forwarded-for");
  console.log("🚀 ~ GET ~ ip:", ip)
  try {
    const searchParams = NextRequest.nextUrl.searchParams;
    const mail = searchParams.get("email");
    console.log("🚀 ~ GET ~ mail:", mail)

    await connectToDB();
    const admin = await ADMIN.findOne({ email: mail });
    return new NextResponse([admin]);
  } catch (error) {
    throw error;
  }
};
// export const GET = async (Request) => {
//     try {

//           // console.log(posts);
//           return new NextResponse(["GET IT"])
//     } catch (error) {
//           throw error;
//     }
// }

