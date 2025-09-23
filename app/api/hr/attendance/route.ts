import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/database/connectToDB';
import Employee from '@/model/hr/employee';
import Attendance from '@/model/hr/attendance';
import { mockEmployees, mockAttendanceRecords } from '@/lib/hr/mockData';

interface AttendanceRecord {
  _id: string;
  employee: {
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'holiday' | 'leave';
  scheduledHours: number;
  actualHours: number;
  overtimeHours: number;
  isRemote: boolean;
  notes?: string;
}

interface AttendanceStats {
  totalEmployees: number;
  present: number;
  absent: number;
  late: number;
  remote: number;
  onLeave: number;
  attendanceRate: number;
}

// Generate mock attendance for a specific date
const generateDailyAttendance = (date: string): AttendanceRecord[] => {
  const targetDate = new Date(date);

  return mockEmployees.map((employee, index) => {
    // Generate random but realistic attendance data
    const randomStatus = () => {
      const rand = Math.random();
      if (rand < 0.75) return 'present';
      if (rand < 0.85) return 'late';
      if (rand < 0.92) return 'absent';
      if (rand < 0.96) return 'leave';
      return 'holiday';
    };

    const status = randomStatus();
    const isRemote = Math.random() < 0.3; // 30% chance of remote work

    // Calculate times based on status
    let checkIn: Date | undefined;
    let checkOut: Date | undefined;
    let actualHours = 0;
    let overtimeHours = 0;

    if (status === 'present' || status === 'late') {
      const baseStartHour = 9;
      const startVariation = status === 'late' ? Math.random() * 60 + 15 : Math.random() * 30 - 15; // Late: 15-75min late, Present: ±15min

      checkIn = new Date(targetDate);
      checkIn.setHours(baseStartHour, startVariation, 0, 0);

      checkOut = new Date(checkIn);
      const workHours = 8 + (Math.random() * 2 - 0.5); // 7.5 - 8.5 hours
      checkOut.setHours(checkOut.getHours() + Math.floor(workHours), (workHours % 1) * 60, 0, 0);

      actualHours = Number(((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60) - 1).toFixed(2)); // Subtract 1h lunch
      overtimeHours = Math.max(0, actualHours - 8);
    }

    return {
      _id: `att_${employee.employeeId}_${date}`,
      employee: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        employeeId: employee.employeeId
      },
      date: targetDate.toISOString().split('T')[0],
      checkIn: checkIn?.toISOString(),
      checkOut: checkOut?.toISOString(),
      status,
      scheduledHours: 8,
      actualHours: Math.max(0, actualHours),
      overtimeHours: Math.max(0, overtimeHours),
      isRemote,
      notes: status === 'late' ? 'Traffic delay' : status === 'leave' ? 'Personal leave' : undefined
    };
  });
};

// Calculate attendance statistics
const calculateStats = (records: AttendanceRecord[]): AttendanceStats => {
  const totalEmployees = records.length;
  const present = records.filter(r => r.status === 'present').length;
  const absent = records.filter(r => r.status === 'absent').length;
  const late = records.filter(r => r.status === 'late').length;
  const remote = records.filter(r => r.isRemote).length;
  const onLeave = records.filter(r => r.status === 'leave').length;

  const attendanceRate = totalEmployees > 0
    ? ((present + late) / totalEmployees) * 100
    : 0;

  return {
    totalEmployees,
    present,
    absent,
    late,
    remote,
    onLeave,
    attendanceRate: Number(attendanceRate.toFixed(1))
  };
};

/**
 * GET /api/hr/attendance - Get attendance records for a specific date
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const useMock = searchParams.get('mock') === 'true';

    if (useMock) {
      // Generate attendance for the requested date
      const attendance = generateDailyAttendance(date);
      const stats = calculateStats(attendance);

      return NextResponse.json({
        meta: {
          status: 200,
          message: 'Attendance records retrieved successfully',
          date: date,
          useMockData: true
        },
        data: {
          attendance,
          stats
        }
      }, { status: 200 });
    }

    // Database implementation
    await connectToDB();

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get attendance records for the date
    const attendance = await Attendance.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
    .populate('employee', 'firstName lastName employeeId')
    .sort({ 'employee.firstName': 1 })
    .lean();

    // Calculate attendance statistics manually
    const totalEmployees = attendance.length;
    const present = attendance.filter(r => r.status === 'present').length;
    const absent = attendance.filter(r => r.status === 'absent').length;
    const late = attendance.filter(r => r.status === 'late').length;
    const remote = attendance.filter(r => r.checkIn?.location?.type === 'remote').length;
    const onLeave = attendance.filter(r => r.status === 'leave').length;

    const attendanceRate = totalEmployees > 0
      ? ((present + late) / totalEmployees) * 100
      : 0;

    const stats = {
      totalEmployees,
      present,
      absent,
      late,
      remote,
      onLeave,
      attendanceRate: Number(attendanceRate.toFixed(1))
    };

    // Format attendance records to match interface
    const formattedAttendance = attendance.map(record => ({
      _id: record._id,
      employee: {
        firstName: record.employee?.firstName || '',
        lastName: record.employee?.lastName || '',
        employeeId: record.employee?.employeeId || ''
      },
      date: record.date.toISOString().split('T')[0],
      checkIn: record.checkIn?.time?.toISOString(),
      checkOut: record.checkOut?.time?.toISOString(),
      status: record.status,
      scheduledHours: record.scheduledHours || 8,
      actualHours: record.actualHours || 0,
      overtimeHours: record.overtimeHours || 0,
      isRemote: record.checkIn?.location?.type === 'remote' || false,
      notes: record.notes
    }));

    return NextResponse.json({
      meta: {
        status: 200,
        message: 'Attendance records retrieved successfully',
        date: date,
        useMockData: false
      },
      data: {
        attendance: formattedAttendance,
        stats
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error in GET /api/hr/attendance:', error);

    return NextResponse.json({
      meta: {
        status: 500,
        message: 'Internal server error'
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

/**
 * POST /api/hr/attendance - Create or update attendance record
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, date, status, checkIn, checkOut, isRemote, notes, useMockData } = body;

    if (!employeeId || !date || !status) {
      return NextResponse.json({
        meta: {
          status: 400,
          message: 'Missing required fields: employeeId, date, status'
        },
        data: null
      }, { status: 400 });
    }

    if (useMockData) {
      // Find employee
      const employee = mockEmployees.find(emp => emp.employeeId === employeeId);
      if (!employee) {
        return NextResponse.json({
          meta: {
            status: 404,
            message: 'Employee not found'
          },
          data: null
        }, { status: 404 });
      }

      // Create attendance record
      const attendanceRecord: AttendanceRecord = {
        _id: `att_${employeeId}_${date}`,
        employee: {
          firstName: employee.firstName,
          lastName: employee.lastName,
          employeeId: employee.employeeId
        },
        date,
        checkIn,
        checkOut,
        status,
        scheduledHours: 8,
        actualHours: checkIn && checkOut
          ? Number(((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60) - 1).toFixed(2))
          : 0,
        overtimeHours: 0, // Will be calculated
        isRemote: isRemote || false,
        notes
      };

      // Calculate overtime
      attendanceRecord.overtimeHours = Math.max(0, attendanceRecord.actualHours - 8);

      return NextResponse.json({
        meta: {
          status: 201,
          message: 'Attendance record created successfully',
          useMockData: true
        },
        data: {
          attendance: attendanceRecord
        }
      }, { status: 201 });
    }

    // Database implementation
    await connectToDB();

    // Find employee by employeeId
    const employee = await Employee.findOne({ employeeId }).lean();
    if (!employee) {
      return NextResponse.json({
        meta: {
          status: 404,
          message: 'Employee not found'
        },
        data: null
      }, { status: 404 });
    }

    // Create or update attendance record
    const attendanceData = {
      employee: employee._id,
      date: new Date(date),
      status,
      notes,
      scheduledHours: 8,
      checkIn: checkIn ? {
        time: new Date(checkIn),
        location: {
          type: isRemote ? 'remote' : 'office'
        }
      } : undefined,
      checkOut: checkOut ? {
        time: new Date(checkOut),
        location: {
          type: isRemote ? 'remote' : 'office'
        }
      } : undefined
    };

    // Use upsert to create or update
    const attendanceRecord = await Attendance.findOneAndUpdate(
      { employee: employee._id, date: new Date(date) },
      attendanceData,
      { upsert: true, new: true, runValidators: true }
    ).populate('employee', 'firstName lastName employeeId');

    return NextResponse.json({
      meta: {
        status: 201,
        message: 'Attendance record created/updated successfully',
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
          notes: attendanceRecord.notes
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/hr/attendance:', error);

    return NextResponse.json({
      meta: {
        status: 500,
        message: 'Internal server error'
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