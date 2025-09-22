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

    // Mark token as used before attempting sign-in
    magicLinkToken.used = true;
    await magicLinkToken.save();

    // Use NextAuth v5 direct sign-in with magic link credentials
    try {
      const result = await signIn("magic-link", {
        email: user.email,
        token: token,
        redirect: false
      });

      if (result?.error) {
        console.error("NextAuth sign-in error:", result.error);
        return NextResponse.redirect(
          new URL("/login?error=sign-in-failed", request.url)
        );
      }

      // Successful sign-in, redirect to dashboard
      return NextResponse.redirect(new URL("/", request.url));
    } catch (signInError) {
      console.error("Sign-in process error:", signInError);
      return NextResponse.redirect(
        new URL("/login?error=auth-failed", request.url)
      );
    }
  } catch (error) {
    console.error("Magic link verification error:", error);
    return NextResponse.redirect(
      new URL("/login?error=verification-failed", request.url)
    );
  }
}