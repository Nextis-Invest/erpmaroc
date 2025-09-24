import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDB } from '@/lib/database/connectToDB';
import Team from '@/model/team';
import Department from '@/model/department';
import { z } from 'zod';
import mongoose from 'mongoose';

// Validation schema
const updateTeamSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères').optional(),
  code: z.string().max(10, 'Le code ne peut pas dépasser 10 caractères').optional(),
  description: z.string().max(500, 'La description ne peut pas dépasser 500 caractères').optional(),
  department: z.string().optional(),
  manager: z.string().optional(),
  leadId: z.string().optional(),
  maxMembers: z.number().min(1).max(100).optional(),
  isActive: z.boolean().optional()
});

// GET /api/teams/[id] - Get single team
export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID d'équipe invalide" },
        { status: 400 }
      );
    }

    const team = await Team.findById(id)
      .populate('department', 'name code')
      .populate('manager', 'firstName lastName employeeId')
      .populate('leadId', 'firstName lastName employeeId');

    if (!team) {
      return NextResponse.json(
        { error: "Équipe non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      meta: {
        status: 200,
        message: "Team fetched successfully"
      },
      data: { team }
    });

  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

// PUT /api/teams/[id] - Update team
export const PUT = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID d'équipe invalide" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Validate input
    const validatedData = updateTeamSchema.parse(body);

    // Check if team exists
    const existingTeam = await Team.findById(id);
    if (!existingTeam) {
      return NextResponse.json(
        { error: "Équipe non trouvée" },
        { status: 404 }
      );
    }

    // Verify department exists (if being updated)
    if (validatedData.department && validatedData.department !== existingTeam.department?.toString()) {
      const department = await Department.findById(validatedData.department);
      if (!department || !department.isActive) {
        return NextResponse.json(
          { error: "Département invalide ou inactif" },
          { status: 400 }
        );
      }
    }

    // Check if name is unique within department (if being updated)
    if (validatedData.name && validatedData.name !== existingTeam.name) {
      const departmentId = validatedData.department || existingTeam.department;
      const duplicateName = await Team.findOne({
        name: validatedData.name,
        department: departmentId,
        isActive: true,
        _id: { $ne: id }
      });

      if (duplicateName) {
        return NextResponse.json(
          { error: "Une équipe avec ce nom existe déjà dans ce département" },
          { status: 400 }
        );
      }
    }

    // Check if code is unique (if being updated)
    if (validatedData.code && validatedData.code !== existingTeam.code) {
      const duplicateCode = await Team.findOne({
        code: validatedData.code,
        isActive: true,
        _id: { $ne: id }
      });

      if (duplicateCode) {
        return NextResponse.json(
          { error: "Une équipe avec ce code existe déjà" },
          { status: 400 }
        );
      }
    }

    // Update team
    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      { ...validatedData },
      { new: true, runValidators: true }
    )
    .populate('department', 'name code')
    .populate('manager', 'firstName lastName employeeId')
    .populate('leadId', 'firstName lastName employeeId');

    return NextResponse.json({
      meta: {
        status: 200,
        message: "Team updated successfully"
      },
      data: { team: updatedTeam }
    });

  } catch (error) {
    console.error("Error updating team:", error);

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

// DELETE /api/teams/[id] - Delete team
export const DELETE = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID d'équipe invalide" },
        { status: 400 }
      );
    }

    // Check if team exists
    const team = await Team.findById(id);
    if (!team) {
      return NextResponse.json(
        { error: "Équipe non trouvée" },
        { status: 404 }
      );
    }

    // TODO: Check if team has employees (when Employee model is updated to reference teams)
    // const employeesCount = await Employee.countDocuments({ team: id });
    // if (employeesCount > 0) {
    //   return NextResponse.json(
    //     { error: `Impossible de supprimer cette équipe car elle contient ${employeesCount} employé(s)` },
    //     { status: 400 }
    //   );
    // }

    // Soft delete - set isActive to false
    await Team.findByIdAndUpdate(id, { isActive: false });

    return NextResponse.json({
      meta: {
        status: 200,
        message: "Team deleted successfully"
      },
      data: { id }
    });

  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};