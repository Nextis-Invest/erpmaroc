import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDB } from '@/lib/database/connectToDB';
import Department from '@/model/department';
import Team from '@/model/team';
import { z } from 'zod';
import mongoose from 'mongoose';

// Validation schema
const updateDepartmentSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères').optional(),
  code: z.string().max(10, 'Le code ne peut pas dépasser 10 caractères').optional(),
  description: z.string().max(500, 'La description ne peut pas dépasser 500 caractères').optional(),
  manager: z.string().optional(),
  parentDepartment: z.string().optional(),
  isActive: z.boolean().optional()
});

// GET /api/departments/[id] - Get single department
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
        { error: "ID de département invalide" },
        { status: 400 }
      );
    }

    const department = await Department.findById(id)
      .populate('manager', 'firstName lastName employeeId')
      .populate('parentDepartment', 'name code')
      .populate('subdepartments');

    if (!department) {
      return NextResponse.json(
        { error: "Département non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      meta: {
        status: 200,
        message: "Department fetched successfully"
      },
      data: { department }
    });

  } catch (error) {
    console.error("Error fetching department:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

// PUT /api/departments/[id] - Update department
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
        { error: "ID de département invalide" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Validate input
    const validatedData = updateDepartmentSchema.parse(body);

    // Check if department exists
    const existingDepartment = await Department.findById(id);
    if (!existingDepartment) {
      return NextResponse.json(
        { error: "Département non trouvé" },
        { status: 404 }
      );
    }

    // Check if name is unique (if being updated)
    if (validatedData.name && validatedData.name !== existingDepartment.name) {
      const existingQuery: any = {
        name: validatedData.name,
        isActive: true,
        _id: { $ne: id }
      };

      if (validatedData.parentDepartment || existingDepartment.parentDepartment) {
        existingQuery.parentDepartment = validatedData.parentDepartment || existingDepartment.parentDepartment;
      } else {
        existingQuery.parentDepartment = { $exists: false };
      }

      const duplicateName = await Department.findOne(existingQuery);
      if (duplicateName) {
        return NextResponse.json(
          { error: "Un département avec ce nom existe déjà" },
          { status: 400 }
        );
      }
    }

    // Check if code is unique (if being updated)
    if (validatedData.code && validatedData.code !== existingDepartment.code) {
      const duplicateCode = await Department.findOne({
        code: validatedData.code,
        isActive: true,
        _id: { $ne: id }
      });

      if (duplicateCode) {
        return NextResponse.json(
          { error: "Un département avec ce code existe déjà" },
          { status: 400 }
        );
      }
    }

    // Update department
    const updatedDepartment = await Department.findByIdAndUpdate(
      id,
      { ...validatedData },
      { new: true, runValidators: true }
    )
    .populate('manager', 'firstName lastName employeeId')
    .populate('parentDepartment', 'name code');

    return NextResponse.json({
      meta: {
        status: 200,
        message: "Department updated successfully"
      },
      data: { department: updatedDepartment }
    });

  } catch (error) {
    console.error("Error updating department:", error);

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

// DELETE /api/departments/[id] - Delete department
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
        { error: "ID de département invalide" },
        { status: 400 }
      );
    }

    // Check if department exists
    const department = await Department.findById(id);
    if (!department) {
      return NextResponse.json(
        { error: "Département non trouvé" },
        { status: 404 }
      );
    }

    // Check if department has teams
    const teamsCount = await Team.countDocuments({ department: id, isActive: true });
    if (teamsCount > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer ce département car il contient ${teamsCount} équipe(s)` },
        { status: 400 }
      );
    }

    // Check if department has subdepartments
    const subdepartmentsCount = await Department.countDocuments({
      parentDepartment: id,
      isActive: true
    });
    if (subdepartmentsCount > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer ce département car il contient ${subdepartmentsCount} sous-département(s)` },
        { status: 400 }
      );
    }

    // Soft delete - set isActive to false
    await Department.findByIdAndUpdate(id, { isActive: false });

    return NextResponse.json({
      meta: {
        status: 200,
        message: "Department deleted successfully"
      },
      data: { id }
    });

  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};