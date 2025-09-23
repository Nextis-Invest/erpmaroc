import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/database/connectToDB';
import Employee from '@/model/hr/employee';
import Attendance from '@/model/hr/attendance';
import { mockEmployees } from '@/lib/hr/mockData';

/**
 * POST /api/hr/attendance/check-in - Handle employee check-in/check-out
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, location, isRemote, notes, timestamp, useMockData, action } = body;

    // Validate required fields
    if (!employeeId) {
      return NextResponse.json({
        meta: {
          status: 400,
          message: 'Missing required field: employeeId'
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

      return handleMockCheckIn(employee, location, isRemote, notes, timestamp, action);
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

    const now = timestamp ? new Date(timestamp) : new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Check if there's already an attendance record for today
    const existingAttendance = await Attendance.findOne({
      employee: employee._id,
      date: today
    });

    const isCheckOut = action === 'checkout' || (existingAttendance && existingAttendance.checkIn && !existingAttendance.checkOut);

    let attendanceData: any = {
      employee: employee._id,
      date: today,
      scheduledHours: 8,
      notes: notes || generateAutoNote(isCheckOut, 'present', isRemote)
    };

    let status: 'present' | 'late' = 'present';

    if (isCheckOut) {
      // This is a check-out
      if (!existingAttendance || !existingAttendance.checkIn) {
        return NextResponse.json({
          meta: {
            status: 400,
            message: 'Cannot check out without checking in first'
          },
          data: null
        }, { status: 400 });
      }

      attendanceData.checkOut = {
        time: now,
        location: {
          type: isRemote ? 'remote' : 'office',
          address: location || (isRemote ? 'Remote work' : 'Office')
        }
      };

      status = existingAttendance.status || 'present';
    } else {
      // This is a check-in
      if (existingAttendance && existingAttendance.checkIn) {
        return NextResponse.json({
          meta: {
            status: 400,
            message: 'Employee has already checked in today'
          },
          data: null
        }, { status: 400 });
      }

      // Determine if they're late (after 9:15 AM)
      if (now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15)) {
        status = 'late';
      }

      attendanceData.checkIn = {
        time: now,
        location: {
          type: isRemote ? 'remote' : 'office',
          address: location || (isRemote ? 'Remote work' : 'Office')
        }
      };
      attendanceData.status = status;
    }

    // Create or update attendance record
    const attendanceRecord = await Attendance.findOneAndUpdate(
      { employee: employee._id, date: today },
      attendanceData,
      { upsert: true, new: true, runValidators: true }
    ).populate('employee', 'firstName lastName employeeId position');

    // Generate response message
    const actionText = isCheckOut ? 'checked out' : 'checked in';
    const timeText = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    let message = `${employee.firstName} ${employee.lastName} ${actionText} at ${timeText}`;
    if (status === 'late' && !isCheckOut) {
      message += ' (Late arrival)';
    }
    if (isRemote) {
      message += ' (Remote work)';
    }

    return NextResponse.json({
      meta: {
        status: 200,
        message,
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
          isRemote: attendanceRecord.checkIn?.location?.type === 'remote' || attendanceRecord.checkOut?.location?.type === 'remote' || false,
          location: attendanceRecord.checkIn?.location?.address || attendanceRecord.checkOut?.location?.address || 'Office',
          notes: attendanceRecord.notes,
          action: isCheckOut ? 'check-out' : 'check-in'
        },
        employee: {
          employeeId: employee.employeeId,
          name: `${employee.firstName} ${employee.lastName}`,
          position: attendanceRecord.employee.position || employee.position
        },
        summary: {
          action: isCheckOut ? 'check-out' : 'check-in',
          time: timeText,
          status,
          location: attendanceRecord.checkIn?.location?.address || attendanceRecord.checkOut?.location?.address || 'Office',
          isRemote: isRemote || false,
          actualHours: attendanceRecord.actualHours || 0,
          overtimeHours: attendanceRecord.overtimeHours || 0
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error in POST /api/hr/attendance/check-in:', error);

    return NextResponse.json({
      meta: {
        status: 500,
        message: 'Internal server error during check-in/out'
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

// Handle mock check-in logic
function handleMockCheckIn(employee: any, location: string, isRemote: boolean, notes: string, timestamp: string, action: string) {
  const now = timestamp ? new Date(timestamp) : new Date();
  const today = now.toISOString().split('T')[0];

  // Determine if this is check-in or check-out
  const isCheckOut = action === 'checkout' || Math.random() < 0.3; // 30% chance it's a check-out for demo

  let checkIn: string | undefined;
  let checkOut: string | undefined;
  let status: 'present' | 'late' = 'present';

  if (isCheckOut) {
    // This is a check-out - mock check-in time
    const mockCheckInTime = new Date(now);
    mockCheckInTime.setHours(9, Math.random() * 30, 0, 0); // Mock check-in between 9:00-9:30

    checkIn = mockCheckInTime.toISOString();
    checkOut = now.toISOString();

    // Determine if they were late
    if (mockCheckInTime.getHours() > 9 || (mockCheckInTime.getHours() === 9 && mockCheckInTime.getMinutes() > 15)) {
      status = 'late';
    }
  } else {
    // This is a check-in
    checkIn = now.toISOString();

    // Determine if they're late (after 9:15 AM)
    if (now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15)) {
      status = 'late';
    }
  }

  // Calculate hours if both check-in and check-out exist
  let actualHours = 0;
  let overtimeHours = 0;

  if (checkIn && checkOut) {
    const checkInTime = new Date(checkIn);
    const checkOutTime = new Date(checkOut);
    actualHours = Number(((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60) - 1).toFixed(2)); // Subtract 1h lunch
    overtimeHours = Math.max(0, actualHours - 8);
  }

  // Create attendance record
  const attendanceRecord = {
    _id: `att_${employee.employeeId}_${today}_${Date.now()}`,
    employee: {
      firstName: employee.firstName,
      lastName: employee.lastName,
      employeeId: employee.employeeId
    },
    date: today,
    checkIn,
    checkOut,
    status,
    scheduledHours: 8,
    actualHours,
    overtimeHours,
    isRemote: isRemote || false,
    location: location || (isRemote ? 'Remote' : 'Office'),
    notes: notes || generateAutoNote(isCheckOut, status, isRemote),
    recordedAt: now.toISOString(),
    action: isCheckOut ? 'check-out' : 'check-in'
  };

  // Generate appropriate response message
  const actionText = isCheckOut ? 'checked out' : 'checked in';
  const timeText = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  let message = `${employee.firstName} ${employee.lastName} ${actionText} at ${timeText}`;
  if (status === 'late' && !isCheckOut) {
    message += ' (Late arrival)';
  }
  if (isRemote) {
    message += ' (Remote work)';
  }

  return NextResponse.json({
    meta: {
      status: 200,
      message,
      useMockData: true
    },
    data: {
      attendance: attendanceRecord,
      employee: {
        employeeId: employee.employeeId,
        name: `${employee.firstName} ${employee.lastName}`,
        position: employee.position
      },
      summary: {
        action: isCheckOut ? 'check-out' : 'check-in',
        time: timeText,
        status,
        location: attendanceRecord.location,
        isRemote: isRemote || false,
        actualHours: actualHours || 0,
        overtimeHours: overtimeHours || 0
      }
    }
  }, { status: 200 });
}

// Helper function to generate automatic notes
function generateAutoNote(isCheckOut: boolean, status: string, isRemote: boolean): string {
  const remoteNote = isRemote ? ' (Remote)' : '';

  if (isCheckOut) {
    const checkOutNotes = [
      `End of workday${remoteNote}`,
      `Work completed${remoteNote}`,
      `Leaving office${remoteNote}`,
      `Day shift completed${remoteNote}`
    ];
    return checkOutNotes[Math.floor(Math.random() * checkOutNotes.length)];
  } else {
    if (status === 'late') {
      const lateNotes = [
        `Late arrival - traffic${remoteNote}`,
        `Late arrival - personal matter${remoteNote}`,
        `Late arrival - transport delay${remoteNote}`,
        `Late arrival - appointment${remoteNote}`
      ];
      return lateNotes[Math.floor(Math.random() * lateNotes.length)];
    } else {
      const normalNotes = [
        `On-time arrival${remoteNote}`,
        `Start of workday${remoteNote}`,
        `Arriving at office${remoteNote}`,
        `Beginning daily tasks${remoteNote}`
      ];
      return normalNotes[Math.floor(Math.random() * normalNotes.length)];
    }
  }
}