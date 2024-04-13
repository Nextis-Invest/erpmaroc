import { NextResponse } from "next/server";

export const GET = async (Request) => {
      try {
            console.log("Get");
            // console.log(posts);
            return new NextResponse(["GET"])
      } catch (error) {
            throw error;
      }
}
export const POST = async (Request) => {
      try {
            console.log("POST");
            return new NextResponse("POST")
      } catch (error) {
            throw error;
      }
}