import { connectToDB } from '@/lib/database/connectToDB';
import Employee from '@/model/hr/employee';
import Attendance from '@/model/hr/attendance';
import BRANCH from '@/model/branchData';
import { mockEmployees, mockAttendanceRecords } from '@/lib/hr/mockData';

async function seedAttendanceData() {
  try {
    console.log('🚀 Starting attendance data seeding...');

    await connectToDB();
    console.log('✅ Connected to database');

    // Get or create a default branch
    let defaultBranch = await BRANCH.findOne();
    if (!defaultBranch) {
      defaultBranch = await BRANCH.create({
        name: 'Main Branch',
        code: 'MAIN001',
        address: 'Casablanca, Morocco',
        manager: 'System Admin',
        status: 'active'
      });
      console.log('✅ Created default branch');
    } else {
      console.log('📋 Using existing branch:', defaultBranch.name);
    }

    // First, ensure employees exist in database
    console.log('📝 Seeding employees first...');
    const employeeMap = new Map();

    for (const mockEmployee of mockEmployees) {
      const existingEmployee = await Employee.findOne({ employeeId: mockEmployee.employeeId });

      if (!existingEmployee) {
        const newEmployee = await Employee.create({
          employeeId: mockEmployee.employeeId,
          firstName: mockEmployee.firstName,
          lastName: mockEmployee.lastName,
          email: mockEmployee.email,
          phone: mockEmployee.phone,
          position: mockEmployee.position,
          department: mockEmployee.department,
          team: mockEmployee.team,
          hireDate: mockEmployee.hireDate,
          salary: mockEmployee.salary,
          contractType: mockEmployee.contractType,
          status: mockEmployee.status,
          avatar: mockEmployee.avatar
        });
        employeeMap.set(mockEmployee._id, newEmployee._id);
        console.log(`✅ Created employee: ${mockEmployee.firstName} ${mockEmployee.lastName}`);
      } else {
        employeeMap.set(mockEmployee._id, existingEmployee._id);
        console.log(`📋 Employee exists: ${mockEmployee.firstName} ${mockEmployee.lastName}`);
      }
    }

    // Clear existing attendance records
    console.log('🗑️ Clearing existing attendance records...');
    await Attendance.deleteMany({});

    // Seed attendance records
    console.log('📊 Seeding attendance records...');
    let attendanceCount = 0;

    for (const mockAttendance of mockAttendanceRecords) {
      const employeeId = employeeMap.get(mockAttendance.employee);

      if (!employeeId) {
        console.warn(`⚠️ Skipping attendance record - Employee not found for ID: ${mockAttendance.employee}`);
        continue;
      }

      const attendanceData = {
        employee: employeeId,
        branch: defaultBranch._id,
        date: new Date(mockAttendance.date),
        status: mockAttendance.status,
        scheduledHours: mockAttendance.scheduledHours || 8,
        notes: `Seeded mock data - ${mockAttendance.status}`,
      };

      // Add check-in data if present
      if (mockAttendance.checkIn) {
        attendanceData.checkIn = {
          time: new Date(mockAttendance.checkIn),
          location: {
            type: mockAttendance.isRemote ? 'remote' : 'office',
            address: mockAttendance.isRemote ? 'Remote work' : 'Office'
          }
        };
      }

      // Add check-out data if present
      if (mockAttendance.checkOut) {
        attendanceData.checkOut = {
          time: new Date(mockAttendance.checkOut),
          location: {
            type: mockAttendance.isRemote ? 'remote' : 'office',
            address: mockAttendance.isRemote ? 'Remote work' : 'Office'
          }
        };
      }

      // Add breaks if present
      if (mockAttendance.breaks && mockAttendance.breaks.length > 0) {
        attendanceData.breaks = mockAttendance.breaks.map(breakItem => ({
          start: new Date(breakItem.start),
          end: new Date(breakItem.end),
          type: breakItem.type,
          duration: (new Date(breakItem.end).getTime() - new Date(breakItem.start).getTime()) / (1000 * 60) // minutes
        }));
      }

      await Attendance.create(attendanceData);
      attendanceCount++;

      const employee = mockEmployees.find(emp => emp._id === mockAttendance.employee);
      console.log(`✅ Created attendance record for ${employee?.firstName} ${employee?.lastName} on ${mockAttendance.date.toISOString().split('T')[0]}`);
    }

    // Generate additional attendance data for the past week
    console.log('📅 Generating additional attendance data for past week...');
    const today = new Date();
    const pastWeek = [];

    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      pastWeek.push(date);
    }

    let additionalCount = 0;
    for (const employee of mockEmployees) {
      const dbEmployeeId = employeeMap.get(employee._id);

      for (const date of pastWeek) {
        // Check if attendance already exists for this date
        const existingAttendance = await Attendance.findOne({
          employee: dbEmployeeId,
          date: date
        });

        if (existingAttendance) {
          continue; // Skip if already exists
        }

        // Generate random but realistic attendance
        const statuses = ['present', 'present', 'present', 'present', 'late', 'absent'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const isRemote = Math.random() < 0.3; // 30% chance of remote work

        const attendanceData = {
          employee: dbEmployeeId,
          branch: defaultBranch._id,
          date: date,
          status: status,
          scheduledHours: 8,
          notes: `Auto-generated - ${status}`,
        };

        if (status === 'present' || status === 'late') {
          // Generate realistic check-in/out times
          const checkInTime = new Date(date);
          const baseHour = status === 'late' ? 9.5 + Math.random() * 1 : 8.5 + Math.random() * 0.5;
          checkInTime.setHours(Math.floor(baseHour), (baseHour % 1) * 60, 0, 0);

          const checkOutTime = new Date(checkInTime);
          checkOutTime.setHours(checkOutTime.getHours() + 8, checkOutTime.getMinutes() + Math.random() * 30, 0, 0);

          attendanceData.checkIn = {
            time: checkInTime,
            location: {
              type: isRemote ? 'remote' : 'office',
              address: isRemote ? 'Remote work' : 'Office'
            }
          };

          attendanceData.checkOut = {
            time: checkOutTime,
            location: {
              type: isRemote ? 'remote' : 'office',
              address: isRemote ? 'Remote work' : 'Office'
            }
          };

          // Add lunch break
          attendanceData.breaks = [{
            start: new Date(checkInTime.getTime() + 4 * 60 * 60 * 1000), // 4 hours after check-in
            end: new Date(checkInTime.getTime() + 5 * 60 * 60 * 1000), // 1 hour lunch
            type: 'lunch',
            duration: 60
          }];
        }

        await Attendance.create(attendanceData);
        additionalCount++;
      }
    }

    console.log(`✅ Successfully seeded ${attendanceCount} mock attendance records`);
    console.log(`✅ Successfully generated ${additionalCount} additional attendance records`);
    console.log(`📊 Total attendance records: ${attendanceCount + additionalCount}`);
    console.log(`👥 Total employees: ${mockEmployees.length}`);

    // Generate some stats
    const totalRecords = await Attendance.countDocuments();
    const presentRecords = await Attendance.countDocuments({ status: 'present' });
    const lateRecords = await Attendance.countDocuments({ status: 'late' });
    const absentRecords = await Attendance.countDocuments({ status: 'absent' });

    console.log('\n📈 Database Statistics:');
    console.log(`Total Records: ${totalRecords}`);
    console.log(`Present: ${presentRecords}`);
    console.log(`Late: ${lateRecords}`);
    console.log(`Absent: ${absentRecords}`);

    console.log('\n🎉 Attendance data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding attendance data:', error);
    throw error;
  }
}

// Run the seeding if this script is executed directly
if (require.main === module) {
  seedAttendanceData()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedAttendanceData };