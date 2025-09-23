import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/database/connectToDB";
import Project from "@/model/hr/project";
import { getMockProjectData } from "@/lib/mockData/attendance";

// GET /api/hr/projects - List projects with team counts
export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const branchId = searchParams.get("branchId");
    const useMock = searchParams.get("mock") === "true";

    // Return mock data for development
    if (useMock) {
      return NextResponse.json(getMockProjectData());
    }

    // Check authentication for real data
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Non autorisé",
          code: "UNAUTHORIZED"
        },
        { status: 401 }
      );
    }

    // Build query
    let query: any = { isDeleted: false };

    if (status) {
      query.status = status;
    } else {
      // Default to active projects only
      query.status = { $in: ['planning', 'active', 'on-hold'] };
    }

    if (branchId) {
      query.branch = branchId;
    }

    // Fetch projects with team count
    const projects = await Project.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'teams',
          localField: 'teams',
          foreignField: '_id',
          as: 'teamDetails'
        }
      },
      {
        $addFields: {
          teamCount: { $size: '$teamDetails' }
        }
      },
      {
        $project: {
          name: 1,
          code: 1,
          description: 1,
          color: 1,
          status: 1,
          priority: 1,
          startDate: 1,
          endDate: 1,
          teamCount: 1,
          createdAt: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    return NextResponse.json({
      success: true,
      data: { projects },
      meta: {
        total: projects.length,
        status: 200
      }
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des projets:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
};

// POST /api/hr/projects - Create new project
export const POST = async (req: NextRequest) => {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      name,
      code,
      description,
      color,
      branchId,
      departmentId,
      projectManagerId,
      startDate,
      endDate,
      workingHours,
      workingDays,
      status,
      priority,
      budget,
      attendanceSettings,
      client,
      tags,
      category
    } = body;

    // Validate required fields
    if (!name || !code || !branchId || !projectManagerId || !startDate) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    // Check if project code is unique
    const existingProject = await Project.findOne({
      code: code.toUpperCase(),
      isDeleted: false
    });

    if (existingProject) {
      return NextResponse.json(
        { error: "Le code projet existe déjà" },
        { status: 400 }
      );
    }

    // Create project
    const project = new Project({
      name,
      code: code.toUpperCase(),
      description,
      color: color || '#3b82f6',
      branch: branchId,
      department: departmentId,
      projectManager: projectManagerId,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      workingHours: workingHours || {
        start: '09:00',
        end: '17:00',
        breakDuration: 60,
        timezone: 'Africa/Casablanca'
      },
      workingDays: workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      status: status || 'planning',
      priority: priority || 'medium',
      budget,
      attendanceSettings: attendanceSettings || {
        allowRemoteWork: false,
        flexibleHours: false,
        overtimeAllowed: true,
        trackBreaks: true,
        geofencing: { enabled: false, radius: 500 }
      },
      client,
      tags: tags || [],
      category,
      createdBy: session.user.sub
    });

    await project.save();

    return NextResponse.json({
      success: true,
      message: "Projet créé avec succès",
      data: { project }
    });

  } catch (error) {
    console.error("Erreur lors de la création du projet:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Le code projet existe déjà" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
};