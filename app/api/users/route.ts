import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/database/connectToDB';
import ADMIN from '@/model/admin';
import ROLE from '@/model/role';
import MagicLinkToken from '@/model/magicLinkToken';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { sendWelcomeEmail } from '@/lib/services/emailService';

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, userId, roleId } = body;

    // Validate required fields
    if (!name || !email || !userId) {
      return NextResponse.json(
        { error: 'Nom, email et ID utilisateur sont requis' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    await connectToDB();

    // Check if user already exists (by email or userId)
    const existingUser = await ADMIN.findOne({
      $or: [
        { email: email.toLowerCase() },
        { userId: userId }
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email ou cet ID existe déjà' },
        { status: 400 }
      );
    }

    // Validate role if provided
    let userRole = 'user'; // default role
    if (roleId) {
      const role = await ROLE.findById(roleId);
      if (!role || !role.isActive) {
        return NextResponse.json(
          { error: 'Rôle invalide ou inactif' },
          { status: 400 }
        );
      }
      userRole = role.name;
    }

    // Generate temporary password (user will access via magic link)
    const tempPassword = nanoid(32);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create user
    const newUser = new ADMIN({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      userId: userId.trim(),
      password: hashedPassword,
      role: userRole,
      tenant: 'default', // You might want to make this configurable
      connection: 'database',
      is_signup: false, // Admin created account
      debug: false,
      usePasskey: false
    });

    await newUser.save();

    // Generate magic link token
    const token = nanoid(64);
    const magicLinkToken = new MagicLinkToken({
      email: email.toLowerCase().trim(),
      token: token,
      used: false
    });

    await magicLinkToken.save();

    // Create magic link URL
    const baseUrl = request.nextUrl.origin;
    const magicLinkUrl = `${baseUrl}/auth/magic-link-callback?token=${token}&email=${encodeURIComponent(email)}`;

    // Send welcome email with magic link
    let emailSent = true;
    let emailError = null;

    try {
      await sendWelcomeEmail({
        name,
        email,
        magicLinkUrl,
        companyName: process.env.COMPANY_NAME
      });
    } catch (error) {
      console.error('Email sending failed, but user was created:', error);
      emailSent = false;
      emailError = error instanceof Error ? error.message : 'Unknown email error';
    }

    // Return success (without sensitive data)
    return NextResponse.json({
      success: true,
      message: emailSent
        ? 'Utilisateur créé avec succès. Un email de bienvenue a été envoyé.'
        : 'Utilisateur créé avec succès. L\'email n\'a pas pu être envoyé.',
      emailSent,
      emailError,
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        userId: newUser.userId,
        role: userRole,
        createdAt: newUser.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// GET /api/users - Get all users (for admin purposes)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    await connectToDB();

    const users = await ADMIN.find({})
      .select('-password') // Don't return password hashes
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}