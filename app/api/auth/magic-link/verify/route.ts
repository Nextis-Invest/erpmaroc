import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/database/connectToDB";
import ADMIN from "@/model/admin";
import MagicLinkToken from "@/model/magicLinkToken";
import { signIn } from "@/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/login?error=invalid-token", request.url)
      );
    }

    // Connect to database
    await connectToDB();

    // Find and validate token
    const magicLinkToken = await MagicLinkToken.findOne({
      token,
      used: false
    });

    if (!magicLinkToken) {
      return NextResponse.redirect(
        new URL("/login?error=expired-token", request.url)
      );
    }

    // Find user
    const user = await ADMIN.findOne({ email: magicLinkToken.email });

    if (!user) {
      return NextResponse.redirect(
        new URL("/login?error=user-not-found", request.url)
      );
    }

    // Mark token as used
    magicLinkToken.used = true;
    await magicLinkToken.save();

    // Create session using NextAuth
    // Since we can't directly create a session from an API route,
    // we'll redirect to a special callback page that will handle the sign-in
    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/auth/magic-link/callback?email=${encodeURIComponent(user.email)}&token=${token}`;

    return NextResponse.redirect(callbackUrl);
  } catch (error) {
    console.error("Magic link verification error:", error);
    return NextResponse.redirect(
      new URL("/login?error=verification-failed", request.url)
    );
  }
}