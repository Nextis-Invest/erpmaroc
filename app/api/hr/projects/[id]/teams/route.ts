import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/database/connectToDB";
import Project from "@/model/hr/project";
import Team from "@/model/hr/team";
import { getMockTeamData } from "@/lib/mockData/attendance";

// GET /api/hr/projects/[id]/teams - Get teams for a specific project
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await connectToDB();

    const { id } = await params;
    const searchParams = req.nextUrl.searchParams;
    const useMock = searchParams.get("mock") === "true";

    // Return mock data for development
    if (useMock) {
      return NextResponse.json(getMockTeamData(id));
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

    // Find the project and populate teams
    const project = await Project.findOne({
      _id: id,
      isDeleted: false
    }).populate({
      path: 'teams',
      match: { status: 'active' },
      select: 'name code description teamLead members status',
      populate: {
        path: 'teamLead',
        select: 'firstName lastName employeeId'
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Projet introuvable" },
        { status: 404 }
      );
    }

    // Format teams with member count
    const teams = project.teams.map((team: any) => ({
      _id: team._id,
      name: team.name,
      code: team.code,
      description: team.description,
      memberCount: team.members.length,
      status: team.status,
      teamLead: team.teamLead ? {
        firstName: team.teamLead.firstName,
        lastName: team.teamLead.lastName,
        employeeId: team.teamLead.employeeId
      } : null
    }));

    return NextResponse.json({
      success: true,
      data: { teams },
      meta: {
        projectId: project._id,
        projectName: project.name,
        total: teams.length,
        status: 200
      }
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des équipes:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
};

// POST /api/hr/projects/[id]/teams - Add team to project
export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { teamId } = await req.json();

    if (!teamId) {
      return NextResponse.json(
        { error: "ID de l'équipe requis" },
        { status: 400 }
      );
    }

    // Find project
    const project = await Project.findOne({
      _id: id,
      isDeleted: false
    });

    if (!project) {
      return NextResponse.json(
        { error: "Projet introuvable" },
        { status: 404 }
      );
    }

    // Find team
    const team = await Team.findOne({
      _id: teamId,
      status: 'active'
    });

    if (!team) {
      return NextResponse.json(
        { error: "Équipe introuvable" },
        { status: 404 }
      );
    }

    // Add team to project if not already added
    await project.addTeam(teamId);

    return NextResponse.json({
      success: true,
      message: "Équipe ajoutée au projet avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de l'ajout de l'équipe:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
};

// DELETE /api/hr/projects/[id]/teams - Remove team from project
export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { teamId } = await req.json();

    if (!teamId) {
      return NextResponse.json(
        { error: "ID de l'équipe requis" },
        { status: 400 }
      );
    }

    // Find project
    const project = await Project.findOne({
      _id: id,
      isDeleted: false
    });

    if (!project) {
      return NextResponse.json(
        { error: "Projet introuvable" },
        { status: 404 }
      );
    }

    // Remove team from project
    await project.removeTeam(teamId);

    return NextResponse.json({
      success: true,
      message: "Équipe retirée du projet avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de la suppression de l'équipe:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
};