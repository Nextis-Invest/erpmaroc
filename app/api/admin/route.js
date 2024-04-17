import { connectToDB } from "@/lib/database/connectToDB";
import ADMIN from "@/model/admin";
import { NextResponse } from "next/server";

export const GET = async (Request) => {
    try {
          console.log("Get");
          await connectToDB()
          const admin = await ADMIN.find({})
          console.log(admin);
          return new NextResponse([admin])
    } catch (error) {
          throw error;
    }
}
// export const GET = async (Request) => {
//     try {

//           // console.log(posts);
//           return new NextResponse(["GET IT"])
//     } catch (error) {
//           throw error;
//     }
// }