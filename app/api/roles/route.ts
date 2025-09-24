import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/database/connectToDB';
import ROLE from '@/model/role';
import { auth } from '@/auth';

// GET /api/roles - Get all roles
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

    const roles = await ROLE.find({ isActive: true }).sort({ name: 1 });

    return NextResponse.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des rôles' },
      { status: 500 }
    );
  }
}

// POST /api/roles - Create a new role
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
    const { name, description, permissions = [] } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom du rôle est requis' },
        { status: 400 }
      );
    }

    await connectToDB();

    // Check if role already exists
    const existingRole = await ROLE.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingRole) {
      return NextResponse.json(
        { error: 'Ce rôle existe déjà' },
        { status: 400 }
      );
    }

    const role = new ROLE({
      name: name.trim(),
      description: description?.trim(),
      permissions: Array.isArray(permissions) ? permissions : []
    });

    await role.save();

    return NextResponse.json({
      success: true,
      data: role
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du rôle' },
      { status: 500 }
    );
  }
}