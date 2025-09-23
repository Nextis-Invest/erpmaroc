import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/database/connectToDB';
import Succursale from '@/models/succursale';
import { moroccanRegions } from '@/lib/data/moroccan-cities';

// GET /api/succursales/regions - Get succursales grouped by regions with statistics
export async function GET(request: NextRequest) {
  try {
    await connectToDB();

    // Get aggregated data by region
    const regionStats = await Succursale.aggregate([
      {
        $match: { isDeleted: false }
      },
      {
        $group: {
          _id: '$region',
          totalSuccursales: { $sum: 1 },
          activeSuccursales: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          totalEmployees: { $sum: '$employees.total' },
          totalRevenue: { $sum: '$financials.revenue.yearly' },
          avgRevenue: { $avg: '$financials.revenue.yearly' },
          cities: { $addToSet: '$city' },
          succursales: {
            $push: {
              id: '$_id',
              name: '$name',
              code: '$code',
              city: '$city',
              status: '$status',
              manager: '$manager.name',
              employees: '$employees.total',
              revenue: '$financials.revenue.yearly'
            }
          }
        }
      },
      {
        $sort: { totalSuccursales: -1 }
      }
    ]);

    // Ensure all Moroccan regions are included, even if empty
    const completeRegions = moroccanRegions.map(region => {
      const existingRegion = regionStats.find(r => r._id === region);
      return existingRegion || {
        _id: region,
        totalSuccursales: 0,
        activeSuccursales: 0,
        totalEmployees: 0,
        totalRevenue: 0,
        avgRevenue: 0,
        cities: [],
        succursales: []
      };
    });

    // Calculate overall statistics
    const overallStats = {
      totalRegions: moroccanRegions.length,
      regionsWithSuccursales: regionStats.length,
      totalSuccursales: regionStats.reduce((sum, r) => sum + r.totalSuccursales, 0),
      totalActiveSuccursales: regionStats.reduce((sum, r) => sum + r.activeSuccursales, 0),
      totalEmployees: regionStats.reduce((sum, r) => sum + r.totalEmployees, 0),
      totalRevenue: regionStats.reduce((sum, r) => sum + r.totalRevenue, 0),
      avgRevenuePerRegion: regionStats.length > 0
        ? regionStats.reduce((sum, r) => sum + r.totalRevenue, 0) / regionStats.length
        : 0
    };

    return NextResponse.json({
      success: true,
      data: {
        regions: completeRegions,
        statistics: overallStats
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques par région:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}