import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDB } from '@/lib/database/connectToDB';
import Team from '@/model/team';
import Department from '@/model/department';
import { z } from 'zod';

// Validation schema
const teamSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  code: z.string().max(10, 'Le code ne peut pas dépasser 10 caractères').optional(),
  description: z.string().max(500, 'La description ne peut pas dépasser 500 caractères').optional(),
  department: z.string().min(1, 'Le département est requis'),
  manager: z.string().optional(),
  leadId: z.string().optional(),
  maxMembers: z.number().min(1).max(100).optional()
});

// GET /api/teams - List all teams
export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const departmentId = searchParams.get('departmentId');
    const withMembersCount = searchParams.get('withMembersCount') === 'true';

    let query: any = {};
    if (!includeInactive) {
      query.isActive = true;
    }
    if (departmentId) {
      query.department = departmentId;
    }

    let teams;
    if (withMembersCount) {
      teams = await Team.find(query)
        .populate('department', 'name code')
        .populate('manager', 'firstName lastName employeeId')
        .populate('leadId', 'firstName lastName employeeId')
        .populate('membersCount')
        .sort({ name: 1 });
    } else {
      teams = await Team.find(query)
        .populate('department', 'name code')
        .populate('manager', 'firstName lastName employeeId')
        .populate('leadId', 'firstName lastName employeeId')
        .sort({ name: 1 });
    }

    return NextResponse.json({
      meta: {
        status: 200,
        message: "Teams fetched successfully"
      },
      data: { teams }
    });

  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

// POST /api/teams - Create new team
export const POST = async (req: NextRequest) => {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate input
    const validatedData = teamSchema.parse(body);

    // Verify department exists
    const department = await Department.findById(validatedData.department);
    if (!department || !department.isActive) {
      return NextResponse.json(
        { error: "Département invalide ou inactif" },
        { status: 400 }
      );
    }

    // Check if team with same name already exists in the same department
    const existingTeam = await Team.findOne({
      name: validatedData.name,
      department: validatedData.department,
      isActive: true
    });

    if (existingTeam) {
      return NextResponse.json(
        { error: "Une équipe avec ce nom existe déjà dans ce département" },
        { status: 400 }
      );
    }

    // Check if code is unique (if provided)
    if (validatedData.code) {
      const existingByCode = await Team.findOne({
        code: validatedData.code,
        isActive: true
      });

      if (existingByCode) {
        return NextResponse.json(
          { error: "Une équipe avec ce code existe déjà" },
          { status: 400 }
        );
      }
    }

    // Create team
    const team = new Team({
      ...validatedData,
      createdBy: session.user.sub
    });

    const savedTeam = await team.save();

    // Populate references for response
    const populatedTeam = await Team.findById(savedTeam._id)
      .populate('department', 'name code')
      .populate('manager', 'firstName lastName employeeId')
      .populate('leadId', 'firstName lastName employeeId');

    return NextResponse.json({
      meta: {
        status: 201,
        message: "Team created successfully"
      },
      data: { team: populatedTeam }
    });

  } catch (error) {
    console.error("Error creating team:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};