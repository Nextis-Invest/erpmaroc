import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/database/connectToDB";
import Employee from "@/model/hr/employee";
import Department from "@/model/hr/department";
import Team from "@/model/hr/team";
import LeaveRequest from "@/model/hr/leaveRequest";
import { getMockData, mockAnalytics } from "@/lib/hr/mockData";

// GET /api/hr/analytics - Get HR analytics and dashboard data
export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const useMockData = searchParams.get("mock") === "true";

    if (useMockData) {
      // Return mock analytics data
      const employees = getMockData('employees');
      const departments = getMockData('departments');
      const teams = getMockData('teams');
      const leaveRequests = getMockData('leaveRequests');
      const attendance = getMockData('attendance');

      const analytics = {
        ...mockAnalytics,

        // Recent activities
        recentActivities: [
          {
            type: 'leave_request',
            description: 'Safaa Oujdi submitted leave request',
            timestamp: new Date('2024-03-25'),
            user: 'Safaa Oujdi'
          },
          {
            type: 'employee_added',
            description: 'New employee Yasmine Benali added',
            timestamp: new Date('2024-03-20'),
            user: 'HR Admin'
          },
          {
            type: 'leave_approved',
            description: 'Khalid Amrani\'s sick leave approved',
            timestamp: new Date('2024-03-15'),
            user: 'Rachid Berrada'
          }
        ],

        // Leave statistics
        leaveStats: {
          totalRequests: leaveRequests.length,
          pendingRequests: leaveRequests.filter((req: any) => req.status === 'pending').length,
          approvedRequests: leaveRequests.filter((req: any) => req.status === 'approved').length,
          rejectedRequests: leaveRequests.filter((req: any) => req.status === 'rejected').length
        },

        // Attendance overview
        attendanceOverview: {
          present: attendance.filter((att: any) => att.status === 'present').length,
          absent: 0,
          late: attendance.filter((att: any) =>
            new Date(att.checkIn) > new Date(att.checkIn.getFullYear(), att.checkIn.getMonth(), att.checkIn.getDate(), 9, 15)
          ).length,
          remote: attendance.filter((att: any) => att.isRemote).length
        },

        // Birthday reminders
        upcomingBirthdays: employees
          .filter((emp: any) => {
            const today = new Date();
            const birthday = new Date(emp.birthDate);
            const nextBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());

            if (nextBirthday < today) {
              nextBirthday.setFullYear(today.getFullYear() + 1);
            }

            const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return daysUntil <= 30;
          })
          .map((emp: any) => {
            const today = new Date();
            const birthday = new Date(emp.birthDate);
            const nextBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());

            if (nextBirthday < today) {
              nextBirthday.setFullYear(today.getFullYear() + 1);
            }

            const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            return {
              employee: `${emp.firstName} ${emp.lastName}`,
              date: nextBirthday,
              daysUntil
            };
          })
          .sort((a: any, b: any) => a.daysUntil - b.daysUntil),

        // Employee status distribution
        employeeStatusDistribution: [
          { status: 'Active', count: employees.filter((emp: any) => emp.status === 'active').length },
          { status: 'On Leave', count: employees.filter((emp: any) => emp.status === 'on-leave').length },
          { status: 'Inactive', count: employees.filter((emp: any) => emp.status === 'inactive').length }
        ],

        // Gender distribution
        genderDistribution: [
          { gender: 'Male', count: employees.filter((emp: any) => emp.gender === 'male').length },
          { gender: 'Female', count: employees.filter((emp: any) => emp.gender === 'female').length }
        ],

        // Employment type distribution
        employmentTypeDistribution: [
          { type: 'Full-time', count: employees.filter((emp: any) => emp.employmentType === 'full-time').length },
          { type: 'Part-time', count: employees.filter((emp: any) => emp.employmentType === 'part-time').length },
          { type: 'Contract', count: employees.filter((emp: any) => emp.employmentType === 'contract').length }
        ]
      };

      return NextResponse.json({
        meta: { status: 200 },
        data: { analytics }
      });
    }

    await connectToDB();

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get current date info for filtering
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Employee statistics
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    const newHiresThisMonth = await Employee.countDocuments({
      hireDate: { $gte: startOfMonth }
    });

    // Department and team counts
    const departmentCount = await Department.countDocuments({ status: 'active' });
    const teamCount = await Team.countDocuments({ status: 'active' });

    // Leave request statistics
    const totalLeaveRequests = await LeaveRequest.countDocuments();
    const pendingLeaveRequests = await LeaveRequest.countDocuments({ status: 'pending' });
    const approvedLeaveRequests = await LeaveRequest.countDocuments({ status: 'approved' });

    // Department-wise employee distribution
    const departmentDistribution = await Employee.aggregate([
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'department'
        }
      },
      { $unwind: '$department' },
      {
        $group: {
          _id: '$department.name',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          department: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    // Monthly hiring trend (last 6 months)
    const monthlyHires = await Employee.aggregate([
      {
        $match: {
          hireDate: {
            $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$hireDate' },
            month: { $month: '$hireDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Upcoming birthdays (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingBirthdays = await Employee.find({
      status: 'active',
      $expr: {
        $lte: [
          {
            $dayOfYear: {
              $dateFromParts: {
                year: { $year: now },
                month: { $month: '$birthDate' },
                day: { $dayOfMonth: '$birthDate' }
              }
            }
          },
          { $dayOfYear: thirtyDaysFromNow }
        ]
      }
    }, 'firstName lastName birthDate').limit(10);

    const analytics = {
      totalEmployees,
      activeEmployees,
      newHiresThisMonth,
      departmentCount,
      teamCount,
      totalLeaveRequests,
      pendingLeaveRequests,
      approvedLeaveRequests,
      departmentDistribution,
      monthlyHires,
      upcomingBirthdays
    };

    return NextResponse.json({
      meta: { status: 200 },
      data: { analytics }
    });

  } catch (error) {
    console.error("Error fetching HR analytics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};