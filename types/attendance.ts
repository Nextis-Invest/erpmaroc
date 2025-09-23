// Project and Team interfaces for attendance management
export interface Project {
  _id: string;
  name: string;
  description?: string;
  code: string; // Project code (e.g., PROJ001)
  status: 'active' | 'inactive' | 'completed' | 'on-hold';
  startDate: string;
  endDate?: string;
  manager: string; // Employee ID of project manager
  budget?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  _id: string;
  name: string;
  description?: string;
  code: string; // Team code (e.g., TEAM001)
  department: string;
  teamLead: string; // Employee ID of team lead
  status: 'active' | 'inactive';
  teamType: 'permanent' | 'temporary' | 'project-based';
  location?: string;
  skills?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectAssignment {
  _id: string;
  projectId: string;
  employeeId: string;
  role: string; // Role in the project (Developer, Analyst, etc.)
  startDate: string;
  endDate?: string;
  allocation: number; // Percentage of time allocated to project (0-100)
  status: 'active' | 'inactive' | 'completed';
  hourlyRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamAssignment {
  _id: string;
  teamId: string;
  employeeId: string;
  role: string; // Role in the team (Member, Lead, etc.)
  startDate: string;
  endDate?: string;
  status: 'active' | 'inactive';
  responsibilities?: string[];
  createdAt: string;
  updatedAt: string;
}

// Extended attendance record with project/team information
export interface AttendanceRecord {
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
  projectAssignments?: ProjectAssignment[];
  teamAssignments?: TeamAssignment[];
  // Time tracking per project
  projectTimeEntries?: ProjectTimeEntry[];
}

export interface ProjectTimeEntry {
  projectId: string;
  projectName: string;
  hoursWorked: number;
  description?: string;
  taskType?: string;
}

// Employee with project/team information
export interface EmployeeWithAssignments {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  status: 'active' | 'inactive';
  activeProjectAssignments: ProjectAssignment[];
  activeTeamAssignments: TeamAssignment[];
}

// Summary interfaces for dashboard
export interface ProjectSummary {
  project: Project;
  totalAssignedEmployees: number;
  totalHoursWorked: number;
  averageAllocation: number;
  activeEmployees: string[]; // Employee IDs
}

export interface TeamSummary {
  team: Team;
  totalMembers: number;
  activeMembersToday: number;
  teamLead: {
    firstName: string;
    lastName: string;
    employeeId: string;
  };
}

export interface AttendanceWithAssignments extends AttendanceRecord {
  projects: {
    id: string;
    name: string;
    code: string;
    allocation: number;
    hoursWorked?: number;
  }[];
  teams: {
    id: string;
    name: string;
    code: string;
    role: string;
  }[];
}