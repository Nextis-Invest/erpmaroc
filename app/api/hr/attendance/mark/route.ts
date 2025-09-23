import { NextRequest, NextResponse } from 'next/server';
import { mockEmployees } from '@/lib/hr/mockData';

/**
 * POST /api/hr/attendance/mark - Mark employee attendance status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, status, date, useMockData } = body;

    // Validate required fields
    if (!employeeId || !status || !date) {
      return NextResponse.json({
        meta: {
          status: 400,
          message: 'Missing required fields: employeeId, status, date'
        },
        data: null
      }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['present', 'absent', 'late', 'leave', 'holiday'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        meta: {
          status: 400,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        },
        data: null
      }, { status: 400 });
    }

    if (!useMockData) {
      return NextResponse.json({
        meta: {
          status: 501,
          message: 'Database attendance marking not implemented yet'
        },
        data: null
      }, { status: 501 });
    }

    // Find employee in mock data
    const employee = mockEmployees.find(emp => emp.employeeId === employeeId);
    if (!employee) {
      return NextResponse.json({
        meta: {
          status: 404,
          message: `Employee with ID ${employeeId} not found`
        },
        data: null
      }, { status: 404 });
    }

    // Generate appropriate times based on status
    const targetDate = new Date(date);
    let checkIn: string | undefined;
    let checkOut: string | undefined;
    let actualHours = 0;
    let overtimeHours = 0;

    if (status === 'present') {
      // Normal working hours
      checkIn = new Date(targetDate);
      checkIn.setHours(9, Math.random() * 15, 0, 0); // 9:00-9:15 AM

      checkOut = new Date(checkIn);
      checkOut.setHours(17, Math.random() * 30, 0, 0); // 5:00-5:30 PM

      actualHours = Number(((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60) - 1).toFixed(2)); // Subtract lunch
      overtimeHours = Math.max(0, actualHours - 8);

      checkIn = checkIn.toISOString();
      checkOut = checkOut.toISOString();
    } else if (status === 'late') {
      // Late arrival
      checkIn = new Date(targetDate);
      checkIn.setHours(9, 30 + Math.random() * 60, 0, 0); // 9:30-10:30 AM

      checkOut = new Date(checkIn);
      checkOut.setHours(17, 30 + Math.random() * 60, 0, 0); // 5:30-6:30 PM (making up time)

      actualHours = Number(((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60) - 1).toFixed(2));
      overtimeHours = Math.max(0, actualHours - 8);

      checkIn = checkIn.toISOString();
      checkOut = checkOut.toISOString();
    }
    // For 'absent', 'leave', 'holiday' - no check-in/out times

    // Create attendance record
    const attendanceRecord = {
      _id: `att_${employeeId}_${date}_${Date.now()}`,
      employee: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        employeeId: employee.employeeId
      },
      date: targetDate.toISOString().split('T')[0],
      checkIn,
      checkOut,
      status,
      scheduledHours: 8,
      actualHours,
      overtimeHours,
      isRemote: Math.random() < 0.2, // 20% chance of remote
      notes: getStatusNote(status),
      markedAt: new Date().toISOString(),
      markedBy: 'system' // In real app, this would be the user making the change
    };

    return NextResponse.json({
      meta: {
        status: 200,
        message: `Attendance marked as ${status} for ${employee.firstName} ${employee.lastName}`,
        useMockData: true
      },
      data: {
        attendance: attendanceRecord,
        employee: {
          employeeId: employee.employeeId,
          name: `${employee.firstName} ${employee.lastName}`,
          position: employee.position
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error in POST /api/hr/attendance/mark:', error);

    return NextResponse.json({
      meta: {
        status: 500,
        message: 'Internal server error while marking attendance'
      },
      data: null,
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// Helper function to generate appropriate notes based on status
function getStatusNote(status: string): string | undefined {
  const notes: Record<string, string[]> = {
    present: ['On time', 'Good attendance', ''],
    late: ['Traffic delay', 'Personal appointment', 'Transport issue', 'Family emergency'],
    absent: ['Sick leave', 'Personal emergency', 'Family matter'],
    leave: ['Annual leave', 'Personal leave', 'Planned vacation'],
    holiday: ['Public holiday', 'Company holiday', 'Religious holiday']
  };

  const statusNotes = notes[status] || [''];
  return statusNotes[Math.floor(Math.random() * statusNotes.length)] || undefined;
}