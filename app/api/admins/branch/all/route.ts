import BRANCH from "@/model/branchData";
import { NextResponse, NextRequest } from "next/server";
import { connectToDB } from "@/lib/database/connectToDB";
import { auth } from "@/auth";

// GET api/admins/branch/all?region=&city=&manager=
export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const region = searchParams.get("region");
  const city = searchParams.get("city");
  const managerEmail = searchParams.get("manager");

  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({
        status: 401,
        message: "Non autorisé",
        errorCode: 401,
        details: {
          error: "Session invalide",
        },
      });
    }

    // Construction de la requête de filtrage
    let query: any = {};

    // Si un manager spécifique est demandé, récupérer ses succursales
    if (managerEmail) {
      query.manager = managerEmail;
    }

    // Filtrage par région (stateName)
    if (region && region !== "all") {
      query.stateName = new RegExp(region, "i");
    }

    // Filtrage par ville
    if (city && city !== "all") {
      query.cityName = new RegExp(city, "i");
    }

    // Récupération des succursales avec leurs enfants
    const branches = await BRANCH.find(query)
      .populate("childBranch")
      .sort({ companyName: 1 });

    if (!branches || branches.length === 0) {
      return NextResponse.json({
        status: 204,
        message: "Aucune succursale trouvée",
        data: {
          branches: [],
          summary: {
            total: 0,
            byRegion: {},
            byCity: {},
          }
        },
      });
    }

    // Création du résumé par région et ville
    const summary = {
      total: branches.length,
      byRegion: {} as Record<string, number>,
      byCity: {} as Record<string, number>,
    };

    branches.forEach(branch => {
      // Comptage par région
      const region = branch.stateName;
      summary.byRegion[region] = (summary.byRegion[region] || 0) + 1;

      // Comptage par ville
      const city = branch.cityName;
      summary.byCity[city] = (summary.byCity[city] || 0) + 1;
    });

    return NextResponse.json({
      status: 200,
      message: "Succursales récupérées avec succès",
      data: {
        branches,
        summary,
      },
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des succursales:", error);
    return NextResponse.json(
      {
        message: "Erreur interne du serveur",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
};