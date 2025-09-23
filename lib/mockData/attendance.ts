// Mock data for attendance planner development and testing

export const mockProjects = [
  {
    _id: "proj1",
    name: "ERP Modernization",
    code: "ERP-MOD",
    description: "Modernisation du système ERP existant",
    color: "#3b82f6",
    status: "active",
    priority: "high",
    teamCount: 3,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    createdAt: "2024-01-01"
  },
  {
    _id: "proj2",
    name: "Mobile App Development",
    code: "MOB-APP",
    description: "Développement d'application mobile",
    color: "#10b981",
    status: "active",
    priority: "medium",
    teamCount: 2,
    startDate: "2024-03-01",
    endDate: "2024-09-30",
    createdAt: "2024-02-15"
  },
  {
    _id: "proj3",
    name: "Data Analytics Platform",
    code: "DATA-PLAT",
    description: "Plateforme d'analyse de données",
    color: "#8b5cf6",
    status: "planning",
    priority: "medium",
    teamCount: 1,
    startDate: "2024-06-01",
    endDate: "2025-02-28",
    createdAt: "2024-05-01"
  },
  {
    _id: "proj4",
    name: "Infrastructure Upgrade",
    code: "INFRA-UP",
    description: "Mise à niveau de l'infrastructure",
    color: "#f59e0b",
    status: "on-hold",
    priority: "low",
    teamCount: 1,
    startDate: "2024-08-01",
    endDate: "2024-11-30",
    createdAt: "2024-07-01"
  }
];

export const mockTeams = {
  proj1: [
    {
      _id: "team1",
      name: "Backend Development",
      code: "BACK-DEV",
      description: "Équipe de développement backend",
      memberCount: 8,
      status: "active",
      teamLead: {
        firstName: "Ahmed",
        lastName: "Benali",
        employeeId: "EMP001"
      }
    },
    {
      _id: "team2",
      name: "Frontend Development",
      code: "FRONT-DEV",
      description: "Équipe de développement frontend",
      memberCount: 6,
      status: "active",
      teamLead: {
        firstName: "Fatima",
        lastName: "Zahra",
        employeeId: "EMP002"
      }
    },
    {
      _id: "team3",
      name: "DevOps & Infrastructure",
      code: "DEVOPS",
      description: "Équipe DevOps et infrastructure",
      memberCount: 4,
      status: "active",
      teamLead: {
        firstName: "Youssef",
        lastName: "Alami",
        employeeId: "EMP003"
      }
    }
  ],
  proj2: [
    {
      _id: "team4",
      name: "iOS Development",
      code: "IOS-DEV",
      description: "Équipe de développement iOS",
      memberCount: 5,
      status: "active",
      teamLead: {
        firstName: "Samira",
        lastName: "Idrissi",
        employeeId: "EMP004"
      }
    },
    {
      _id: "team5",
      name: "Android Development",
      code: "AND-DEV",
      description: "Équipe de développement Android",
      memberCount: 5,
      status: "active",
      teamLead: {
        firstName: "Omar",
        lastName: "Rachidi",
        employeeId: "EMP005"
      }
    }
  ],
  proj3: [
    {
      _id: "team6",
      name: "Data Engineering",
      code: "DATA-ENG",
      description: "Équipe d'ingénierie des données",
      memberCount: 6,
      status: "active",
      teamLead: {
        firstName: "Aisha",
        lastName: "Tazi",
        employeeId: "EMP006"
      }
    }
  ],
  proj4: [
    {
      _id: "team7",
      name: "System Administration",
      code: "SYS-ADMIN",
      description: "Équipe d'administration système",
      memberCount: 3,
      status: "active",
      teamLead: {
        firstName: "Karim",
        lastName: "Sebti",
        employeeId: "EMP007"
      }
    }
  ]
};

export const mockEmployees = {
  team1: [
    { _id: "emp1", employeeId: "EMP001", firstName: "Ahmed", lastName: "Benali", position: "Lead Developer", email: "ahmed.benali@company.com" },
    { _id: "emp2", employeeId: "EMP008", firstName: "Laila", lastName: "Moussaoui", position: "Senior Backend Developer", email: "laila.moussaoui@company.com" },
    { _id: "emp3", employeeId: "EMP009", firstName: "Hassan", lastName: "Alaoui", position: "Backend Developer", email: "hassan.alaoui@company.com" },
    { _id: "emp4", employeeId: "EMP010", firstName: "Najat", lastName: "Berrada", position: "Backend Developer", email: "najat.berrada@company.com" },
    { _id: "emp5", employeeId: "EMP011", firstName: "Mehdi", lastName: "Fassi", position: "Junior Developer", email: "mehdi.fassi@company.com" },
    { _id: "emp6", employeeId: "EMP012", firstName: "Salma", lastName: "Kettani", position: "Junior Developer", email: "salma.kettani@company.com" },
    { _id: "emp7", employeeId: "EMP013", firstName: "Rachid", lastName: "Mansouri", position: "Database Developer", email: "rachid.mansouri@company.com" },
    { _id: "emp8", employeeId: "EMP014", firstName: "Zineb", lastName: "Tadlaoui", position: "API Developer", email: "zineb.tadlaoui@company.com" }
  ],
  team2: [
    { _id: "emp9", employeeId: "EMP002", firstName: "Fatima", lastName: "Zahra", position: "Frontend Lead", email: "fatima.zahra@company.com" },
    { _id: "emp10", employeeId: "EMP015", firstName: "Amine", lastName: "Cherkaoui", position: "Senior Frontend Developer", email: "amine.cherkaoui@company.com" },
    { _id: "emp11", employeeId: "EMP016", firstName: "Nadia", lastName: "Benjelloun", position: "Frontend Developer", email: "nadia.benjelloun@company.com" },
    { _id: "emp12", employeeId: "EMP017", firstName: "Said", lastName: "Lamrini", position: "Frontend Developer", email: "said.lamrini@company.com" },
    { _id: "emp13", employeeId: "EMP018", firstName: "Khadija", lastName: "Squalli", position: "UI/UX Developer", email: "khadija.squalli@company.com" },
    { _id: "emp14", employeeId: "EMP019", firstName: "Abdellatif", lastName: "Benkirane", position: "Junior Frontend Developer", email: "abdellatif.benkirane@company.com" }
  ],
  team3: [
    { _id: "emp15", employeeId: "EMP003", firstName: "Youssef", lastName: "Alami", position: "DevOps Lead", email: "youssef.alami@company.com" },
    { _id: "emp16", employeeId: "EMP020", firstName: "Aicha", lastName: "Radi", position: "Cloud Engineer", email: "aicha.radi@company.com" },
    { _id: "emp17", employeeId: "EMP021", firstName: "Khalid", lastName: "Bennouna", position: "System Administrator", email: "khalid.bennouna@company.com" },
    { _id: "emp18", employeeId: "EMP022", firstName: "Latifa", lastName: "Amrani", position: "Security Specialist", email: "latifa.amrani@company.com" }
  ]
};

// Helper function to get mock data based on request
export const getMockProjectData = () => {
  return {
    success: true,
    data: { projects: mockProjects },
    meta: { total: mockProjects.length, status: 200 }
  };
};

export const getMockTeamData = (projectId: string) => {
  const teams = mockTeams[projectId as keyof typeof mockTeams] || [];
  return {
    success: true,
    data: { teams },
    meta: { projectId, total: teams.length, status: 200 }
  };
};

export const getMockAttendanceData = (projectId: string, teamId: string, startDate: string, endDate: string) => {
  // Find employees for the team
  const teamKey = Object.keys(mockTeams).find(key =>
    mockTeams[key as keyof typeof mockTeams].some(team => team._id === teamId)
  );

  if (!teamKey) {
    return {
      success: false,
      error: "Team not found",
      status: 404
    };
  }

  const employees = mockEmployees[teamId as keyof typeof mockEmployees] ||
                   mockEmployees[teamKey as keyof typeof mockEmployees] || [];

  // Generate mock attendance data using the existing function logic
  // This would be replaced with real attendance data in production

  return {
    success: true,
    data: {
      employees,
      attendance: [], // Will be generated by the API endpoint
      stats: {
        totalEmployees: employees.length,
        present: 0,
        absent: 0,
        late: 0,
        leave: 0,
        remote: 0,
        attendanceRate: 0
      }
    },
    meta: {
      projectId,
      teamId,
      startDate,
      endDate,
      employeeCount: employees.length,
      status: 200
    }
  };
};