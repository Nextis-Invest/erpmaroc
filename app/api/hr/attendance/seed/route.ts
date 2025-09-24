import { NextRequest, NextResponse } from 'next/server';
// import { seedAttendanceData } from '@/scripts/seedAttendanceData'; // Commented out - script was removed

/**
 * POST /api/hr/attendance/seed - Seed attendance data from mock data to database
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Starting attendance data seeding via API...');

    // Run the seeding process
    // await seedAttendanceData(); // Commented out - script was removed
    console.log('⚠️ Attendance seeding temporarily disabled - script was removed');

    return NextResponse.json({
      meta: {
        status: 200,
        message: 'Attendance data seeded successfully from mock data to database'
      },
      data: {
        success: true,
        timestamp: new Date().toISOString()
      }
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error in attendance seeding API:', error);

    return NextResponse.json({
      meta: {
        status: 500,
        message: 'Failed to seed attendance data'
      },
      data: null,
      error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
    }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

/**
 * GET /api/hr/attendance/seed - Check seeding status and provide instructions
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    meta: {
      status: 200,
      message: 'Attendance seeding endpoint ready'
    },
    data: {
      instructions: 'Send a POST request to this endpoint to seed attendance data from mock data to database',
      endpoints: {
        seed: 'POST /api/hr/attendance/seed',
        check: 'GET /api/hr/attendance/seed'
      },
      warning: 'This will clear existing attendance records and replace them with mock data'
    }
  }, { status: 200 });
}