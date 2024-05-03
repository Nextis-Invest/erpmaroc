import { NextRequest, NextResponse } from "next/server";
import { withMiddlewareAuthRequired } from "@auth0/nextjs-auth0/edge";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

const ratelimit = new Ratelimit({
  redis: kv,
  // 5 requests from the same IP in 10 seconds
  limiter: Ratelimit.slidingWindow(300, "60 s"),
});

export const config = {
  matcher: [
    "/((?!privacy-policy|_next/static|_next/image|favicon.ico|$).*)", //this protect api routes
    // '/((?!api|privacy-policy|_next/static|_next/image|favicon.ico|$).*)', //This doesn't protect api routes
  ],
};

export async function middleware(req, res) {
  console.log("💂💂Middleware");

  const currentTimestamp = Date.now();

  // const ip = req.headers.get("x-forwarded-for");
  // const { success, pending, limit, reset, remaining } = await ratelimit.limit(
  //   ip
  // );

  // if (!success) {
  //   // Set remainingRequests on res.locals
  //   return NextResponse.json({
  //     message: "Request limits exceeded.",
  //     refetch: `Refetch after ${Math.ceil(
  //       (reset - currentTimestamp) / 1000
  //     )}s.`,
  //   });
  // }

  // Proceed to the next middleware or handler
  return NextResponse.next();
}

export default withMiddlewareAuthRequired();
