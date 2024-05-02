import { connectToDB } from "@/lib/database/connectToDB";
import ADMIN from "@/model/admin";
import { NextResponse, NextRequest } from "next/server";

export const GET = async (NextRequest) => {
  const ip = NextRequest.headers.get("x-forwarded-for");
  console.log("🚀 ~ GET ~ ip:", ip)

  // Check if the user is authenticated

  try {
    const searchParams = NextRequest.nextUrl.searchParams;
    const mail = searchParams.get("email");

    await connectToDB();
    const admin = await ADMIN.findOne({ email: mail });
    return new NextResponse([admin]);
  } catch (error) {
    throw error;
  }
};

export const PUT = async (NextRequest, NextResponse) => {
  try {
    const searchParams = NextRequest.nextUrl.searchParams;
    const mail = searchParams.get("email");

    await connectToDB();
    const admin = await ADMIN.findOne({ email: mail });
    return new NextResponse([admin]);
  } catch (error) {
    throw error;
  }
};

export const POST = async (Request)=>{
  try {
        const body = await Request.json();
        const {name,country,state,city,street,website,email,phone} = body;
        console.log("😐",name, country,state,city,street,website,email,phone)
        await connectToDB()
        // const createdPost = await post.create({title: title, id: id, content: content})
        // return new NextResponse(createdPost)
        return new NextResponse(name, country,state,city,street,website,email,phone)
        // return new NextResponse({title: createdPost.title, content: createPortal.content})
        
  } catch (error) {
        console.log(error);
        throw error;
  }
}
