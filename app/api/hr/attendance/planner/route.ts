import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/database/connectToDB";
import Attendance from "@/model/hr/attendance";
import Employee from "@/model/hr/employee";
import Team from "@/model/hr/team";
import Project from "@/model/hr/project";
import { getMockAttendanceData, mockEmployees } from "@/lib/mockData/attendance";

// GET /api/hr/attendance/planner - Get attendance data for planner view
export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();

    const searchParams = req.nextUrl.searchParams;
    const projectId = searchParams.get("projectId");
    const teamId = searchParams.get("teamId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const useMock = searchParams.get("mock") === "true";

    // Validate required parameters
    if (!projectId || !teamId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Paramètres requis: projectId, teamId, startDate, endDate" },
        { status: 400 }
      );
    }

    if (useMock) {
      // Use mock data for development
      const employees = mockEmployees[teamId as keyof typeof mockEmployees] || [];
      const attendanceData = generateMockAttendanceData(employees, startDate, endDate, projectId, teamId);
      const stats = calculateAttendanceStats(attendanceData);

      return NextResponse.json({
        success: true,
        data: {
          employees,
          attendance: attendanceData,
          stats
        },
        meta: {
          projectId,
          teamId,
          startDate,
          endDate,
          employeeCount: employees.length,
          attendanceRecords: attendanceData.length,
          status: 200
        }
      });
    }

    // Verify project and team exist
    const project = await Project.findOne({
      _id: projectId,
      isDeleted: false
    });

    if (!project) {
      return NextResponse.json(
        { error: "Projet introuvable" },
        { status: 404 }
      );
    }

    const team = await Team.findOne({
      _id: teamId,
      status: 'active'
    }).populate('members.employee', 'employeeId firstName lastName position email');

    if (!team) {
      return NextResponse.json(
        { error: "Équipe introuvable" },
        { status: 404 }
      );
    }

    // Get employees from team
    const employees = team.members.map((member: any) => ({
      _id: member.employee._id,
      employeeId: member.employee.employeeId,
      firstName: member.employee.firstName,
      lastName: member.employee.lastName,
      position: member.employee.position,
      email: member.employee.email,
      role: member.role,
      joinDate: member.joinDate
    }));

    // Get real attendance data
    const attendanceData = await Attendance.find({
      project: projectId,
      team: teamId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).populate('employee', 'employeeId firstName lastName position')
      .sort({ date: 1, 'employee.firstName': 1 });

    // Calculate statistics
    const stats = calculateAttendanceStats(attendanceData);

    return NextResponse.json({
      success: true,
      data: {
        employees,
        attendance: attendanceData,
        stats
      },
      meta: {
        projectId,
        teamId,
        startDate,
        endDate,
        employeeCount: employees.length,
        attendanceRecords: attendanceData.length,
        status: 200
      }
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des données de présence:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
};

// Helper function to generate mock attendance data
function generateMockAttendanceData(employees: any[], startDate: string, endDate: string, projectId: string, teamId: string) {
  const attendanceData = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  const statuses = [
    'present', 'present', 'present', 'present', 'present', // 50% present
    'late', 'late', // 20% late
    'absent', // 10% absent
    'leave', // 10% leave
    'work-from-home' // 10% remote
  ];

  const workLocations = ['office', 'office', 'office', 'remote'];

  for (const employee of employees) {
    const current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      if (!isWeekend) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const workLocation = workLocations[Math.floor(Math.random() * workLocations.length)];

        let checkIn, checkOut, actualHours = 0, overtimeHours = 0;

        if (status === 'present' || status === 'late' || status === 'work-from-home') {
          const baseStart = 9; // 9 AM
          const startHour = status === 'late' ? baseStart + Math.random() * 2 : baseStart + (Math.random() - 0.5) * 0.5;
          const workHours = 8 + (Math.random() - 0.5) * 2; // 7-9 hours

          checkIn = {
            time: new Date(current.getFullYear(), current.getMonth(), current.getDate(),
              Math.floor(startHour), Math.floor((startHour % 1) * 60)),
            location: {
              type: status === 'work-from-home' ? 'remote' : 'office'
            }
          };

          checkOut = {
            time: new Date(checkIn.time.getTime() + workHours * 60 * 60 * 1000)
          };

          actualHours = workHours;
          overtimeHours = Math.max(0, workHours - 8);
        }

        attendanceData.push({
          _id: `mock_${employee._id}_${current.toISOString().split('T')[0]}`,
          employee: {
            _id: employee._id,
            employeeId: employee.employeeId,
            firstName: employee.firstName,
            lastName: employee.lastName,
            position: employee.position
          },
          project: projectId,
          team: teamId,
          date: current.toISOString().split('T')[0],
          status,
          checkIn,
          checkOut,
          actualHours: Math.round(actualHours * 100) / 100,
          overtimeHours: Math.round(overtimeHours * 100) / 100,
          workLocation: status === 'work-from-home' ? 'remote' : workLocation,
          scheduledHours: 8,
          notes: status === 'leave' ? 'Congé annuel' :
                 status === 'sick-leave' ? 'Congé maladie' :
                 status === 'training' ? 'Formation' : undefined
        });
      }

      current.setDate(current.getDate() + 1);
    }
  }

  return attendanceData;
}

// Helper function to calculate attendance statistics
function calculateAttendanceStats(attendanceData: any[]) {
  const total = attendanceData.length;
  const statusCounts = attendanceData.reduce((acc, record) => {
    acc[record.status] = (acc[record.status] || 0) + 1;
    return acc;
  }, {});

  const present = statusCounts.present || 0;
  const late = statusCounts.late || 0;
  const absent = statusCounts.absent || 0;
  const leave = (statusCounts.leave || 0) + (statusCounts['sick-leave'] || 0);
  const remote = statusCounts['work-from-home'] || 0;

  const attendanceRate = total > 0 ? ((present + late + remote) / total) * 100 : 0;

  const totalHours = attendanceData.reduce((sum, record) => sum + (record.actualHours || 0), 0);
  const totalOvertimeHours = attendanceData.reduce((sum, record) => sum + (record.overtimeHours || 0), 0);
  const avgHours = total > 0 ? totalHours / total : 0;

  return {
    totalEmployees: new Set(attendanceData.map(r => r.employee._id)).size,
    totalRecords: total,
    present,
    absent,
    late,
    leave,
    remote,
    attendanceRate: Math.round(attendanceRate * 100) / 100,
    totalHours: Math.round(totalHours * 100) / 100,
    totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
    avgHours: Math.round(avgHours * 100) / 100,
    statusBreakdown: statusCounts
  };
}