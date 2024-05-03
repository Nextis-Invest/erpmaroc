// import { getAccessToken } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";
import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge'
import { getAccessToken } from "@auth0/nextjs-auth0/edge";

export const config = {
    matcher: [
        '/((?!privacy-policy|_next/static|_next/image|favicon.ico|$).*)', //this protect api routes
        // '/((?!api|privacy-policy|_next/static|_next/image|favicon.ico|$).*)', //This doesn't protect api routes
    ]
}


export async function middleware(req){
    const res = new NextResponse();
    // console.log("🚀 ~ middleware ~ res:", res)
    // const { accessToken } = await getAccessToken(req, res);
    // console.log("🚀 ~ middleware ~ accessToken:", accessToken)
    console.log("💂💂Middleware")
    // console.log("🚀 ~ middleware ~ res:", req)
    return NextResponse.next()
}



export default withMiddlewareAuthRequired()


