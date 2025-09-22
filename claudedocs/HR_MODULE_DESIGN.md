# Human Resources Module Design Document

## Executive Summary
This document outlines the comprehensive design for a Human Resources (HR) module to be integrated into the existing ERP system. The module will handle employee management, team organization, shift scheduling, leave management, and other essential HR functionalities while seamlessly integrating with the current system architecture.

## Existing System Overview

### Current Technology Stack
- **Framework**: Next.js 14.1.4 with App Router
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Auth0 (NextAuth v5)
- **UI Libraries**:
  - Radix UI components
  - TanStack Table/Query
  - React Hook Form
  - Tailwind CSS with shadcn/ui
- **State Management**: Zustand (recently added)
- **Data Fetching**: Axios with React Query
- **Email Service**: Resend
- **Excel Processing**: XLSX library

### Existing HR-Related Components

#### Current Staff Management System
The system already has a basic staff management module with:

**Model Structure** (`model/staffs.ts`):
- Basic employee fields: name, position, phone, address
- Compensation: salary, bonus, dayOff
- Branch association via ObjectId reference

**API Routes** (`app/api/admins/branch/staffs/route.ts`):
- POST: Create new staff member
- PATCH: Update existing staff
- GET: Retrieve staff with pagination and search
- DELETE: Remove staff member
- Authorization: Manager-level access control via Auth0 session

**UI Components**:
- `components/Staff.tsx`: Main staff component wrapper
- `components/StaffTable.tsx`: TanStack Table implementation with:
  - Pagination with localStorage persistence
  - Search functionality
  - Excel export capability
  - Add/Edit staff via sidebar forms
  - Integration with DataContext for state management

**Data Fetching** (`lib/fetch/staff.ts`):
- CRUD operations via Axios
- Pagination and search support
- Integration with React Query for caching

### Existing Related Models

#### Branch Model (`model/branchData.ts`)
- Company and location details
- Manager assignment
- Keys management system
- Child branch hierarchy support

#### Admin Model (`model/admin.ts`)
- User authentication details
- Multi-tenant support
- Debug and signup flags

#### Activity Log Model (`model/activities.ts`)
- Tracks all HR-related operations
- Branch-level activity logging

## 1. Module Overview

### Core Objectives
- **Employee Management**: Centralized database for all employee information
- **Team Organization**: Create and manage teams with hierarchical structures
- **Shift & Schedule Management**: Advanced shift planning and scheduling capabilities
- **Leave & Holiday Management**: Comprehensive leave tracking and approval workflows
- **Payroll Integration**: Seamless integration with existing payroll calculations
- **Performance Tracking**: Monitor employee performance and productivity
- **Self-Service Portal**: Employee and manager self-service capabilities

## 2. Data Models

### 2.1 Employee Model (Enhanced)
```typescript
// model/employee.ts
const employeeSchema = new mongoose.Schema({
  // Basic Information
  employeeId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  middleName: String,
  email: { type: String, required: true, unique: true },
  personalEmail: String,
  phone: { type: String, required: true },
  alternatePhone: String,

  // Employment Details
  position: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'BRANCH', required: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },

  // Employment Status
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'intern', 'temporary'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on-leave', 'terminated', 'suspended'],
    default: 'active'
  },

  // Dates
  hireDate: { type: Date, required: true },
  confirmationDate: Date,
  lastWorkingDate: Date,
  birthDate: { type: Date, required: true },

  // Compensation
  salary: { type: Number, required: true, min: 0 },
  bonus: { type: Number, min: 0, default: 0 },
  allowances: [{
    type: { type: String },
    amount: { type: Number, min: 0 }
  }],

  // Personal Information
  gender: { type: String, enum: ['male', 'female', 'other'] },
  maritalStatus: { type: String, enum: ['single', 'married', 'divorced', 'widowed'] },
  nationality: String,
  nationalId: String,
  passportNumber: String,

  // Address
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },

  // Emergency Contact
  emergencyContact: {
    name: { type: String, required: true },
    relationship: String,
    phone: { type: String, required: true },
    address: String
  },

  // Bank Details
  bankAccount: {
    bankName: String,
    accountNumber: String,
    accountType: String,
    routingNumber: String
  },

  // Skills & Qualifications
  skills: [String],
  education: [{
    degree: String,
    institution: String,
    year: Number,
    field: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    expiryDate: Date
  }],

  // Documents
  documents: [{
    type: String,
    name: String,
    url: String,
    uploadDate: { type: Date, default: Date.now }
  }],

  // System Fields
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ADMIN' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ADMIN' }
});
```

### 2.2 Team Model
```typescript
// model/team.ts
const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: String,
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'BRANCH', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },

  // Team Structure
  teamLead: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  members: [{
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    role: String,
    joinDate: { type: Date, default: Date.now }
  }],

  // Team Settings
  maxMembers: { type: Number, min: 1 },
  shiftPattern: { type: mongoose.Schema.Types.ObjectId, ref: 'ShiftPattern' },
  workingDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],

  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### 2.3 Department Model
```typescript
// model/department.ts
const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: String,
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'BRANCH' },

  head: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  parentDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },

  budget: { type: Number, min: 0 },
  costCenter: String,

  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### 2.4 Shift & Schedule Models
```typescript
// model/shift.ts
const shiftSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },

  // Timing
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true }, // "17:00"
  breakDuration: { type: Number, default: 60 }, // in minutes

  // Overtime Settings
  overtimeAllowed: { type: Boolean, default: false },
  maxOvertimeHours: { type: Number, default: 0 },
  overtimeRate: { type: Number, default: 1.5 },

  // Rules
  graceTimeBefore: { type: Number, default: 15 }, // minutes
  graceTimeAfter: { type: Number, default: 15 }, // minutes
  minimumHours: { type: Number, required: true },

  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'BRANCH' },

  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
});

// model/schedule.ts
const scheduleSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true },
  shift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift' },

  // Schedule Details
  scheduledStart: Date,
  scheduledEnd: Date,

  // Actual Times (for attendance)
  actualStart: Date,
  actualEnd: Date,

  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'absent', 'cancelled'],
    default: 'scheduled'
  },

  // Overtime
  overtimeHours: { type: Number, default: 0 },
  overtimeApproved: { type: Boolean, default: false },

  // Notes
  notes: String,

  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
});
```

### 2.5 Leave Management Models
```typescript
// model/leaveType.ts
const leaveTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: String,

  // Leave Policy
  annualQuota: { type: Number, required: true },
  carryForward: { type: Boolean, default: false },
  maxCarryForward: { type: Number, default: 0 },

  // Rules
  requiresApproval: { type: Boolean, default: true },
  minDays: { type: Number, default: 1 },
  maxDays: { type: Number },
  advanceNoticeDays: { type: Number, default: 0 },

  // Eligibility
  eligibleAfterMonths: { type: Number, default: 0 },
  applicableFor: [{
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'intern', 'temporary']
  }],

  // Calculation
  paidLeave: { type: Boolean, default: true },
  includesWeekends: { type: Boolean, default: false },
  includesHolidays: { type: Boolean, default: false },

  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'BRANCH' },

  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
});

// model/leaveRequest.ts
const leaveRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  leaveType: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },

  // Duration
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  numberOfDays: { type: Number, required: true },
  isHalfDay: { type: Boolean, default: false },
  halfDayPeriod: { type: String, enum: ['morning', 'afternoon'] },

  // Reason & Documentation
  reason: { type: String, required: true },
  documents: [{
    name: String,
    url: String,
    uploadDate: Date
  }],

  // Approval Workflow
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'cancelled'],
    default: 'draft'
  },

  approvalLevels: [{
    level: Number,
    approver: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected']
    },
    comments: String,
    actionDate: Date
  }],

  // Coverage
  coveringEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },

  // System Fields
  requestDate: { type: Date, default: Date.now },
  lastModified: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
});

// model/leaveBalance.ts
const leaveBalanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  leaveType: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
  year: { type: Number, required: true },

  // Balance Details
  entitled: { type: Number, required: true },
  carriedForward: { type: Number, default: 0 },
  adjusted: { type: Number, default: 0 },
  taken: { type: Number, default: 0 },
  pending: { type: Number, default: 0 },
  available: { type: Number, required: true },

  // History
  transactions: [{
    date: Date,
    type: {
      type: String,
      enum: ['credit', 'debit', 'adjustment', 'carry-forward', 'expiry']
    },
    amount: Number,
    reference: String,
    description: String
  }],

  lastUpdated: { type: Date, default: Date.now }
});
```

### 2.6 Holiday Management
```typescript
// model/holiday.ts
const holidaySchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  year: { type: Number, required: true },

  type: {
    type: String,
    enum: ['public', 'company', 'regional', 'optional'],
    required: true
  },

  // Applicability
  branches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BRANCH' }],
  departments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],

  description: String,
  isRecurring: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ADMIN' }
});
```

### 2.7 Attendance Model
```typescript
// model/attendance.ts
const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true },

  // Check-in/out
  checkIn: Date,
  checkOut: Date,

  // Break times
  breaks: [{
    start: Date,
    end: Date,
    type: { type: String, enum: ['lunch', 'tea', 'other'] }
  }],

  // Work Hours
  scheduledHours: Number,
  actualHours: Number,
  overtimeHours: { type: Number, default: 0 },

  // Status
  status: {
    type: String,
    enum: ['present', 'absent', 'half-day', 'holiday', 'weekend', 'leave', 'late'],
    required: true
  },

  // Location (if tracking)
  checkInLocation: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  checkOutLocation: {
    latitude: Number,
    longitude: Number,
    address: String
  },

  // Remote Work
  isRemote: { type: Boolean, default: false },

  // Regularization
  regularizationRequest: {
    reason: String,
    requestedCheckIn: Date,
    requestedCheckOut: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected']
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    approvalDate: Date
  },

  notes: String,

  createdAt: { type: Date, default: Date.now },
  lastModified: { type: Date, default: Date.now }
});
```

## 3. API Routes Design

### 3.1 Employee Management Routes
```typescript
// app/api/hr/employees/route.ts
GET    /api/hr/employees                    // List all employees with pagination
POST   /api/hr/employees                    // Create new employee
GET    /api/hr/employees/:id                // Get employee details
PUT    /api/hr/employees/:id                // Update employee
DELETE /api/hr/employees/:id                // Soft delete employee
GET    /api/hr/employees/:id/documents      // Get employee documents
POST   /api/hr/employees/:id/documents      // Upload document
GET    /api/hr/employees/search             // Search employees
POST   /api/hr/employees/bulk-import        // Import employees from Excel
GET    /api/hr/employees/export             // Export employees to Excel
```

### 3.2 Team Management Routes
```typescript
// app/api/hr/teams/route.ts
GET    /api/hr/teams                        // List all teams
POST   /api/hr/teams                        // Create team
GET    /api/hr/teams/:id                    // Get team details
PUT    /api/hr/teams/:id                    // Update team
DELETE /api/hr/teams/:id                    // Delete team
POST   /api/hr/teams/:id/members            // Add team member
DELETE /api/hr/teams/:id/members/:memberId  // Remove team member
GET    /api/hr/teams/:id/schedule           // Get team schedule
```

### 3.3 Department Routes
```typescript
// app/api/hr/departments/route.ts
GET    /api/hr/departments                  // List departments
POST   /api/hr/departments                  // Create department
GET    /api/hr/departments/:id              // Get department
PUT    /api/hr/departments/:id              // Update department
DELETE /api/hr/departments/:id              // Delete department
GET    /api/hr/departments/:id/employees    // Get department employees
```

### 3.4 Shift & Schedule Routes
```typescript
// app/api/hr/shifts/route.ts
GET    /api/hr/shifts                       // List shifts
POST   /api/hr/shifts                       // Create shift
PUT    /api/hr/shifts/:id                   // Update shift
DELETE /api/hr/shifts/:id                   // Delete shift

// app/api/hr/schedules/route.ts
GET    /api/hr/schedules                    // Get schedules
POST   /api/hr/schedules                    // Create schedule
PUT    /api/hr/schedules/:id                // Update schedule
DELETE /api/hr/schedules/:id                // Cancel schedule
POST   /api/hr/schedules/bulk                // Bulk schedule creation
GET    /api/hr/schedules/calendar            // Calendar view data
POST   /api/hr/schedules/shift-swap          // Request shift swap
```

### 3.5 Leave Management Routes
```typescript
// app/api/hr/leave-types/route.ts
GET    /api/hr/leave-types                  // List leave types
POST   /api/hr/leave-types                  // Create leave type
PUT    /api/hr/leave-types/:id              // Update leave type

// app/api/hr/leave-requests/route.ts
GET    /api/hr/leave-requests                // List leave requests
POST   /api/hr/leave-requests                // Submit leave request
GET    /api/hr/leave-requests/:id            // Get request details
PUT    /api/hr/leave-requests/:id            // Update request
POST   /api/hr/leave-requests/:id/approve    // Approve request
POST   /api/hr/leave-requests/:id/reject     // Reject request
POST   /api/hr/leave-requests/:id/cancel     // Cancel request

// app/api/hr/leave-balances/route.ts
GET    /api/hr/leave-balances/:employeeId    // Get employee leave balance
PUT    /api/hr/leave-balances/:employeeId    // Adjust leave balance
GET    /api/hr/leave-balances/report         // Leave balance report
```

### 3.6 Holiday Management Routes
```typescript
// app/api/hr/holidays/route.ts
GET    /api/hr/holidays                     // List holidays
POST   /api/hr/holidays                     // Create holiday
PUT    /api/hr/holidays/:id                 // Update holiday
DELETE /api/hr/holidays/:id                 // Delete holiday
POST   /api/hr/holidays/bulk-import         // Import holidays
```

### 3.7 Attendance Routes
```typescript
// app/api/hr/attendance/route.ts
POST   /api/hr/attendance/check-in           // Employee check-in
POST   /api/hr/attendance/check-out          // Employee check-out
GET    /api/hr/attendance/:employeeId        // Get attendance records
POST   /api/hr/attendance/regularize        // Request regularization
GET    /api/hr/attendance/report             // Attendance report
POST   /api/hr/attendance/bulk-upload        // Bulk attendance upload
```

### 3.8 Reports & Analytics Routes
```typescript
// app/api/hr/reports/route.ts
GET    /api/hr/reports/headcount             // Headcount report
GET    /api/hr/reports/attendance            // Attendance summary
GET    /api/hr/reports/leave-summary         // Leave summary
GET    /api/hr/reports/overtime              // Overtime report
GET    /api/hr/reports/payroll-summary       // Payroll summary
GET    /api/hr/reports/turnover              // Employee turnover
POST   /api/hr/reports/custom                // Custom report generation
```

## 4. UI Components Design

### 4.1 Dashboard Components
```typescript
// components/hr/HRDashboard.tsx
- EmployeeStatsCard         // Total employees, departments, teams
- AttendanceSummaryCard      // Today's attendance overview
- LeaveRequestsWidget        // Pending leave requests
- BirthdayWidget            // Upcoming birthdays
- AnnouncementWidget        // HR announcements
- QuickActions              // Common HR actions
```

### 4.2 Employee Management Components
```typescript
// components/hr/employees/
- EmployeeList              // Table with search, filter, sort
- EmployeeCard              // Individual employee card view
- EmployeeForm              // Add/Edit employee form
- EmployeeProfile           // Detailed profile view
- EmployeeDocuments         // Document management
- BulkImportModal          // Excel import interface
```

### 4.3 Team Management Components
```typescript
// components/hr/teams/
- TeamList                  // Teams overview
- TeamCard                  // Team summary card
- TeamForm                  // Create/Edit team
- TeamMembers              // Team member management
- TeamScheduleCalendar      // Team schedule view
```

### 4.4 Shift & Schedule Components
```typescript
// components/hr/schedules/
- ScheduleCalendar          // Monthly/Weekly calendar view
- ShiftPlanner              // Drag-drop shift planning
- ShiftPatternCreator       // Create shift patterns
- ScheduleTimeline          // Timeline view
- ShiftSwapRequest          // Shift swap interface
```

### 4.5 Leave Management Components
```typescript
// components/hr/leave/
- LeaveRequestForm          // Submit leave request
- LeaveCalendar            // Leave calendar view
- LeaveBalanceCard         // Employee leave balance
- LeaveApprovalQueue       // Manager approval interface
- LeaveHistory             // Leave history table
```

### 4.6 Attendance Components
```typescript
// components/hr/attendance/
- AttendanceCheckIn         // Check-in/out interface
- AttendanceCalendar        // Monthly attendance view
- AttendanceReport          // Attendance reports
- RegularizationForm        // Attendance regularization
- BiometricIntegration      // Biometric device integration
```

### 4.7 Self-Service Portal Components
```typescript
// components/hr/self-service/
- EmployeeDashboard         // Personal dashboard
- ProfileUpdate             // Update personal info
- DocumentUpload            // Upload documents
- LeaveApplication          // Apply for leave
- AttendanceView            // View own attendance
- PayslipViewer            // View payslips
- TeamDirectory            // Team members directory
```

## 5. Features Implementation Priority

### Phase 1 - Core Features (Weeks 1-4)
1. **Employee Management**
   - Basic CRUD operations
   - Employee profiles
   - Document management

2. **Department & Team Setup**
   - Department creation
   - Team formation
   - Hierarchy definition

3. **Basic Attendance**
   - Check-in/Check-out
   - Attendance records
   - Basic reports

### Phase 2 - Advanced Features (Weeks 5-8)
1. **Leave Management**
   - Leave types configuration
   - Leave request workflow
   - Balance tracking
   - Approval system

2. **Shift & Scheduling**
   - Shift definitions
   - Schedule creation
   - Calendar views

3. **Holiday Management**
   - Holiday calendar
   - Branch-specific holidays

### Phase 3 - Enhancement Features (Weeks 9-12)
1. **Self-Service Portal**
   - Employee dashboard
   - Leave application
   - Document upload
   - Profile management

2. **Advanced Scheduling**
   - Shift patterns
   - Auto-scheduling
   - Shift swapping

3. **Reports & Analytics**
   - Attendance reports
   - Leave summaries
   - Custom reports

### Phase 4 - Integration & Optimization (Weeks 13-16)
1. **Payroll Integration**
   - Salary calculation integration
   - Overtime calculation
   - Deduction management

2. **Mobile Responsiveness**
   - Mobile-first UI
   - Progressive Web App features

3. **Advanced Features**
   - Biometric integration
   - Geo-location tracking
   - AI-powered scheduling

## 6. Security & Permissions

### Role-Based Access Control (RBAC)
```typescript
const hrPermissions = {
  // Super Admin
  superAdmin: ['*'],

  // HR Admin
  hrAdmin: [
    'employee.*',
    'team.*',
    'department.*',
    'leave.*',
    'attendance.*',
    'reports.*',
    'settings.*'
  ],

  // HR Manager
  hrManager: [
    'employee.read',
    'employee.create',
    'employee.update',
    'team.read',
    'team.update',
    'leave.approve',
    'attendance.read',
    'reports.read'
  ],

  // Department Manager
  manager: [
    'employee.read:department',
    'team.read:own',
    'team.update:own',
    'leave.approve:team',
    'attendance.read:team',
    'reports.read:team'
  ],

  // Team Lead
  teamLead: [
    'employee.read:team',
    'leave.approve:team',
    'attendance.read:team',
    'schedule.update:team'
  ],

  // Employee
  employee: [
    'employee.read:self',
    'employee.update:self',
    'leave.request',
    'leave.read:self',
    'attendance.read:self',
    'attendance.checkin',
    'schedule.read:self'
  ]
};
```

## 7. Integration Points & Migration Strategy

### 7.1 Existing System Integration

#### Staff to Employee Migration
```typescript
// Migration script: migrate-staff-to-employee.ts
const migrateStaffToEmployee = async () => {
  const staffMembers = await STAFF.find({});

  for (const staff of staffMembers) {
    const employee = new Employee({
      // Mapped from existing staff
      firstName: staff.name.split(' ')[0],
      lastName: staff.name.split(' ').slice(1).join(' '),
      email: `${staff.name.toLowerCase().replace(/\s/g, '.')}@company.com`,
      phone: staff.phone,
      position: staff.position,
      branch: staff.branch,
      salary: staff.salary,
      bonus: staff.bonus,
      address: {
        street: staff.address,
        // Additional fields to be collected
      },

      // New required fields with defaults
      employeeId: generateEmployeeId(),
      employmentType: 'full-time',
      status: 'active',
      hireDate: new Date(),
      birthDate: new Date('1990-01-01'), // To be updated

      // Migrated leave balance
      leaveBalance: {
        annual: 30 - (staff.dayOff || 0),
        taken: staff.dayOff || 0
      }
    });

    await employee.save();
  }
};
```

#### Integration with Existing Components
- **DataContext Integration**: Extend existing context for HR state management
- **StaffTable Enhancement**: Upgrade existing table to support new employee model
- **FormSideBar**: Extend for employee forms and workflows
- **Activity Logging**: Use existing ACTIVITYLOG model for HR operations

#### Authentication & Authorization
```typescript
// Extend existing Auth0 integration
const hrRoles = {
  'hr-admin': ['manage:employees', 'manage:leaves', 'manage:attendance'],
  'hr-manager': ['view:employees', 'approve:leaves', 'view:reports'],
  'manager': ['view:team', 'approve:team-leaves'],
  'employee': ['view:self', 'request:leave', 'mark:attendance']
};

// Integration with existing session management
const checkHRPermission = async (session, permission) => {
  const user = await ADMIN.findOne({ email: session.user.email });
  return user.hrRole && hrRoles[user.hrRole].includes(permission);
};
```

#### Database Integration
- **Maintain existing MongoDB connection**: Use `connectToDB` from existing setup
- **Extend existing models**: Build on STAFF, BRANCH, ADMIN models
- **Preserve data relationships**: Maintain branch-employee associations

### 7.2 State Management Integration with Zustand
```typescript
// stores/hrStore.ts
import { create } from 'zustand';

const useHRStore = create((set) => ({
  // Employee Management
  employees: [],
  selectedEmployee: null,

  // Leave Management
  leaveRequests: [],
  leaveBalances: [],

  // Attendance
  attendanceRecords: [],
  todayAttendance: null,

  // Actions
  setEmployees: (employees) => set({ employees }),
  setSelectedEmployee: (employee) => set({ selectedEmployee: employee }),
  updateLeaveBalance: (employeeId, balance) => set((state) => ({
    leaveBalances: state.leaveBalances.map(lb =>
      lb.employeeId === employeeId ? { ...lb, ...balance } : lb
    )
  }))
}));
```

### 7.3 UI Component Integration
- **Leverage existing Radix UI components**: Dialog, Tabs, Tooltip, etc.
- **Extend TanStack Table**: Use existing patterns from StaffTable
- **React Hook Form**: Utilize existing form validation patterns
- **Maintain design consistency**: Follow existing Tailwind/shadcn patterns

### 7.4 API Route Patterns
Follow existing patterns from staff routes:
- Session validation via Auth0
- Branch-based data isolation
- Activity logging for all operations
- Consistent response format with meta and data

### 7.5 External Integrations
- **Email Notifications**: Use existing Resend setup
- **Excel Import/Export**: Leverage existing XLSX integration
- **Calendar Integration**: Future enhancement
- **Biometric Devices**: API endpoint for device integration
- **Document Storage**: Use MongoDB GridFS initially

## 8. Performance Considerations

### Database Optimization
- Indexes on frequently queried fields (employeeId, email, branch)
- Aggregation pipelines for reports
- Caching for static data (departments, leave types)
- Pagination for large datasets

### API Optimization
- Implement rate limiting
- Use Redis for session management
- Implement request caching
- Batch operations for bulk updates

### Frontend Optimization
- Lazy loading for components
- Virtual scrolling for large lists
- Optimistic UI updates
- Progressive data loading

## 9. Testing Strategy

### Unit Tests
- Model validation tests
- API route tests
- Component unit tests
- Utility function tests

### Integration Tests
- API integration tests
- Database operation tests
- Authentication flow tests
- Permission tests

### E2E Tests
- Employee onboarding flow
- Leave request workflow
- Attendance marking
- Report generation

## 10. Deployment Considerations

### Environment Variables
```env
# HR Module Configuration
HR_MODULE_ENABLED=true
MAX_LEAVE_DAYS=30
ATTENDANCE_GRACE_TIME=15
SHIFT_SWAP_ENABLED=true
GEO_TRACKING_ENABLED=false
BIOMETRIC_API_URL=
```

### Migration Scripts
- Data migration from existing staff model
- Initial seed data (leave types, shifts, holidays)
- Permission setup scripts
- Report templates initialization

## 11. Success Metrics

### Key Performance Indicators (KPIs)
- Employee data accuracy: >99%
- Leave request processing time: <24 hours
- Attendance tracking accuracy: >98%
- System uptime: >99.9%
- User adoption rate: >90% in 3 months
- Report generation time: <30 seconds

### User Satisfaction Metrics
- Employee self-service usage
- Manager approval turnaround time
- Support ticket reduction
- Feature utilization rates

## 12. Future Enhancements

### AI & Machine Learning
- Predictive analytics for leave patterns
- Automatic shift optimization
- Anomaly detection in attendance
- Smart employee recommendations

### Advanced Features
- Performance management module
- Training & development tracking
- Employee engagement surveys
- Succession planning
- Workforce analytics dashboard

### Mobile Application
- Native mobile app development
- Offline attendance marking
- Push notifications
- Biometric authentication

## 13. Implementation Recommendations Based on Existing System

### Recommended Implementation Approach

#### Phase 0 - Preparation (Week 0)
1. **Backup existing staff data**
2. **Create development branch**
3. **Set up migration scripts**
4. **Prepare test data**

#### Leverage Existing Components
1. **Reuse StaffTable component**:
   - Enhance with new employee fields
   - Add tabs for teams, departments, leaves
   - Maintain existing pagination and search

2. **Extend FormSideBar**:
   - Add employee forms
   - Leave request forms
   - Attendance regularization forms

3. **Build on DataContext**:
   - Migrate to Zustand for HR state
   - Maintain backward compatibility
   - Progressive enhancement approach

#### Code Reusability Strategy
```typescript
// Extend existing patterns
// Example: Enhanced staff/employee API route
export const GET = async (req) => {
  // Use existing authentication
  const session = await getSession(req);

  // Use existing branch isolation
  const branch = await BRANCH.findOne({ manager: session.user.email });

  // Enhanced query with new employee model
  const employees = await Employee.find({ branch: branch._id })
    .populate('department')
    .populate('team')
    .populate('manager');

  // Maintain existing response format
  return NextResponse.json({
    meta: { status: 200, count: employees.length },
    data: { employees }
  });
};
```

#### Incremental Migration Path
1. **Stage 1**: Run old and new models in parallel
2. **Stage 2**: Gradually migrate features
3. **Stage 3**: Deprecate old staff model
4. **Stage 4**: Full cutover to new HR module

### Development Guidelines

#### File Structure Convention
```
app/
  hr/                       # New HR pages
    dashboard/
    employees/
    teams/
    leaves/
    attendance/
    reports/

components/hr/              # HR-specific components
  shared/
  employees/
  teams/
  leaves/

lib/
  hr/                       # HR utilities
    validations/
    calculations/
    exports/

model/hr/                   # HR models
  employee.ts
  team.ts
  leave.ts
  attendance.ts
```

#### Naming Conventions (Following Existing Patterns)
- **Models**: PascalCase (Employee, Team, LeaveRequest)
- **Components**: PascalCase (EmployeeTable, LeaveCalendar)
- **API Routes**: kebab-case (/api/hr/leave-requests)
- **Functions**: camelCase (getEmployeeData, calculateLeaveBalance)
- **Constants**: UPPER_SNAKE_CASE (MAX_LEAVE_DAYS, DEFAULT_SHIFT)

#### Testing Strategy
```typescript
// Use existing test patterns
// __tests__/hr/employee.test.ts
describe('Employee Management', () => {
  test('should migrate staff to employee', async () => {
    const staff = await createTestStaff();
    const employee = await migrateStaffToEmployee(staff);
    expect(employee.firstName).toBeDefined();
    expect(employee.employeeId).toBeDefined();
  });
});
```

### Risk Mitigation
1. **Data Backup**: Daily backups during migration
2. **Rollback Plan**: Keep staff model functional during transition
3. **User Training**: Phased rollout with training sessions
4. **Performance Monitoring**: Track API response times
5. **Error Handling**: Comprehensive logging and error recovery

### Quick Start Guide for Developers
```bash
# 1. Install dependencies
pnpm install

# 2. Run migration script
pnpm run migrate:staff-to-employee

# 3. Start development server
pnpm run dev

# 4. Run tests
pnpm run test:hr

# 5. Build for production
pnpm run build
```

## Conclusion
This comprehensive HR module design provides a solid foundation for managing human resources within the ERP system while seamlessly integrating with the existing codebase. The design leverages current components, patterns, and technologies to ensure smooth implementation and minimal disruption. The modular approach allows for phased implementation while maintaining backward compatibility with the existing staff management system. The system is designed to grow with organizational needs while maintaining performance and user experience standards.