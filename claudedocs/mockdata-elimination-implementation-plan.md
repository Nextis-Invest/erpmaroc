# MockData Elimination Implementation Plan

## Overview
This document provides step-by-step implementation guide with specific code changes to eliminate all mockdata dependencies and achieve 100% MongoDB connectivity.

## Phase 1: Critical Priority Fixes

### 1.1 Fix Employee API Route (CRITICAL)

**File**: `/app/api/hr/employees/route.ts`

**Problem**: Line 24 has `if (true)` hardcoded to use mock data

**Solution**: Replace the hardcoded condition with database operations

```typescript
// REMOVE lines 23-64 (the entire if(true) block)
// KEEP the existing database operations (lines 67-128)

// Updated GET function should look like:
export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const department = searchParams.get("department");
    const team = searchParams.get("team");
    const status = searchParams.get("status") || "active";

    // Connect to database
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Build query
    let query: any = { status };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (department && department !== "all") {
      query.department = department;
    }

    if (team) {
      query.team = team;
    }

    // Count total documents
    const total = await Employee.countDocuments(query);

    // Get employees with pagination
    const employees = await Employee.find(query)
      .populate('department', 'name code')
      .populate('team', 'name code')
      .populate('manager', 'firstName lastName employeeId')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return NextResponse.json({
      meta: {
        status: 200,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      data: { employees }
    });

  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
```

**Also update POST method**:
```typescript
// Remove lines 134-155 (useMockData handling)
// Keep existing database logic (lines 157-203)
```

### 1.2 Fix Client-Side API Calls (CRITICAL)

**File**: `/lib/api/employeeApi.ts`

**Problem**: Hardcoded `mock: 'true'` parameter

**Solution**: Complete rewrite to use database API

```typescript
import { apiClient } from '@/lib/utils/apiClient';

interface FetchEmployeesParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  team?: string;
  status?: string;
}

export async function fetchEmployees(params: FetchEmployeesParams) {
  const queryParams = new URLSearchParams({
    page: (params.page || 1).toString(),
    limit: (params.limit || 10).toString(),
    status: params.status || 'active',
  });

  if (params.search) {
    queryParams.append('search', params.search);
  }

  if (params.department && params.department !== 'all') {
    queryParams.append('department', params.department);
  }

  if (params.team) {
    queryParams.append('team', params.team);
  }

  try {
    const response = await apiClient<any>(`/api/hr/employees?${queryParams}`);

    if (response.data && response.data.meta?.status === 200) {
      return {
        employees: response.data.data.employees,
        pagination: {
          total: response.data.meta.total,
          page: response.data.meta.page,
          limit: response.data.meta.limit,
          totalPages: response.data.meta.totalPages,
        },
      };
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
}

// Add additional API functions
export async function createEmployee(employeeData: any) {
  try {
    const response = await apiClient<any>('/api/hr/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data && response.data.meta?.status === 201) {
      return response.data.data.employee;
    }

    throw new Error('Failed to create employee');
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
}

export async function updateEmployee(id: string, employeeData: any) {
  try {
    const response = await apiClient<any>(`/api/hr/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data && response.data.meta?.status === 200) {
      return response.data.data.employee;
    }

    throw new Error('Failed to update employee');
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
}

export async function deleteEmployee(id: string) {
  try {
    const response = await apiClient<any>(`/api/hr/employees/${id}`, {
      method: 'DELETE',
    });

    if (response.data && response.data.meta?.status === 200) {
      return true;
    }

    throw new Error('Failed to delete employee');
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw error;
  }
}
```

### 1.3 Implement Attendance Database Logic (CRITICAL)

**File**: `/app/api/hr/attendance/route.ts`

**Problem**: Returns 501 "Database attendance not implemented yet"

**Solution**: Complete rewrite with database operations

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import { connectToDB } from "@/lib/database/connectToDB";
import Employee from "@/model/hr/employee";
import Attendance from "@/model/hr/attendance";

interface AttendanceStats {
  totalEmployees: number;
  present: number;
  absent: number;
  late: number;
  remote: number;
  onLeave: number;
  attendanceRate: number;
}

/**
 * GET /api/hr/attendance - Get attendance records for a specific date
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Parse the date and get start/end of day
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get attendance records for the date
    const attendanceRecords = await Attendance.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).populate('employee', 'firstName lastName employeeId');

    // Get all active employees to check who's missing attendance
    const allEmployees = await Employee.find({ status: 'active' }).select('_id firstName lastName employeeId');

    // Create attendance map
    const attendanceMap = new Map();
    attendanceRecords.forEach(record => {
      attendanceMap.set(record.employee._id.toString(), record);
    });

    // Build complete attendance list
    const completeAttendance = allEmployees.map(employee => {
      const existingRecord = attendanceMap.get(employee._id.toString());

      if (existingRecord) {
        return {
          _id: existingRecord._id,
          employee: {
            firstName: existingRecord.employee.firstName,
            lastName: existingRecord.employee.lastName,
            employeeId: existingRecord.employee.employeeId
          },
          date: existingRecord.date.toISOString().split('T')[0],
          checkIn: existingRecord.checkIn?.toISOString(),
          checkOut: existingRecord.checkOut?.toISOString(),
          status: existingRecord.status,
          scheduledHours: existingRecord.scheduledHours || 8,
          actualHours: existingRecord.actualHours || 0,
          overtimeHours: existingRecord.overtimeHours || 0,
          isRemote: existingRecord.isRemote || false,
          notes: existingRecord.notes
        };
      } else {
        // Create default absent record for missing employees
        return {
          _id: `pending_${employee._id}_${date}`,
          employee: {
            firstName: employee.firstName,
            lastName: employee.lastName,
            employeeId: employee.employeeId
          },
          date: date,
          status: 'absent',
          scheduledHours: 8,
          actualHours: 0,
          overtimeHours: 0,
          isRemote: false
        };
      }
    });

    // Calculate statistics
    const stats: AttendanceStats = {
      totalEmployees: completeAttendance.length,
      present: completeAttendance.filter(r => r.status === 'present').length,
      absent: completeAttendance.filter(r => r.status === 'absent').length,
      late: completeAttendance.filter(r => r.status === 'late').length,
      remote: completeAttendance.filter(r => r.isRemote).length,
      onLeave: completeAttendance.filter(r => r.status === 'leave').length,
      attendanceRate: 0
    };

    stats.attendanceRate = stats.totalEmployees > 0
      ? Number((((stats.present + stats.late) / stats.totalEmployees) * 100).toFixed(1))
      : 0;

    return NextResponse.json({
      meta: {
        status: 200,
        message: 'Attendance records retrieved successfully',
        date: date,
      },
      data: {
        attendance: completeAttendance,
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
    }, { status: 500 });
  }
}

/**
 * POST /api/hr/attendance - Create or update attendance record
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { employeeId, date, status, checkIn, checkOut, isRemote, notes } = body;

    if (!employeeId || !date || !status) {
      return NextResponse.json({
        meta: {
          status: 400,
          message: 'Missing required fields: employeeId, date, status'
        },
        data: null
      }, { status: 400 });
    }

    // Find employee by employeeId
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return NextResponse.json({
        meta: {
          status: 404,
          message: 'Employee not found'
        },
        data: null
      }, { status: 404 });
    }

    // Parse the date
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if attendance record already exists for this date
    let attendanceRecord = await Attendance.findOne({
      employee: employee._id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    // Calculate actual hours if both check-in and check-out are provided
    let actualHours = 0;
    let overtimeHours = 0;

    if (checkIn && checkOut) {
      const checkInTime = new Date(checkIn);
      const checkOutTime = new Date(checkOut);
      const timeDiff = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
      actualHours = Math.max(0, Number((timeDiff - 1).toFixed(2))); // Subtract 1h for lunch
      overtimeHours = Math.max(0, actualHours - 8);
    }

    const attendanceData = {
      employee: employee._id,
      date: targetDate,
      status,
      checkIn: checkIn ? new Date(checkIn) : undefined,
      checkOut: checkOut ? new Date(checkOut) : undefined,
      scheduledHours: 8,
      actualHours,
      overtimeHours,
      isRemote: isRemote || false,
      notes
    };

    if (attendanceRecord) {
      // Update existing record
      Object.assign(attendanceRecord, attendanceData);
      await attendanceRecord.save();
    } else {
      // Create new record
      attendanceRecord = new Attendance(attendanceData);
      await attendanceRecord.save();
    }

    // Populate employee data for response
    await attendanceRecord.populate('employee', 'firstName lastName employeeId');

    return NextResponse.json({
      meta: {
        status: 201,
        message: 'Attendance record saved successfully'
      },
      data: {
        attendance: attendanceRecord
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
    }, { status: 500 });
  }
}
```

## Phase 2: Secondary Priority Fixes

### 2.1 Fix Department Routes

**File**: `/app/api/hr/departments/route.ts`

**Changes needed**:
```typescript
// Remove useMockData parameter handling in both GET and POST methods
// Remove lines 13-29 in GET method (mock data handling)
// Remove lines 79-97 in POST method (mock data handling)
// Default to database operations only
```

### 2.2 Fix Analytics Routes

**File**: `/app/api/hr/analytics/route.ts`

**Solution**: Replace with real database aggregations

```typescript
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/database/connectToDB";
import Employee from "@/model/hr/employee";
import Department from "@/model/hr/department";
import Team from "@/model/hr/team";
import LeaveRequest from "@/model/hr/leaveRequest";
import Attendance from "@/model/hr/attendance";

export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get current date for today's calculations
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Calculate analytics from real data
    const [
      totalEmployees,
      activeEmployees,
      totalDepartments,
      totalTeams,
      pendingLeaveRequests,
      todayAttendance
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: 'active' }),
      Department.countDocuments({ status: 'active' }),
      Team.countDocuments({ status: 'active' }),
      LeaveRequest.countDocuments({ status: 'pending' }),
      Attendance.countDocuments({
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['present', 'late'] }
      })
    ]);

    // Calculate attendance rate
    const attendanceRate = activeEmployees > 0
      ? Number(((todayAttendance / activeEmployees) * 100).toFixed(1))
      : 0;

    // Get department breakdown
    const departmentStats = await Department.aggregate([
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: 'department',
          as: 'employees'
        }
      },
      {
        $project: {
          name: 1,
          employeeCount: { $size: '$employees' }
        }
      },
      { $sort: { employeeCount: -1 } }
    ]);

    const analytics = {
      totalEmployees,
      activeEmployees,
      totalDepartments,
      totalTeams,
      pendingLeaveRequests,
      attendanceRate,
      todayAttendance,
      departmentBreakdown: departmentStats
    };

    return NextResponse.json({
      meta: { status: 200 },
      data: { analytics }
    });

  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
```

## Phase 3: Component Updates

### 3.1 Update ProjectTeamAssignment Component

**File**: `/components/hr/ProjectTeamAssignment.tsx`

**Problem**: Lines 59-184 contain inline mockEmployees array

**Solution**: Replace with API call

```typescript
// Remove lines 59-184 (mockEmployees array)
// Add this hook at the top of the component:

const [employees, setEmployees] = useState<Employee[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetchEmployees({ limit: 100, status: 'active' });
      setEmployees(response.employees);
    } catch (error) {
      console.error('Failed to load employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  loadEmployees();
}, []);

// Replace line 185: const teamLead = mockEmployees.find(...)
const teamLead = employees.find(emp => emp.employeeId === team.teamLead);

// Replace line 541: {mockEmployees.map(employee => (
{employees.map(employee => (
```

## Phase 4: Database Testing and Verification

### 4.1 Create Database Test Script

**File**: `/scripts/test-database-connection.js`

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Test collections
    const Employee = require('../model/hr/employee');
    const Department = require('../model/hr/department');

    const employeeCount = await Employee.countDocuments();
    const departmentCount = await Department.countDocuments();

    console.log(`📊 Found ${employeeCount} employees`);
    console.log(`📊 Found ${departmentCount} departments`);

    // Test a simple query
    const firstEmployee = await Employee.findOne().populate('department');
    if (firstEmployee) {
      console.log(`👤 Sample employee: ${firstEmployee.firstName} ${firstEmployee.lastName}`);
      console.log(`🏢 Department: ${firstEmployee.department?.name || 'No department'}`);
    }

    console.log('✅ Database test completed successfully');

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

testConnection();
```

### 4.2 Add package.json Script

```json
{
  "scripts": {
    "test-db": "node scripts/test-database-connection.js"
  }
}
```

## Phase 5: Final Cleanup

### 5.1 Remove MockData Files

**Files to delete**:
```bash
rm -rf lib/hr/mockData.ts
rm -rf lib/mockData/
rm -rf lib/payroll/mockPayrollData.ts
rm -rf scripts/addMissingFieldsToMockData.js
```

### 5.2 Search and Remove Remaining References

```bash
# Search for any remaining mock imports
grep -r "mockData\|getMockData\|mockEmployees" --include="*.ts" --include="*.tsx" .

# Remove any found imports and replace with proper API calls
```

## Implementation Checklist

### Phase 1 (Critical) ✅
- [ ] Fix `/app/api/hr/employees/route.ts` - Remove hardcoded `if (true)`
- [ ] Fix `/lib/api/employeeApi.ts` - Remove `mock: 'true'`
- [ ] Implement `/app/api/hr/attendance/route.ts` database logic
- [ ] Test employee CRUD operations
- [ ] Test attendance operations

### Phase 2 (High Priority) ✅
- [ ] Fix `/app/api/hr/departments/route.ts`
- [ ] Fix `/app/api/hr/analytics/route.ts`
- [ ] Fix `/app/api/hr/leave-requests/route.ts`
- [ ] Test all updated endpoints

### Phase 3 (Medium Priority) ✅
- [ ] Update `/components/hr/ProjectTeamAssignment.tsx`
- [ ] Test component with real data
- [ ] Verify UI still works correctly

### Phase 4 (Testing) ✅
- [ ] Create database test script
- [ ] Run comprehensive API tests
- [ ] Verify all endpoints return real data
- [ ] Performance testing

### Phase 5 (Cleanup) ✅
- [ ] Remove all mockdata files
- [ ] Clean up imports
- [ ] Remove unused mock utilities
- [ ] Update documentation

## Post-Implementation Verification

1. **Database Connectivity**: Verify all endpoints connect to MongoDB
2. **Data Integrity**: Ensure real data is returned from all APIs
3. **Performance**: Monitor response times and optimize queries
4. **Error Handling**: Test error scenarios and fallback behavior
5. **User Experience**: Verify UI works with real data loading states

## Rollback Strategy

If issues arise during implementation:

1. **Immediate Rollback**: Restore the hardcoded mock conditions
2. **Incremental Rollback**: Revert changes file by file
3. **Feature Flags**: Add environment variable to toggle between mock and real data
4. **Database Backup**: Ensure database can be restored if corrupted

---

**Generated**: $(date)
**Status**: Ready for Implementation
**Estimated Time**: 2-3 days for complete implementation