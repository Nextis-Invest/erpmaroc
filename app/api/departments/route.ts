import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDB } from '@/lib/database/connectToDB';
import Department from '@/model/department';
import { z } from 'zod';

// Validation schema
const departmentSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  code: z.string().max(10, 'Le code ne peut pas dépasser 10 caractères').optional(),
  description: z.string().max(500, 'La description ne peut pas dépasser 500 caractères').optional(),
  manager: z.string().optional(),
  parentDepartment: z.string().optional()
});

// GET /api/departments - List all departments
export const GET = async (req: NextRequest) => {
  try {
    console.log('🚀 [GET /api/departments] Request received');

    const { searchParams } = new URL(req.url);
    const bypassAuth = searchParams.get('bypass') === 'true';

    await connectToDB();
    console.log('✅ [GET /api/departments] Database connected');

    let session;
    try {
      session = await auth();
      console.log('🔐 [GET /api/departments] Auth result:', {
        hasSession: !!session,
        userEmail: session?.user?.email
      });
    } catch (authError) {
      console.error('❌ [GET /api/departments] Authentication failed:', authError);
      // In development, allow bypass
      if (process.env.NODE_ENV === 'development' && bypassAuth) {
        console.log('🚨 [GET /api/departments] Development bypass activated');
        session = { user: { email: 'dev@local.com', role: 'admin', id: 'dev-user' } };
      } else {
        return NextResponse.json(
          { error: "Authentication failed" },
          { status: 401 }
        );
      }
    }

    if (!session?.user?.email) {
      console.log('❌ [GET /api/departments] No session or email found');
      // In development, allow bypass
      if (process.env.NODE_ENV === 'development' && bypassAuth) {
        console.log('🚨 [GET /api/departments] Development bypass activated - no session');
        session = { user: { email: 'dev@local.com', role: 'admin', id: 'dev-user' } };
      } else {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    console.log('✅ [GET /api/departments] User authenticated:', session.user.email);

    const includeInactive = searchParams.get('includeInactive') === 'true';
    const parentDepartment = searchParams.get('parentDepartment');
    const withSubdepartments = searchParams.get('withSubdepartments') === 'true';

    let query: any = {};
    if (!includeInactive) {
      query.isActive = true;
    }
    if (parentDepartment) {
      query.parentDepartment = parentDepartment;
    }

    console.log('📊 [GET /api/departments] Query:', query);

    // Count total departments
    const totalDepartments = await Department.countDocuments(query);
    console.log('📈 [GET /api/departments] Total departments found:', totalDepartments);

    let departments;
    try {
      if (withSubdepartments) {
        console.log('🔍 [GET /api/departments] Fetching with subdepartments...');
        departments = await Department.find(query)
          .populate('manager', 'firstName lastName employeeId')
          .populate('parentDepartment', 'name code')
          .populate('subdepartments')
          .sort({ name: 1 });
      } else {
        console.log('🔍 [GET /api/departments] Fetching departments...');
        departments = await Department.find(query)
          .populate('manager', 'firstName lastName employeeId')
          .populate('parentDepartment', 'name code')
          .sort({ name: 1 });
      }

      console.log('📋 [GET /api/departments] Departments retrieved:', departments.length);
      if (departments.length > 0) {
        console.log('📝 [GET /api/departments] Sample department:', {
          id: departments[0]._id,
          name: departments[0].name,
          code: departments[0].code,
          isActive: departments[0].isActive
        });
      }

    } catch (popError) {
      console.warn('⚠️ [GET /api/departments] Populate failed, fetching without population:', popError.message);
      departments = await Department.find(query).sort({ name: 1 });
    }

    const response = {
      meta: {
        status: 200,
        message: "Departments fetched successfully"
      },
      data: { departments }
    };

    console.log('📤 [GET /api/departments] Sending response with', departments.length, 'departments');
    return NextResponse.json(response);

  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

// POST /api/departments - Create new department
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
    const validatedData = departmentSchema.parse(body);

    // Check if department with same name already exists (in same parent if applicable)
    const existingQuery: any = {
      name: validatedData.name,
      isActive: true
    };

    if (validatedData.parentDepartment) {
      existingQuery.parentDepartment = validatedData.parentDepartment;
    } else {
      existingQuery.parentDepartment = { $exists: false };
    }

    const existingDepartment = await Department.findOne(existingQuery);

    if (existingDepartment) {
      return NextResponse.json(
        { error: "Un département avec ce nom existe déjà" },
        { status: 400 }
      );
    }

    // Check if code is unique (if provided)
    if (validatedData.code) {
      const existingByCode = await Department.findOne({
        code: validatedData.code,
        isActive: true
      });

      if (existingByCode) {
        return NextResponse.json(
          { error: "Un département avec ce code existe déjà" },
          { status: 400 }
        );
      }
    }

    // Create department
    const department = new Department({
      ...validatedData,
      createdBy: session.user.sub
    });

    const savedDepartment = await department.save();

    // Populate references for response
    const populatedDepartment = await Department.findById(savedDepartment._id)
      .populate('manager', 'firstName lastName employeeId')
      .populate('parentDepartment', 'name code');

    return NextResponse.json({
      meta: {
        status: 201,
        message: "Department created successfully"
      },
      data: { department: populatedDepartment }
    });

  } catch (error) {
    console.error("Error creating department:", error);

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