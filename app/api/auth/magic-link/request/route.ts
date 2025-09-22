import { NextResponse } from "next/server";
import { Resend } from "resend";
import { connectToDB } from "@/lib/database/connectToDB";
import ADMIN from "@/model/admin";
import MagicLinkToken from "@/model/magicLinkToken";
import { generateSecureToken } from "@/lib/tokenGenerator";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDB();

    // Check if user exists
    const user = await ADMIN.findOne({ email: email.toLowerCase() });

    if (!user) {
      // For security, we don't reveal if the user exists or not
      return NextResponse.json(
        { message: "Si un compte existe avec cet email, un lien magique a été envoyé." },
        { status: 200 }
      );
    }

    // Generate secure token
    const token = generateSecureToken();

    // Delete any existing tokens for this email
    await MagicLinkToken.deleteMany({ email: email.toLowerCase() });

    // Create new token
    await MagicLinkToken.create({
      email: email.toLowerCase(),
      token,
      createdAt: new Date(),
    });

    // Create magic link URL
    const magicLink = `${process.env.NEXTAUTH_URL}/api/auth/magic-link/verify?token=${token}`;

    // Send magic link email
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: email,
        subject: "Votre lien magique pour ERP Maroc",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
              <div style="max-width: 600px; margin: 40px auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">ERP Maroc</h1>
                </div>

                <div style="padding: 40px 30px;">
                  <h2 style="color: #333; margin: 0 0 10px 0; font-size: 24px;">Connectez-vous à votre compte</h2>
                  <p style="color: #666; font-size: 16px; line-height: 1.5; margin: 20px 0;">
                    Cliquez sur le bouton ci-dessous pour vous connecter à votre compte ERP Maroc. Ce lien magique expirera dans 15 minutes.
                  </p>

                  <div style="margin: 35px 0; text-align: center;">
                    <a href="${magicLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                      Se connecter à ERP Maroc
                    </a>
                  </div>

                  <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 30px 0;">
                    <p style="color: #666; font-size: 14px; margin: 0; line-height: 1.5;">
                      <strong>Avis de sécurité :</strong> Si vous n'avez pas demandé cet email, vous pouvez l'ignorer en toute sécurité. Le lien expirera automatiquement.
                    </p>
                  </div>

                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
                    <p style="color: #999; font-size: 13px; margin: 0; text-align: center;">
                      Ou copiez et collez ce lien dans votre navigateur :
                    </p>
                    <p style="color: #666; font-size: 12px; margin: 10px 0 0 0; word-break: break-all; text-align: center;">
                      ${magicLink}
                    </p>
                  </div>
                </div>

                <div style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #e5e5e5;">
                  <p style="color: #999; font-size: 12px; margin: 0; text-align: center;">
                    Cet email a été envoyé depuis ${process.env.EMAIL_FROM || "ERP Maroc"}
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return NextResponse.json(
        { error: "Failed to send magic link email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Si un compte existe avec cet email, un lien magique a été envoyé." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Magic link request error:", error);
    return NextResponse.json(
      { error: "Failed to process magic link request" },
      { status: 500 }
    );
  }
}