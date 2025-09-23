import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/database/connectToDB";
import ADMIN from "@/model/admin";
import MagicLinkToken from "@/model/magicLinkToken";

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

    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - magicLinkToken.createdAt.getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (tokenAge > maxAge) {
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

    // Don't mark token as used here - let the credentials provider handle it
    // Redirect to the client-side callback page to handle authentication
    return NextResponse.redirect(
      new URL(`/auth/magic-link-callback?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`, request.url)
    );
  } catch (error) {
    console.error("Magic link verification error:", error);
    return NextResponse.redirect(
      new URL("/login?error=verification-failed", request.url)
    );
  }
}