// Mock data for HR module demonstration
import { Types } from 'mongoose';

// Generate ObjectId-like strings for mock data
const generateObjectId = () => new Types.ObjectId().toString();

// Mock Departments
export const mockDepartments = [
  {
    _id: generateObjectId(),
    name: "Human Resources",
    code: "HR",
    description: "Manages employee relations and organizational development",
    head: null, // Will be set to employee ID
    budget: 500000,
    costCenter: "HR001",
    status: "active",
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: generateObjectId(),
    name: "Information Technology",
    code: "IT",
    description: "Manages technology infrastructure and software development",
    head: null,
    budget: 1200000,
    costCenter: "IT001",
    status: "active",
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: generateObjectId(),
    name: "Sales & Marketing",
    code: "SM",
    description: "Drives revenue through sales and marketing initiatives",
    head: null,
    budget: 800000,
    costCenter: "SM001",
    status: "active",
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: generateObjectId(),
    name: "Finance & Accounting",
    code: "FA",
    description: "Manages financial operations and reporting",
    head: null,
    budget: 600000,
    costCenter: "FA001",
    status: "active",
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: generateObjectId(),
    name: "Operations",
    code: "OPS",
    description: "Oversees daily business operations and logistics",
    head: null,
    budget: 900000,
    costCenter: "OPS001",
    status: "active",
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];

// Mock Teams
export const mockTeams = [
  {
    _id: generateObjectId(),
    name: "Frontend Development",
    code: "FE-DEV",
    description: "Responsible for user interface development and user experience",
    department: mockDepartments[1]._id, // IT Department
    teamLead: null, // Will be set to employee ID
    members: [],
    maxMembers: 8,
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    status: "active",
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    _id: generateObjectId(),
    name: "Backend Development",
    code: "BE-DEV",
    description: "Handles server-side logic and database management",
    department: mockDepartments[1]._id, // IT Department
    teamLead: null,
    members: [],
    maxMembers: 6,
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    status: "active",
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    _id: generateObjectId(),
    name: "Sales Team Alpha",
    code: "SALES-A",
    description: "Primary sales team for enterprise clients",
    department: mockDepartments[2]._id, // Sales & Marketing
    teamLead: null,
    members: [],
    maxMembers: 12,
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    status: "active",
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    _id: generateObjectId(),
    name: "HR Operations",
    code: "HR-OPS",
    description: "Handles daily HR operations and employee services",
    department: mockDepartments[0]._id, // HR Department
    teamLead: null,
    members: [],
    maxMembers: 5,
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    status: "active",
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  }
];

// Mock Employees
export const mockEmployees = [
  {
    _id: generateObjectId(),
    employeeId: "EMP001",
    firstName: "Ahmed",
    lastName: "Hassan",
    email: "ahmed.hassan@company.com",
    personalEmail: "ahmed.hassan@gmail.com",
    phone: "+212612345678",
    alternatePhone: "+212523456789",
    position: "HR Manager",
    department: mockDepartments[0]._id, // HR
    team: mockTeams[3]._id, // HR Operations
    manager: null,
    employmentType: "full-time",
    status: "active",
    hireDate: new Date('2023-03-15'),
    confirmationDate: new Date('2023-09-15'),
    birthDate: new Date('1988-07-20'),
    salary: 45000,
    bonus: 5000,
    allowances: [
      { type: "Transport", amount: 2000 },
      { type: "Medical", amount: 1500 }
    ],
    gender: "male",
    maritalStatus: "married",
    nationality: "Moroccan",
    nationalId: "AB123456",
    address: {
      street: "123 Hassan II Boulevard",
      city: "Casablanca",
      state: "Casablanca-Settat",
      country: "Morocco",
      postalCode: "20000"
    },
    emergencyContact: {
      name: "Fatima Hassan",
      relationship: "Spouse",
      phone: "+212612345679",
      address: "123 Hassan II Boulevard, Casablanca"
    },
    bankAccount: {
      bankName: "Bank of Morocco",
      accountNumber: "123456789012",
      accountType: "Savings",
      routingNumber: "001"
    },
    skills: ["HR Management", "Employee Relations", "Recruitment", "Performance Management"],
    education: [
      {
        degree: "Master's in Human Resources",
        institution: "Mohammed V University",
        year: 2012,
        field: "Human Resource Management"
      }
    ],
    documents: [],
    createdAt: new Date('2023-03-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: generateObjectId(),
    employeeId: "EMP002",
    firstName: "Yasmine",
    lastName: "Benali",
    email: "yasmine.benali@company.com",
    personalEmail: "yasmine.benali@gmail.com",
    phone: "+212612345680",
    position: "Frontend Developer",
    department: mockDepartments[1]._id, // IT
    team: mockTeams[0]._id, // Frontend Development
    manager: null, // Will be set later
    employmentType: "full-time",
    status: "active",
    hireDate: new Date('2023-06-01'),
    confirmationDate: new Date('2023-12-01'),
    birthDate: new Date('1995-03-10'),
    salary: 38000,
    bonus: 3000,
    allowances: [
      { type: "Transport", amount: 2000 },
      { type: "Tech", amount: 1000 }
    ],
    gender: "female",
    maritalStatus: "single",
    nationality: "Moroccan",
    nationalId: "CD789012",
    address: {
      street: "456 Mohammed VI Avenue",
      city: "Rabat",
      state: "Rabat-Sale-Kenitra",
      country: "Morocco",
      postalCode: "10000"
    },
    emergencyContact: {
      name: "Omar Benali",
      relationship: "Father",
      phone: "+212612345681",
      address: "456 Mohammed VI Avenue, Rabat"
    },
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "JavaScript"],
    education: [
      {
        degree: "Bachelor's in Computer Science",
        institution: "ENSIAS",
        year: 2018,
        field: "Software Engineering"
      }
    ],
    documents: [],
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: generateObjectId(),
    employeeId: "EMP003",
    firstName: "Khalid",
    lastName: "Amrani",
    email: "khalid.amrani@company.com",
    personalEmail: "khalid.amrani@outlook.com",
    phone: "+212612345682",
    position: "Backend Developer",
    department: mockDepartments[1]._id, // IT
    team: mockTeams[1]._id, // Backend Development
    manager: null,
    employmentType: "full-time",
    status: "active",
    hireDate: new Date('2022-09-15'),
    confirmationDate: new Date('2023-03-15'),
    birthDate: new Date('1990-11-25'),
    salary: 42000,
    bonus: 4000,
    allowances: [
      { type: "Transport", amount: 2000 },
      { type: "Tech", amount: 1500 }
    ],
    gender: "male",
    maritalStatus: "married",
    nationality: "Moroccan",
    nationalId: "EF345678",
    address: {
      street: "789 Atlas Street",
      city: "Fez",
      state: "Fez-Meknes",
      country: "Morocco",
      postalCode: "30000"
    },
    emergencyContact: {
      name: "Aicha Amrani",
      relationship: "Spouse",
      phone: "+212612345683",
      address: "789 Atlas Street, Fez"
    },
    skills: ["Node.js", "MongoDB", "Express", "TypeScript", "Python", "Docker"],
    education: [
      {
        degree: "Master's in Computer Science",
        institution: "Al Akhawayn University",
        year: 2015,
        field: "Software Engineering"
      }
    ],
    documents: [],
    createdAt: new Date('2022-09-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: generateObjectId(),
    employeeId: "EMP004",
    firstName: "Safaa",
    lastName: "Oujdi",
    email: "safaa.oujdi@company.com",
    personalEmail: "safaa.oujdi@gmail.com",
    phone: "+212612345684",
    position: "Sales Representative",
    department: mockDepartments[2]._id, // Sales & Marketing
    team: mockTeams[2]._id, // Sales Team Alpha
    manager: null,
    employmentType: "full-time",
    status: "active",
    hireDate: new Date('2023-08-01'),
    confirmationDate: new Date('2024-02-01'),
    birthDate: new Date('1992-05-18'),
    salary: 35000,
    bonus: 8000,
    allowances: [
      { type: "Transport", amount: 2500 },
      { type: "Commission", amount: 3000 }
    ],
    gender: "female",
    maritalStatus: "single",
    nationality: "Moroccan",
    nationalId: "GH901234",
    address: {
      street: "321 Corniche Road",
      city: "Tangier",
      state: "Tanger-Tetouan-Al Hoceima",
      country: "Morocco",
      postalCode: "90000"
    },
    emergencyContact: {
      name: "Hassan Oujdi",
      relationship: "Brother",
      phone: "+212612345685",
      address: "321 Corniche Road, Tangier"
    },
    skills: ["Sales", "Client Relations", "Negotiation", "CRM", "Market Analysis"],
    education: [
      {
        degree: "Bachelor's in Business Administration",
        institution: "ENCG Tangier",
        year: 2015,
        field: "Marketing"
      }
    ],
    documents: [],
    createdAt: new Date('2023-08-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: generateObjectId(),
    employeeId: "EMP005",
    firstName: "Rachid",
    lastName: "Berrada",
    email: "rachid.berrada@company.com",
    personalEmail: "rachid.berrada@yahoo.com",
    phone: "+212612345686",
    position: "IT Director",
    department: mockDepartments[1]._id, // IT
    team: null, // Directors don't belong to specific teams
    manager: null,
    employmentType: "full-time",
    status: "active",
    hireDate: new Date('2020-01-10'),
    confirmationDate: new Date('2020-07-10'),
    birthDate: new Date('1985-09-12'),
    salary: 65000,
    bonus: 12000,
    allowances: [
      { type: "Transport", amount: 3000 },
      { type: "Management", amount: 5000 },
      { type: "Tech", amount: 2000 }
    ],
    gender: "male",
    maritalStatus: "married",
    nationality: "Moroccan",
    nationalId: "IJ567890",
    address: {
      street: "567 Anfa Boulevard",
      city: "Casablanca",
      state: "Casablanca-Settat",
      country: "Morocco",
      postalCode: "20100"
    },
    emergencyContact: {
      name: "Laila Berrada",
      relationship: "Spouse",
      phone: "+212612345687",
      address: "567 Anfa Boulevard, Casablanca"
    },
    skills: ["Leadership", "Strategic Planning", "IT Management", "Digital Transformation", "Team Building"],
    education: [
      {
        degree: "PhD in Computer Science",
        institution: "Mohammed V University",
        year: 2012,
        field: "Information Systems"
      },
      {
        degree: "MBA",
        institution: "HEC Paris",
        year: 2015,
        field: "Executive Management"
      }
    ],
    documents: [],
    createdAt: new Date('2020-01-10'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: generateObjectId(),
    employeeId: "EMP006",
    firstName: "Fatima",
    lastName: "Alami",
    email: "fatima.alami@company.com",
    personalEmail: "fatima.alami@gmail.com",
    phone: "+212612345688",
    position: "Accountant",
    department: mockDepartments[3]._id, // Finance & Accounting
    team: null,
    manager: null,
    employmentType: "full-time",
    status: "active",
    hireDate: new Date('2023-05-01'),
    confirmationDate: new Date('2023-11-01'),
    birthDate: new Date('1987-12-15'),
    salary: 32000,
    bonus: 3000,
    allowances: [
      { type: "Transport", amount: 1800 },
      { type: "Medical", amount: 800 }
    ],
    gender: "female",
    maritalStatus: "married",
    nationality: "Moroccan",
    nationalId: "KL123456",
    address: {
      street: "345 Ibn Battuta Street",
      city: "Salé",
      state: "Rabat-Salé-Kénitra",
      country: "Morocco",
      postalCode: "11000"
    },
    emergencyContact: {
      name: "Hassan Alami",
      relationship: "Spouse",
      phone: "+212612345689",
      address: "345 Ibn Battuta Street, Salé"
    },
    bankAccount: {
      bankName: "Banque Populaire du Maroc",
      accountNumber: "123456789012345678901234",
      accountType: "Current",
      routingNumber: "016"
    },
    skills: ["Accounting", "Financial Analysis", "Excel", "SAP", "Tax Compliance"],
    education: [
      {
        degree: "Master's in Accounting and Finance",
        institution: "ISCAE Casablanca",
        year: 2011,
        field: "Accounting and Finance"
      }
    ],
    documents: [],
    createdAt: new Date('2023-05-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: generateObjectId(),
    employeeId: "EMP007",
    firstName: "Omar",
    lastName: "Benkirane",
    email: "omar.benkirane@company.com",
    personalEmail: "omar.benkirane@outlook.com",
    phone: "+212612345690",
    position: "Operations Coordinator",
    department: mockDepartments[4]._id, // Operations
    team: null,
    manager: null,
    employmentType: "full-time",
    status: "active",
    hireDate: new Date('2022-11-15'),
    confirmationDate: new Date('2023-05-15'),
    birthDate: new Date('1991-08-22'),
    salary: 28000,
    bonus: 2000,
    allowances: [
      { type: "Transport", amount: 2000 },
      { type: "Travel", amount: 500 }
    ],
    gender: "male",
    maritalStatus: "single",
    nationality: "Moroccan",
    nationalId: "MN789012",
    address: {
      street: "678 Hassan V Avenue",
      city: "Agadir",
      state: "Souss-Massa",
      country: "Morocco",
      postalCode: "80000"
    },
    emergencyContact: {
      name: "Meryem Benkirane",
      relationship: "Sister",
      phone: "+212612345691",
      address: "678 Hassan V Avenue, Agadir"
    },
    bankAccount: {
      bankName: "BMCE Bank",
      accountNumber: "987654321098765432109876",
      accountType: "Savings",
      routingNumber: "011"
    },
    skills: ["Operations Management", "Project Coordination", "Supply Chain", "Process Improvement"],
    education: [
      {
        degree: "Bachelor's in Business Operations",
        institution: "ENCG Agadir",
        year: 2014,
        field: "Operations Management"
      }
    ],
    documents: [],
    createdAt: new Date('2022-11-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: generateObjectId(),
    employeeId: "EMP008",
    firstName: "Aicha",
    lastName: "Tazi",
    email: "aicha.tazi@company.com",
    personalEmail: "aicha.tazi@yahoo.com",
    phone: "+212612345692",
    position: "Marketing Specialist",
    department: mockDepartments[2]._id, // Sales & Marketing
    team: null,
    manager: null,
    employmentType: "full-time",
    status: "active",
    hireDate: new Date('2024-01-08'),
    confirmationDate: new Date('2024-07-08'),
    birthDate: new Date('1993-04-10'),
    salary: 36000,
    bonus: 4000,
    allowances: [
      { type: "Transport", amount: 1500 },
      { type: "Marketing", amount: 2000 },
      { type: "Medical", amount: 500 }
    ],
    gender: "female",
    maritalStatus: "single",
    nationality: "Moroccan",
    nationalId: "OP345678",
    address: {
      street: "890 Moulay Youssef Boulevard",
      city: "Meknes",
      state: "Fez-Meknes",
      country: "Morocco",
      postalCode: "50000"
    },
    emergencyContact: {
      name: "Youssef Tazi",
      relationship: "Father",
      phone: "+212612345693",
      address: "890 Moulay Youssef Boulevard, Meknes"
    },
    bankAccount: {
      bankName: "Attijariwafa Bank",
      accountNumber: "456789012345678901234567",
      accountType: "Current",
      routingNumber: "007"
    },
    skills: ["Digital Marketing", "Content Creation", "Social Media", "Google Analytics", "Brand Management"],
    education: [
      {
        degree: "Master's in Marketing and Communication",
        institution: "ENCG Meknes",
        year: 2016,
        field: "Marketing and Communication"
      }
    ],
    documents: [],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-15')
  }
];

// Update team leads and managers
mockTeams[0].teamLead = mockEmployees[1]._id; // Yasmine leads Frontend
mockTeams[1].teamLead = mockEmployees[2]._id; // Khalid leads Backend
mockTeams[2].teamLead = mockEmployees[3]._id; // Safaa leads Sales
mockTeams[3].teamLead = mockEmployees[0]._id; // Ahmed leads HR Operations

// Set department heads
mockDepartments[0].head = mockEmployees[0]._id; // Ahmed heads HR
mockDepartments[1].head = mockEmployees[4]._id; // Rachid heads IT

// Set managers
mockEmployees[1].manager = mockEmployees[4]._id; // Yasmine reports to Rachid
mockEmployees[2].manager = mockEmployees[4]._id; // Khalid reports to Rachid

// Mock Leave Types
export const mockLeaveTypes = [
  {
    _id: generateObjectId(),
    name: "Annual Leave",
    code: "AL",
    description: "Regular annual vacation leave",
    annualQuota: 30,
    carryForward: true,
    maxCarryForward: 5,
    requiresApproval: true,
    minDays: 1,
    maxDays: 15,
    advanceNoticeDays: 7,
    eligibleAfterMonths: 3,
    applicableFor: ["full-time", "part-time"],
    paidLeave: true,
    includesWeekends: false,
    includesHolidays: false,
    status: "active"
  },
  {
    _id: generateObjectId(),
    name: "Sick Leave",
    code: "SL",
    description: "Medical leave for illness",
    annualQuota: 15,
    carryForward: false,
    maxCarryForward: 0,
    requiresApproval: true,
    minDays: 1,
    maxDays: 5,
    advanceNoticeDays: 0,
    eligibleAfterMonths: 0,
    applicableFor: ["full-time", "part-time", "contract"],
    paidLeave: true,
    includesWeekends: false,
    includesHolidays: false,
    status: "active"
  },
  {
    _id: generateObjectId(),
    name: "Maternity Leave",
    code: "ML",
    description: "Leave for new mothers",
    annualQuota: 98,
    carryForward: false,
    maxCarryForward: 0,
    requiresApproval: true,
    minDays: 98,
    maxDays: 98,
    advanceNoticeDays: 30,
    eligibleAfterMonths: 6,
    applicableFor: ["full-time"],
    paidLeave: true,
    includesWeekends: true,
    includesHolidays: true,
    status: "active"
  },
  {
    _id: generateObjectId(),
    name: "Personal Leave",
    code: "PL",
    description: "Personal time off for various reasons",
    annualQuota: 5,
    carryForward: false,
    maxCarryForward: 0,
    requiresApproval: true,
    minDays: 1,
    maxDays: 3,
    advanceNoticeDays: 2,
    eligibleAfterMonths: 1,
    applicableFor: ["full-time", "part-time"],
    paidLeave: false,
    includesWeekends: false,
    includesHolidays: false,
    status: "active"
  }
];

// Mock Leave Requests
export const mockLeaveRequests = [
  {
    _id: generateObjectId(),
    requestId: "LR001",
    employee: mockEmployees[1]._id, // Yasmine
    leaveType: mockLeaveTypes[0]._id, // Annual Leave
    startDate: new Date('2024-03-15'),
    endDate: new Date('2024-03-19'),
    numberOfDays: 5,
    isHalfDay: false,
    reason: "Family vacation to Marrakech",
    status: "approved",
    approvalLevels: [
      {
        level: 1,
        approver: mockEmployees[4]._id, // Rachid
        status: "approved",
        comments: "Enjoy your vacation!",
        actionDate: new Date('2024-03-01')
      }
    ],
    requestDate: new Date('2024-02-28'),
    lastModified: new Date('2024-03-01')
  },
  {
    _id: generateObjectId(),
    requestId: "LR002",
    employee: mockEmployees[2]._id, // Khalid
    leaveType: mockLeaveTypes[1]._id, // Sick Leave
    startDate: new Date('2024-02-20'),
    endDate: new Date('2024-02-22'),
    numberOfDays: 3,
    isHalfDay: false,
    reason: "Flu symptoms",
    status: "approved",
    approvalLevels: [
      {
        level: 1,
        approver: mockEmployees[4]._id, // Rachid
        status: "approved",
        comments: "Get well soon!",
        actionDate: new Date('2024-02-20')
      }
    ],
    requestDate: new Date('2024-02-20'),
    lastModified: new Date('2024-02-20')
  },
  {
    _id: generateObjectId(),
    requestId: "LR003",
    employee: mockEmployees[3]._id, // Safaa
    leaveType: mockLeaveTypes[0]._id, // Annual Leave
    startDate: new Date('2024-04-10'),
    endDate: new Date('2024-04-12'),
    numberOfDays: 3,
    isHalfDay: false,
    reason: "Wedding ceremony",
    status: "pending",
    approvalLevels: [
      {
        level: 1,
        approver: mockEmployees[0]._id, // Ahmed (HR Manager)
        status: "pending",
        comments: "",
        actionDate: null
      }
    ],
    requestDate: new Date('2024-03-25'),
    lastModified: new Date('2024-03-25')
  }
];

// Mock Leave Balances
export const mockLeaveBalances = [
  {
    _id: generateObjectId(),
    employee: mockEmployees[0]._id, // Ahmed
    leaveType: mockLeaveTypes[0]._id, // Annual Leave
    year: 2024,
    entitled: 30,
    carriedForward: 2,
    adjusted: 0,
    taken: 8,
    pending: 0,
    available: 24
  },
  {
    _id: generateObjectId(),
    employee: mockEmployees[1]._id, // Yasmine
    leaveType: mockLeaveTypes[0]._id, // Annual Leave
    year: 2024,
    entitled: 30,
    carriedForward: 0,
    adjusted: 0,
    taken: 5,
    pending: 0,
    available: 25
  },
  {
    _id: generateObjectId(),
    employee: mockEmployees[2]._id, // Khalid
    leaveType: mockLeaveTypes[0]._id, // Annual Leave
    year: 2024,
    entitled: 30,
    carriedForward: 3,
    adjusted: 0,
    taken: 12,
    pending: 0,
    available: 21
  },
  {
    _id: generateObjectId(),
    employee: mockEmployees[3]._id, // Safaa
    leaveType: mockLeaveTypes[0]._id, // Annual Leave
    year: 2024,
    entitled: 30,
    carriedForward: 0,
    adjusted: 0,
    taken: 3,
    pending: 3,
    available: 24
  }
];

// Mock Holidays
export const mockHolidays = [
  {
    _id: generateObjectId(),
    name: "New Year's Day",
    date: new Date('2024-01-01'),
    year: 2024,
    type: "public",
    description: "Celebration of the new year",
    isRecurring: true
  },
  {
    _id: generateObjectId(),
    name: "Independence Day",
    date: new Date('2024-01-11'),
    year: 2024,
    type: "public",
    description: "Morocco Independence Day",
    isRecurring: true
  },
  {
    _id: generateObjectId(),
    name: "Labor Day",
    date: new Date('2024-05-01'),
    year: 2024,
    type: "public",
    description: "International Workers' Day",
    isRecurring: true
  },
  {
    _id: generateObjectId(),
    name: "Throne Day",
    date: new Date('2024-07-30'),
    year: 2024,
    type: "public",
    description: "Morocco Throne Day",
    isRecurring: true
  },
  {
    _id: generateObjectId(),
    name: "Revolution Day",
    date: new Date('2024-08-20'),
    year: 2024,
    type: "public",
    description: "Revolution of the King and the People",
    isRecurring: true
  },
  {
    _id: generateObjectId(),
    name: "Youth Day",
    date: new Date('2024-08-21'),
    year: 2024,
    type: "public",
    description: "Morocco Youth Day",
    isRecurring: true
  },
  {
    _id: generateObjectId(),
    name: "Green March Day",
    date: new Date('2024-11-06'),
    year: 2024,
    type: "public",
    description: "Commemoration of Green March",
    isRecurring: true
  },
  {
    _id: generateObjectId(),
    name: "Independence Day",
    date: new Date('2024-11-18'),
    year: 2024,
    type: "public",
    description: "Morocco Independence Day",
    isRecurring: true
  }
];

// Mock Attendance Records
export const mockAttendanceRecords = [
  {
    _id: generateObjectId(),
    employee: mockEmployees[1]._id, // Yasmine
    date: new Date('2024-03-18'),
    checkIn: new Date('2024-03-18T09:15:00'),
    checkOut: new Date('2024-03-18T17:30:00'),
    breaks: [
      {
        start: new Date('2024-03-18T12:00:00'),
        end: new Date('2024-03-18T13:00:00'),
        type: 'lunch'
      }
    ],
    scheduledHours: 8,
    actualHours: 8.25,
    overtimeHours: 0.25,
    status: "present",
    isRemote: false
  },
  {
    _id: generateObjectId(),
    employee: mockEmployees[2]._id, // Khalid
    date: new Date('2024-03-18'),
    checkIn: new Date('2024-03-18T08:45:00'),
    checkOut: new Date('2024-03-18T17:00:00'),
    breaks: [
      {
        start: new Date('2024-03-18T12:15:00'),
        end: new Date('2024-03-18T13:00:00'),
        type: 'lunch'
      }
    ],
    scheduledHours: 8,
    actualHours: 8.25,
    overtimeHours: 0.25,
    status: "present",
    isRemote: true
  },
  {
    _id: generateObjectId(),
    employee: mockEmployees[3]._id, // Safaa
    date: new Date('2024-03-18'),
    checkIn: new Date('2024-03-18T09:30:00'),
    checkOut: new Date('2024-03-18T18:00:00'),
    breaks: [
      {
        start: new Date('2024-03-18T12:30:00'),
        end: new Date('2024-03-18T13:30:00'),
        type: 'lunch'
      }
    ],
    scheduledHours: 8,
    actualHours: 8.5,
    overtimeHours: 0.5,
    status: "present",
    isRemote: false
  }
];

// Mock Shifts
export const mockShifts = [
  {
    _id: generateObjectId(),
    name: "Standard Day Shift",
    code: "DAY",
    startTime: "09:00",
    endTime: "17:00",
    breakDuration: 60,
    overtimeAllowed: true,
    maxOvertimeHours: 2,
    overtimeRate: 1.5,
    graceTimeBefore: 15,
    graceTimeAfter: 15,
    minimumHours: 8,
    status: "active"
  },
  {
    _id: generateObjectId(),
    name: "Early Shift",
    code: "EARLY",
    startTime: "08:00",
    endTime: "16:00",
    breakDuration: 60,
    overtimeAllowed: true,
    maxOvertimeHours: 2,
    overtimeRate: 1.5,
    graceTimeBefore: 15,
    graceTimeAfter: 15,
    minimumHours: 8,
    status: "active"
  },
  {
    _id: generateObjectId(),
    name: "Flexible Hours",
    code: "FLEX",
    startTime: "10:00",
    endTime: "18:00",
    breakDuration: 60,
    overtimeAllowed: false,
    maxOvertimeHours: 0,
    overtimeRate: 1.0,
    graceTimeBefore: 30,
    graceTimeAfter: 30,
    minimumHours: 8,
    status: "active"
  }
];

// Helper function to get mock data
export const getMockData = (type: string) => {
  switch (type) {
    case 'departments':
      return mockDepartments;
    case 'teams':
      return mockTeams;
    case 'employees':
      return mockEmployees;
    case 'leaveTypes':
      return mockLeaveTypes;
    case 'leaveRequests':
      return mockLeaveRequests;
    case 'leaveBalances':
      return mockLeaveBalances;
    case 'holidays':
      return mockHolidays;
    case 'attendance':
      return mockAttendanceRecords;
    case 'shifts':
      return mockShifts;
    default:
      return [];
  }
};

// Analytics mock data
export const mockAnalytics = {
  totalEmployees: mockEmployees.length,
  activeEmployees: mockEmployees.filter(emp => emp.status === 'active').length,
  departmentCount: mockDepartments.length,
  teamCount: mockTeams.length,
  pendingLeaveRequests: mockLeaveRequests.filter(req => req.status === 'pending').length,
  todayAttendance: mockAttendanceRecords.filter(att =>
    new Date(att.date).toDateString() === new Date().toDateString()
  ).length,
  monthlyHiringTrend: [
    { month: 'Jan', hires: 3 },
    { month: 'Feb', hires: 2 },
    { month: 'Mar', hires: 4 },
    { month: 'Apr', hires: 1 },
    { month: 'May', hires: 2 },
    { month: 'Jun', hires: 3 }
  ],
  departmentDistribution: [
    { department: 'IT', count: 3, percentage: 37.5 },
    { department: 'HR', count: 1, percentage: 12.5 },
    { department: 'Sales & Marketing', count: 2, percentage: 25 },
    { department: 'Finance & Accounting', count: 1, percentage: 12.5 },
    { department: 'Operations', count: 1, percentage: 12.5 }
  ]
};