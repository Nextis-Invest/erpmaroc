import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/database/connectToDB';
import ADMIN from '@/model/admin';
import ROLE from '@/model/role';
import { auth } from '@/auth';

// PATCH /api/users/[id] - Update user role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Only admins can update user roles
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Seuls les administrateurs peuvent modifier les rôles' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json(
        { error: 'Le rôle est requis' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['admin', 'user', 'manager', 'hr', 'payroll'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Rôle invalide. Les rôles valides sont: ' + validRoles.join(', ') },
        { status: 400 }
      );
    }

    await connectToDB();

    // Find user by ID or email
    let query: any;
    if (id.includes('@')) {
      // If id contains @, treat it as email
      query = { email: id.toLowerCase() };
    } else {
      // Otherwise, treat as MongoDB ObjectId or userId
      query = id.match(/^[0-9a-fA-F]{24}$/)
        ? { _id: id }
        : { userId: id };
    }

    const user = await ADMIN.findOne(query);

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Update role
    user.role = role;
    await user.save();

    return NextResponse.json({
      success: true,
      message: `Rôle de ${user.name} (${user.email}) mis à jour vers "${role}"`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        userId: user.userId,
        role: user.role,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du rôle' },
      { status: 500 }
    );
  }
}

// GET /api/users/[id] - Get specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    await connectToDB();

    // Find user by ID or email
    let query: any;
    if (id.includes('@')) {
      query = { email: id.toLowerCase() };
    } else {
      query = id.match(/^[0-9a-fA-F]{24}$/)
        ? { _id: id }
        : { userId: id };
    }

    const user = await ADMIN.findOne(query).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'utilisateur' },
      { status: 500 }
    );
  }
}