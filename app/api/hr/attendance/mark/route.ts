import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/database/connectToDB';
import Employee from '@/model/hr/employee';
import Attendance from '@/model/hr/attendance';
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

    if (useMockData) {
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

      return handleMockAttendanceMark(employee, status, date);
    }

    // Database implementation
    await connectToDB();

    // Find employee by employeeId
    const employee = await Employee.findOne({ employeeId }).lean();
    if (!employee) {
      return NextResponse.json({
        meta: {
          status: 404,
          message: `Employee with ID ${employeeId} not found`
        },
        data: null
      }, { status: 404 });
    }

    // Prepare attendance data for database
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    let attendanceData: any = {
      employee: employee._id,
      date: targetDate,
      status,
      scheduledHours: 8,
      notes: getStatusNote(status)
    };

    // Generate appropriate times based on status
    if (status === 'present') {
      // Normal working hours
      const checkInTime = new Date(targetDate);
      checkInTime.setHours(9, Math.random() * 15, 0, 0); // 9:00-9:15 AM

      const checkOutTime = new Date(checkInTime);
      checkOutTime.setHours(17, Math.random() * 30, 0, 0); // 5:00-5:30 PM

      attendanceData.checkIn = {
        time: checkInTime,
        location: { type: 'office', address: 'Office' }
      };
      attendanceData.checkOut = {
        time: checkOutTime,
        location: { type: 'office', address: 'Office' }
      };
    } else if (status === 'late') {
      // Late arrival
      const checkInTime = new Date(targetDate);
      checkInTime.setHours(9, 30 + Math.random() * 60, 0, 0); // 9:30-10:30 AM

      const checkOutTime = new Date(checkInTime);
      checkOutTime.setHours(17, 30 + Math.random() * 60, 0, 0); // 5:30-6:30 PM (making up time)

      attendanceData.checkIn = {
        time: checkInTime,
        location: { type: 'office', address: 'Office' }
      };
      attendanceData.checkOut = {
        time: checkOutTime,
        location: { type: 'office', address: 'Office' }
      };
    }
    // For 'absent', 'leave', 'holiday' - no check-in/out times

    // Create or update attendance record
    const attendanceRecord = await Attendance.findOneAndUpdate(
      { employee: employee._id, date: targetDate },
      attendanceData,
      { upsert: true, new: true, runValidators: true }
    ).populate('employee', 'firstName lastName employeeId position');

    return NextResponse.json({
      meta: {
        status: 200,
        message: `Attendance marked as ${status} for ${employee.firstName} ${employee.lastName}`,
        useMockData: false
      },
      data: {
        attendance: {
          _id: attendanceRecord._id,
          employee: {
            firstName: attendanceRecord.employee.firstName,
            lastName: attendanceRecord.employee.lastName,
            employeeId: attendanceRecord.employee.employeeId
          },
          date: attendanceRecord.date.toISOString().split('T')[0],
          checkIn: attendanceRecord.checkIn?.time?.toISOString(),
          checkOut: attendanceRecord.checkOut?.time?.toISOString(),
          status: attendanceRecord.status,
          scheduledHours: attendanceRecord.scheduledHours || 8,
          actualHours: attendanceRecord.actualHours || 0,
          overtimeHours: attendanceRecord.overtimeHours || 0,
          isRemote: attendanceRecord.checkIn?.location?.type === 'remote' || false,
          notes: attendanceRecord.notes,
          markedAt: new Date().toISOString(),
          markedBy: 'system'
        },
        employee: {
          employeeId: employee.employeeId,
          name: `${employee.firstName} ${employee.lastName}`,
          position: attendanceRecord.employee.position || employee.position
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

// Handle mock attendance marking
function handleMockAttendanceMark(employee: any, status: string, date: string) {
  // Generate appropriate times based on status
  const targetDate = new Date(date);
  let checkIn: string | undefined;
  let checkOut: string | undefined;
  let actualHours = 0;
  let overtimeHours = 0;

  if (status === 'present') {
    // Normal working hours
    const checkInTime = new Date(targetDate);
    checkInTime.setHours(9, Math.random() * 15, 0, 0); // 9:00-9:15 AM

    const checkOutTime = new Date(checkInTime);
    checkOutTime.setHours(17, Math.random() * 30, 0, 0); // 5:00-5:30 PM

    actualHours = Number(((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60) - 1).toFixed(2)); // Subtract lunch
    overtimeHours = Math.max(0, actualHours - 8);

    checkIn = checkInTime.toISOString();
    checkOut = checkOutTime.toISOString();
  } else if (status === 'late') {
    // Late arrival
    const checkInTime = new Date(targetDate);
    checkInTime.setHours(9, 30 + Math.random() * 60, 0, 0); // 9:30-10:30 AM

    const checkOutTime = new Date(checkInTime);
    checkOutTime.setHours(17, 30 + Math.random() * 60, 0, 0); // 5:30-6:30 PM (making up time)

    actualHours = Number(((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60) - 1).toFixed(2));
    overtimeHours = Math.max(0, actualHours - 8);

    checkIn = checkInTime.toISOString();
    checkOut = checkOutTime.toISOString();
  }
  // For 'absent', 'leave', 'holiday' - no check-in/out times

  // Create attendance record
  const attendanceRecord = {
    _id: `att_${employee.employeeId}_${date}_${Date.now()}`,
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