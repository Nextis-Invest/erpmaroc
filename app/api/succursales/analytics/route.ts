import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/database/connectToDB';
import Succursale from '@/models/succursale';
import { auth } from '@/auth';

// GET /api/succursales/analytics - Get comprehensive analytics dashboard data
export async function GET(request: NextRequest) {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'yearly'; // monthly, quarterly, yearly
    const region = searchParams.get('region') || '';

    // Build base match criteria
    const baseMatch: any = { isDeleted: false };
    if (region) baseMatch.region = region;

    // Get current date for period calculations
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);

    // Revenue trends by period
    const revenueField = period === 'monthly' ? '$financials.revenue.monthly' :
                        period === 'quarterly' ? '$financials.revenue.quarterly' :
                        '$financials.revenue.yearly';

    const performanceMetrics = await Succursale.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: null,
          // Basic counts
          totalSuccursales: { $sum: 1 },
          activeSuccursales: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }},
          inactiveSuccursales: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }},
          pendingSuccursales: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }},

          // Employee metrics
          totalEmployees: { $sum: '$employees.total' },
          totalManagers: { $sum: '$employees.managers' },
          totalSalesStaff: { $sum: '$employees.sales' },
          avgEmployeesPerBranch: { $avg: '$employees.total' },

          // Financial metrics
          totalRevenue: { $sum: revenueField },
          avgRevenue: { $avg: revenueField },
          maxRevenue: { $max: revenueField },
          minRevenue: { $min: revenueField },

          // Operational metrics
          avgArea: { $avg: '$facilities.area' },
          totalParkingSpaces: { $sum: '$facilities.parking.spaces' },
          branchesWithParking: { $sum: { $cond: ['$facilities.parking.available', 1, 0] }},
          branchesWithSecurity: { $sum: { $cond: ['$facilities.security.cameras', 1, 0] }}
        }
      }
    ]);

    // Performance by region
    const regionPerformance = await Succursale.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: '$region',
          count: { $sum: 1 },
          totalRevenue: { $sum: revenueField },
          totalEmployees: { $sum: '$employees.total' },
          avgRevenue: { $avg: revenueField },
          activeCount: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }}
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Performance by city (top 10)
    const cityPerformance = await Succursale.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: '$city',
          region: { $first: '$region' },
          count: { $sum: 1 },
          totalRevenue: { $sum: revenueField },
          totalEmployees: { $sum: '$employees.total' },
          avgRevenue: { $avg: revenueField }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    // Top performers (by revenue)
    const topPerformers = await Succursale.find(baseMatch)
      .select('name code city region status financials.revenue employees.total manager.name')
      .sort({ [`financials.revenue.${period === 'monthly' ? 'monthly' : period === 'quarterly' ? 'quarterly' : 'yearly'}`]: -1 })
      .limit(10)
      .lean();

    // Status distribution
    const statusDistribution = await Succursale.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          percentage: {
            $multiply: [
              { $divide: [{ $sum: 1 }, { $sum: 1 }] },
              100
            ]
          }
        }
      }
    ]);

    // Calculate total for percentage
    const totalForPercentage = await Succursale.countDocuments(baseMatch);
    statusDistribution.forEach(item => {
      item.percentage = Number(((item.count / totalForPercentage) * 100).toFixed(1));
    });

    // Type distribution
    const typeDistribution = await Succursale.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgRevenue: { $avg: revenueField },
          totalRevenue: { $sum: revenueField }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Monthly growth trend (last 12 months)
    const growthTrend = await Succursale.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          newBranches: { $sum: 1 },
          totalRevenue: { $sum: revenueField }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Employee productivity (revenue per employee)
    const productivity = await Succursale.aggregate([
      {
        $match: {
          ...baseMatch,
          'employees.total': { $gt: 0 }
        }
      },
      {
        $addFields: {
          revenuePerEmployee: {
            $divide: [revenueField, '$employees.total']
          }
        }
      },
      {
        $group: {
          _id: null,
          avgRevenuePerEmployee: { $avg: '$revenuePerEmployee' },
          maxRevenuePerEmployee: { $max: '$revenuePerEmployee' },
          minRevenuePerEmployee: { $min: '$revenuePerEmployee' }
        }
      }
    ]);

    // Facilities summary
    const facilitiesSummary = await Succursale.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: null,
          totalArea: { $sum: '$facilities.area' },
          avgArea: { $avg: '$facilities.area' },
          totalParkingSpaces: { $sum: '$facilities.parking.spaces' },
          accessibleBranches: { $sum: { $cond: ['$facilities.accessibility', 1, 0] }},
          securedBranches: {
            $sum: {
              $cond: [
                {
                  $and: [
                    '$facilities.security.cameras',
                    '$facilities.security.alarm'
                  ]
                },
                1, 0
              ]
            }
          }
        }
      }
    ]);

    // Compile response
    const analytics = {
      period,
      region: region || 'all',
      generatedAt: new Date(),

      overview: performanceMetrics[0] || {},

      geographic: {
        byRegion: regionPerformance,
        byCity: cityPerformance
      },

      performance: {
        topPerformers,
        productivity: productivity[0] || {},
        growthTrend
      },

      distribution: {
        status: statusDistribution,
        type: typeDistribution
      },

      facilities: facilitiesSummary[0] || {},

      summary: {
        healthScore: calculateHealthScore(performanceMetrics[0]),
        recommendations: generateRecommendations(performanceMetrics[0], regionPerformance)
      }
    };

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Erreur lors de la génération des analytics:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Helper function to calculate overall health score
function calculateHealthScore(metrics: any): number {
  if (!metrics) return 0;

  const factors = [
    { weight: 0.3, value: (metrics.activeSuccursales / metrics.totalSuccursales) || 0 },
    { weight: 0.25, value: Math.min((metrics.avgRevenue / 1000000), 1) }, // Normalized to 1M MAD
    { weight: 0.2, value: Math.min((metrics.avgEmployeesPerBranch / 50), 1) }, // Normalized to 50 employees
    { weight: 0.15, value: (metrics.branchesWithSecurity / metrics.totalSuccursales) || 0 },
    { weight: 0.1, value: (metrics.branchesWithParking / metrics.totalSuccursales) || 0 }
  ];

  const score = factors.reduce((acc, factor) => acc + (factor.weight * factor.value), 0);
  return Math.round(score * 100);
}

// Helper function to generate recommendations
function generateRecommendations(metrics: any, regionData: any[]): string[] {
  const recommendations: string[] = [];

  if (!metrics) return recommendations;

  // Activity recommendations
  if (metrics.activeSuccursales / metrics.totalSuccursales < 0.8) {
    recommendations.push('Réactiver les succursales inactives pour améliorer la couverture');
  }

  // Revenue recommendations
  if (metrics.avgRevenue < 500000) {
    recommendations.push('Optimiser les stratégies de vente pour augmenter le chiffre d\'affaires moyen');
  }

  // Geographic recommendations
  if (regionData.length < 6) {
    recommendations.push('Considérer l\'expansion vers de nouvelles régions marocaines');
  }

  // Staffing recommendations
  if (metrics.avgEmployeesPerBranch < 10) {
    recommendations.push('Évaluer les besoins en personnel pour optimiser les opérations');
  }

  // Security recommendations
  if (metrics.branchesWithSecurity / metrics.totalSuccursales < 0.7) {
    recommendations.push('Améliorer la sécurité des succursales avec des systèmes d\'alarme et caméras');
  }

  return recommendations;
}