// Mock data for projects, teams, and assignments
import { Types } from 'mongoose';

// Generate ObjectId-like strings for mock data
const generateObjectId = () => new Types.ObjectId().toString();

// Mock Projects
export const mockProjects = [
  {
    _id: generateObjectId(),
    name: "Système ERP Maroc",
    code: "PROJ001",
    description: "Développement du système ERP pour la gestion d'entreprise au Maroc",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-12-31",
    manager: "EMP001", // Ahmed HASSAN
    budget: { total: 500000, allocated: 350000, spent: 180000, currency: "MAD" },
    priority: "high",
    tags: ["ERP", "Web Development", "Morocco"],
    attendanceSettings: {
      allowRemoteWork: true,
      flexibleHours: true,
      overtimeAllowed: true,
      trackBreaks: true
    },
    workingHours: {
      start: "09:00",
      end: "17:00",
      breakDuration: 60,
      timezone: "Africa/Casablanca"
    },
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-15T14:30:00Z"
  },
  {
    _id: generateObjectId(),
    name: "Module Paie & RH",
    code: "PROJ002",
    description: "Module spécialisé pour la gestion de la paie et des ressources humaines",
    status: "active",
    startDate: "2024-03-01",
    endDate: "2024-09-30",
    manager: "EMP005", // Rachid BERRADA
    budget: { total: 200000, allocated: 150000, spent: 75000, currency: "MAD" },
    priority: "critical",
    tags: ["HR", "Payroll", "Backend"],
    attendanceSettings: {
      allowRemoteWork: false,
      flexibleHours: false,
      overtimeAllowed: true,
      trackBreaks: true
    },
    workingHours: {
      start: "08:30",
      end: "17:30",
      breakDuration: 60,
      timezone: "Africa/Casablanca"
    },
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    createdAt: "2024-02-20T10:00:00Z",
    updatedAt: "2024-03-01T09:00:00Z"
  },
  {
    _id: generateObjectId(),
    name: "Application Mobile",
    code: "PROJ003",
    description: "Application mobile pour la gestion des employés et présences",
    status: "planning",
    startDate: "2024-06-01",
    endDate: "2024-11-30",
    manager: "EMP008", // Aicha TAZI
    budget: { total: 150000, allocated: 100000, spent: 0, currency: "MAD" },
    priority: "medium",
    tags: ["Mobile", "React Native", "Attendance"],
    attendanceSettings: {
      allowRemoteWork: true,
      flexibleHours: true,
      overtimeAllowed: false,
      trackBreaks: false
    },
    workingHours: {
      start: "09:30",
      end: "18:00",
      breakDuration: 45,
      timezone: "Africa/Casablanca"
    },
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    createdAt: "2024-04-15T11:00:00Z",
    updatedAt: "2024-05-01T16:20:00Z"
  },
  {
    _id: generateObjectId(),
    name: "Module Comptabilité",
    code: "PROJ004",
    description: "Système de comptabilité intégré avec normes marocaines",
    status: "active",
    startDate: "2024-02-15",
    endDate: "2024-08-15",
    manager: "EMP006", // Fatima ALAMI
    budget: { total: 300000, allocated: 250000, spent: 120000, currency: "MAD" },
    priority: "high",
    tags: ["Accounting", "Finance", "Morocco Standards"],
    attendanceSettings: {
      allowRemoteWork: false,
      flexibleHours: false,
      overtimeAllowed: true,
      trackBreaks: true
    },
    workingHours: {
      start: "08:00",
      end: "16:30",
      breakDuration: 60,
      timezone: "Africa/Casablanca"
    },
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    createdAt: "2024-02-01T08:00:00Z",
    updatedAt: "2024-02-15T12:00:00Z"
  }
];

// Mock Teams
export const mockTeams = [
  {
    _id: generateObjectId(),
    name: "Équipe Développement Frontend",
    code: "TEAM001",
    description: "Équipe responsable du développement des interfaces utilisateur",
    department: "IT",
    teamLead: "EMP002", // Yasmine BENALI
    status: "active",
    teamType: "permanent",
    location: "Bureau Principal - Casablanca",
    skills: ["React", "TypeScript", "UI/UX", "CSS", "JavaScript"],
    maxMembers: 8,
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    members: [
      { employee: "EMP002", role: "Team Lead", joinDate: "2024-01-01" },
      { employee: "EMP003", role: "Senior Developer", joinDate: "2024-01-01" },
      { employee: "EMP008", role: "UI/UX Specialist", joinDate: "2024-04-01" }
    ],
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-04-01T14:00:00Z"
  },
  {
    _id: generateObjectId(),
    name: "Équipe Backend & Infrastructure",
    code: "TEAM002",
    description: "Équipe responsable du développement backend et infrastructure",
    department: "IT",
    teamLead: "EMP005", // Rachid BERRADA
    status: "active",
    teamType: "permanent",
    location: "Bureau Principal - Casablanca",
    skills: ["Node.js", "MongoDB", "AWS", "Docker", "API Development"],
    maxMembers: 6,
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    members: [
      { employee: "EMP005", role: "Team Lead", joinDate: "2024-01-01" },
      { employee: "EMP003", role: "Senior Developer", joinDate: "2024-01-01" },
      { employee: "EMP007", role: "DevOps Engineer", joinDate: "2024-02-01" }
    ],
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-02-01T10:00:00Z"
  },
  {
    _id: generateObjectId(),
    name: "Équipe Ressources Humaines",
    code: "TEAM003",
    description: "Équipe de gestion des ressources humaines et administration",
    department: "HR",
    teamLead: "EMP001", // Ahmed HASSAN
    status: "active",
    teamType: "permanent",
    location: "Bureau Principal - Casablanca",
    skills: ["HR Management", "Recruitment", "Training", "Employee Relations"],
    maxMembers: 5,
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    members: [
      { employee: "EMP001", role: "Team Lead", joinDate: "2024-01-01" }
    ],
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-01-15T11:00:00Z"
  },
  {
    _id: generateObjectId(),
    name: "Équipe Finance & Comptabilité",
    code: "TEAM004",
    description: "Équipe de gestion financière et comptable",
    department: "Finance",
    teamLead: "EMP006", // Fatima ALAMI
    status: "active",
    teamType: "permanent",
    location: "Bureau Principal - Casablanca",
    skills: ["Accounting", "Financial Analysis", "Tax Management", "Budgeting"],
    maxMembers: 4,
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    members: [
      { employee: "EMP006", role: "Team Lead", joinDate: "2024-01-01" }
    ],
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-01-20T16:00:00Z"
  },
  {
    _id: generateObjectId(),
    name: "Équipe Commercial & Ventes",
    code: "TEAM005",
    description: "Équipe responsable des ventes et relations clients",
    department: "Sales",
    teamLead: "EMP004", // Safaa OUJDI
    status: "active",
    teamType: "permanent",
    location: "Bureau Principal - Casablanca",
    skills: ["Sales", "Customer Relations", "Business Development", "Marketing"],
    maxMembers: 6,
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    members: [
      { employee: "EMP004", role: "Team Lead", joinDate: "2024-01-01" },
      { employee: "EMP007", role: "Sales Coordinator", joinDate: "2024-03-01" }
    ],
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-03-01T13:00:00Z"
  }
];

// Mock Project Assignments
export const mockProjectAssignments = [
  // PROJ001 - Système ERP Maroc
  {
    _id: generateObjectId(),
    project: mockProjects[0]._id,
    employee: "EMP001", // Ahmed HASSAN
    role: "Project Manager",
    allocation: 80,
    startDate: "2024-01-15",
    status: "active",
    billable: true,
    hourlyRate: 450,
    responsibilities: ["Project oversight", "Team coordination", "Client communication"],
    performanceMetrics: { totalHoursWorked: 320, taskCompletion: 85 },
    attendanceSettings: { trackTime: true, requireCheckIn: true },
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-15T09:00:00Z"
  },
  {
    _id: generateObjectId(),
    project: mockProjects[0]._id,
    employee: "EMP002", // Yasmine BENALI
    role: "Frontend Lead",
    allocation: 100,
    startDate: "2024-01-20",
    status: "active",
    billable: true,
    hourlyRate: 350,
    responsibilities: ["Frontend development", "UI/UX implementation", "Code review"],
    performanceMetrics: { totalHoursWorked: 280, taskCompletion: 90 },
    attendanceSettings: { trackTime: true, allowRemoteWork: true },
    createdAt: "2024-01-20T09:00:00Z",
    updatedAt: "2024-01-20T09:00:00Z"
  },
  {
    _id: generateObjectId(),
    project: mockProjects[0]._id,
    employee: "EMP003", // Khalid AMRANI
    role: "Backend Developer",
    allocation: 90,
    startDate: "2024-01-25",
    status: "active",
    billable: true,
    hourlyRate: 320,
    responsibilities: ["API development", "Database design", "Backend architecture"],
    performanceMetrics: { totalHoursWorked: 265, taskCompletion: 88 },
    attendanceSettings: { trackTime: true, requireCheckIn: false },
    createdAt: "2024-01-25T09:00:00Z",
    updatedAt: "2024-01-25T09:00:00Z"
  },

  // PROJ002 - Module Paie & RH
  {
    _id: generateObjectId(),
    project: mockProjects[1]._id,
    employee: "EMP005", // Rachid BERRADA
    role: "Technical Lead",
    allocation: 100,
    startDate: "2024-03-01",
    status: "active",
    billable: true,
    hourlyRate: 400,
    responsibilities: ["Technical architecture", "Team leadership", "Code quality"],
    performanceMetrics: { totalHoursWorked: 180, taskCompletion: 75 },
    attendanceSettings: { trackTime: true, requireCheckIn: true },
    createdAt: "2024-03-01T09:00:00Z",
    updatedAt: "2024-03-01T09:00:00Z"
  },
  {
    _id: generateObjectId(),
    project: mockProjects[1]._id,
    employee: "EMP006", // Fatima ALAMI
    role: "Business Analyst",
    allocation: 60,
    startDate: "2024-03-05",
    status: "active",
    billable: true,
    hourlyRate: 280,
    responsibilities: ["Requirements analysis", "Process documentation", "User acceptance testing"],
    performanceMetrics: { totalHoursWorked: 95, taskCompletion: 80 },
    attendanceSettings: { trackTime: true, requireCheckIn: false },
    createdAt: "2024-03-05T09:00:00Z",
    updatedAt: "2024-03-05T09:00:00Z"
  },

  // PROJ003 - Application Mobile
  {
    _id: generateObjectId(),
    project: mockProjects[2]._id,
    employee: "EMP008", // Aicha TAZI
    role: "Mobile Lead",
    allocation: 100,
    startDate: "2024-06-01",
    status: "active",
    billable: true,
    hourlyRate: 370,
    responsibilities: ["Mobile app development", "React Native architecture", "UI/UX design"],
    performanceMetrics: { totalHoursWorked: 0, taskCompletion: 0 },
    attendanceSettings: { trackTime: true, allowRemoteWork: true },
    createdAt: "2024-06-01T09:00:00Z",
    updatedAt: "2024-06-01T09:00:00Z"
  },

  // PROJ004 - Module Comptabilité
  {
    _id: generateObjectId(),
    project: mockProjects[3]._id,
    employee: "EMP006", // Fatima ALAMI
    role: "Lead Accountant",
    allocation: 40, // 40% since she's also on PROJ002
    startDate: "2024-02-15",
    status: "active",
    billable: true,
    hourlyRate: 300,
    responsibilities: ["Accounting logic", "Financial processes", "Regulatory compliance"],
    performanceMetrics: { totalHoursWorked: 145, taskCompletion: 70 },
    attendanceSettings: { trackTime: true, requireCheckIn: true },
    createdAt: "2024-02-15T09:00:00Z",
    updatedAt: "2024-02-15T09:00:00Z"
  },
  {
    _id: generateObjectId(),
    project: mockProjects[3]._id,
    employee: "EMP007", // Omar BENKIRANE
    role: "Operations Support",
    allocation: 50,
    startDate: "2024-03-01",
    status: "active",
    billable: true,
    hourlyRate: 250,
    responsibilities: ["Process optimization", "Data migration", "User training"],
    performanceMetrics: { totalHoursWorked: 85, taskCompletion: 65 },
    attendanceSettings: { trackTime: true, requireCheckIn: false },
    createdAt: "2024-03-01T09:00:00Z",
    updatedAt: "2024-03-01T09:00:00Z"
  }
];

// Mock Team Assignments
export const mockTeamAssignments = [
  // TEAM001 - Équipe Développement Frontend
  {
    _id: generateObjectId(),
    team: mockTeams[0]._id,
    employee: "EMP002", // Yasmine BENALI
    role: "Team Lead",
    startDate: "2024-01-01",
    status: "active",
    responsibilities: ["Team management", "Code review", "Technical decisions"],
    performanceMetrics: { contributionScore: 95, collaborationRating: 5, attendanceRate: 98 },
    mentoring: { isMentor: true, mentees: ["EMP008"] },
    primarySkills: ["React", "TypeScript", "Team Leadership"],
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-01-01T09:00:00Z"
  },
  {
    _id: generateObjectId(),
    team: mockTeams[0]._id,
    employee: "EMP003", // Khalid AMRANI
    role: "Senior Member",
    startDate: "2024-01-01",
    status: "active",
    responsibilities: ["Frontend development", "Mentoring junior developers"],
    performanceMetrics: { contributionScore: 88, collaborationRating: 4, attendanceRate: 96 },
    mentoring: { isMentor: false, hasMentor: false },
    primarySkills: ["React", "JavaScript", "CSS"],
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-01-01T09:00:00Z"
  },
  {
    _id: generateObjectId(),
    team: mockTeams[0]._id,
    employee: "EMP008", // Aicha TAZI
    role: "Member",
    startDate: "2024-04-01",
    status: "active",
    responsibilities: ["UI/UX design", "Component development"],
    performanceMetrics: { contributionScore: 82, collaborationRating: 4, attendanceRate: 94 },
    mentoring: { isMentor: false, hasMentor: true, mentor: "EMP002" },
    primarySkills: ["UI/UX", "React", "Design Systems"],
    createdAt: "2024-04-01T09:00:00Z",
    updatedAt: "2024-04-01T09:00:00Z"
  },

  // TEAM002 - Équipe Backend & Infrastructure
  {
    _id: generateObjectId(),
    team: mockTeams[1]._id,
    employee: "EMP005", // Rachid BERRADA
    role: "Team Lead",
    startDate: "2024-01-01",
    status: "active",
    responsibilities: ["Technical leadership", "Infrastructure decisions", "Team coordination"],
    performanceMetrics: { contributionScore: 92, collaborationRating: 5, attendanceRate: 97 },
    mentoring: { isMentor: true, mentees: ["EMP007"] },
    primarySkills: ["Node.js", "MongoDB", "Team Leadership", "AWS"],
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-01-01T09:00:00Z"
  },
  {
    _id: generateObjectId(),
    team: mockTeams[1]._id,
    employee: "EMP003", // Khalid AMRANI (also in TEAM001)
    role: "Senior Member",
    startDate: "2024-01-01",
    status: "active",
    responsibilities: ["Backend development", "API design"],
    performanceMetrics: { contributionScore: 90, collaborationRating: 5, attendanceRate: 96 },
    mentoring: { isMentor: false, hasMentor: false },
    primarySkills: ["Node.js", "API Development", "Database Design"],
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-01-01T09:00:00Z"
  },
  {
    _id: generateObjectId(),
    team: mockTeams[1]._id,
    employee: "EMP007", // Omar BENKIRANE
    role: "Member",
    startDate: "2024-02-01",
    status: "active",
    responsibilities: ["DevOps", "System administration", "Deployment"],
    performanceMetrics: { contributionScore: 78, collaborationRating: 4, attendanceRate: 92 },
    mentoring: { isMentor: false, hasMentor: true, mentor: "EMP005" },
    primarySkills: ["DevOps", "Docker", "CI/CD"],
    createdAt: "2024-02-01T09:00:00Z",
    updatedAt: "2024-02-01T09:00:00Z"
  },

  // TEAM003 - Équipe Ressources Humaines
  {
    _id: generateObjectId(),
    team: mockTeams[2]._id,
    employee: "EMP001", // Ahmed HASSAN
    role: "Team Lead",
    startDate: "2024-01-01",
    status: "active",
    responsibilities: ["HR strategy", "Team management", "Policy development"],
    performanceMetrics: { contributionScore: 93, collaborationRating: 5, attendanceRate: 99 },
    mentoring: { isMentor: true, mentees: [] },
    primarySkills: ["HR Management", "Leadership", "Strategic Planning"],
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-01-01T09:00:00Z"
  },

  // TEAM004 - Équipe Finance & Comptabilité
  {
    _id: generateObjectId(),
    team: mockTeams[3]._id,
    employee: "EMP006", // Fatima ALAMI
    role: "Team Lead",
    startDate: "2024-01-01",
    status: "active",
    responsibilities: ["Financial oversight", "Accounting processes", "Compliance"],
    performanceMetrics: { contributionScore: 91, collaborationRating: 4, attendanceRate: 98 },
    mentoring: { isMentor: false, hasMentor: false },
    primarySkills: ["Accounting", "Financial Analysis", "Team Leadership"],
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-01-01T09:00:00Z"
  },

  // TEAM005 - Équipe Commercial & Ventes
  {
    _id: generateObjectId(),
    team: mockTeams[4]._id,
    employee: "EMP004", // Safaa OUJDI
    role: "Team Lead",
    startDate: "2024-01-01",
    status: "active",
    responsibilities: ["Sales strategy", "Team management", "Client relations"],
    performanceMetrics: { contributionScore: 89, collaborationRating: 5, attendanceRate: 95 },
    mentoring: { isMentor: true, mentees: ["EMP007"] },
    primarySkills: ["Sales", "Business Development", "Team Leadership"],
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-01-01T09:00:00Z"
  },
  {
    _id: generateObjectId(),
    team: mockTeams[4]._id,
    employee: "EMP007", // Omar BENKIRANE (cross-functional)
    role: "Member",
    startDate: "2024-03-01",
    status: "active",
    responsibilities: ["Sales coordination", "Process optimization"],
    performanceMetrics: { contributionScore: 75, collaborationRating: 4, attendanceRate: 92 },
    mentoring: { isMentor: false, hasMentor: true, mentor: "EMP004" },
    primarySkills: ["Operations", "Process Management"],
    createdAt: "2024-03-01T09:00:00Z",
    updatedAt: "2024-03-01T09:00:00Z"
  }
];

// Helper functions to get assignments by employee
export const getProjectAssignmentsByEmployee = (employeeId: string) => {
  return mockProjectAssignments.filter(assignment =>
    assignment.employee === employeeId && assignment.status === 'active'
  );
};

export const getTeamAssignmentsByEmployee = (employeeId: string) => {
  return mockTeamAssignments.filter(assignment =>
    assignment.employee === employeeId && assignment.status === 'active'
  );
};

// Helper function to get project by ID
export const getProjectById = (projectId: string) => {
  return mockProjects.find(project => project._id === projectId);
};

// Helper function to get team by ID
export const getTeamById = (teamId: string) => {
  return mockTeams.find(team => team._id === teamId);
};

// Helper function to get all assignments for an employee
export const getEmployeeAssignments = (employeeId: string) => {
  const projectAssignments = getProjectAssignmentsByEmployee(employeeId);
  const teamAssignments = getTeamAssignmentsByEmployee(employeeId);

  return {
    projects: projectAssignments.map(assignment => ({
      ...assignment,
      projectDetails: getProjectById(assignment.project)
    })),
    teams: teamAssignments.map(assignment => ({
      ...assignment,
      teamDetails: getTeamById(assignment.team)
    }))
  };
};