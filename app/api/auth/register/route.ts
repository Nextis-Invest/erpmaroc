import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { Resend } from "resend"
import { connectToDB } from "@/lib/database/connectToDB"
import ADMIN from "@/model/admin"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, password, company, phone } = await request.json()

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !company) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Connect to database
    await connectToDB()

    // Check if user already exists
    const existingUser = await ADMIN.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const newUser = await ADMIN.create({
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      company,
      phone,
      role: "admin",
      createdAt: new Date(),
    })

    // Send welcome email using the EMAIL_FROM environment variable
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: email,
        subject: "Bienvenue chez ERP Maroc",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Bienvenue chez ERP Maroc, ${firstName} !</h2>
            <p>Merci d'avoir créé un compte chez nous. Votre compte a été créé avec succès.</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #555;">Détails du compte :</h3>
              <p><strong>Nom :</strong> ${firstName} ${lastName}</p>
              <p><strong>Email :</strong> ${email}</p>
              <p><strong>Entreprise :</strong> ${company}</p>
              ${phone ? `<p><strong>Téléphone :</strong> ${phone}</p>` : ""}
            </div>
            <p>Vous pouvez maintenant vous connecter à votre compte et commencer à gérer votre entreprise plus efficacement.</p>
            <div style="margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/login" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Se connecter à votre compte
              </a>
            </div>
            <p style="color: #888; font-size: 14px;">Si vous n'avez pas créé de compte, veuillez ignorer cet email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #888; font-size: 12px;">Cet email a été envoyé depuis ${process.env.EMAIL_FROM || "ERP Maroc"}. Merci de ne pas répondre à cet email.</p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error("Email sending failed:", emailError)
      // Continue with registration even if email fails
    }

    return NextResponse.json(
      {
        message: "Inscription réussie",
        user: {
          id: newUser._id.toString(),
          email: newUser.email,
          name: newUser.name,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "L'inscription a échoué. Veuillez réessayer." },
      { status: 500 }
    )
  }
}