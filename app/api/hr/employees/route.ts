import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/database/connectToDB";
import Employee from "@/model/hr/employee";
// Import models to ensure they're registered
const Department = require("@/model/hr/department");
const Team = require("@/model/hr/team");
import BRANCH from "@/model/branchData";
import ACTIVITYLOG from "@/model/activities";
import { getMockData } from "@/lib/hr/mockData";

// GET /api/hr/employees - List employees with pagination and search
export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const department = searchParams.get("department");
    const team = searchParams.get("team");
    const status = searchParams.get("status") || "active";
    const active = searchParams.get("active") === "true";
    const managers = searchParams.get("managers") === "true";
    const useMockData = searchParams.get("mock") === "true";
    const bypassAuth = searchParams.get("bypass") === "true";

    // Use mock data only if explicitly requested
    if (useMockData) {
      let employees = getMockData('employees');

      // Apply filters
      if (search) {
        employees = employees.filter((emp: any) =>
          emp.firstName.toLowerCase().includes(search.toLowerCase()) ||
          emp.lastName.toLowerCase().includes(search.toLowerCase()) ||
          emp.employeeId.toLowerCase().includes(search.toLowerCase()) ||
          emp.email.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (department) {
        employees = employees.filter((emp: any) => emp.department === department);
      }

      if (team) {
        employees = employees.filter((emp: any) => emp.team === team);
      }

      if (status) {
        employees = employees.filter((emp: any) => emp.status === status);
      }

      // Apply pagination
      const total = employees.length;
      const startIndex = (page - 1) * limit;
      const paginatedEmployees = employees.slice(startIndex, startIndex + limit);

      return NextResponse.json({
        meta: {
          status: 200,
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        data: { employees: paginatedEmployees }
      });
    }

    // Database operations
    await connectToDB();

    // Ensure models are registered
    if (Department) console.log("✅ Department model registered");
    if (Team) console.log("✅ Team model registered");

    let session;
    try {
      session = await auth();
      console.log("🔐 Session info:", {
        hasSession: !!session,
        userEmail: session?.user?.email,
        userRole: session?.user?.role,
        userId: session?.user?.id
      });
    } catch (error) {
      console.error("❌ Authentication error:", error);
      // In development, allow bypass for debugging
      if (process.env.NODE_ENV === 'development' && bypassAuth) {
        console.log("🚨 Development bypass activated");
        session = { user: { email: 'dev@local.com', role: 'admin', id: 'dev-user' } };
      } else {
        return NextResponse.json(
          { error: "Invalid session. Please log in again." },
          { status: 401 }
        );
      }
    }

    if (!session?.user?.email) {
      console.log("❌ No session or email found");
      // In development, allow bypass
      if (process.env.NODE_ENV === 'development' && bypassAuth) {
        console.log("🚨 Development bypass activated - no session");
        session = { user: { email: 'dev@local.com', role: 'admin', id: 'dev-user' } };
      } else {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    console.log("✅ User authenticated:", session.user.email, "Role:", session.user.role);

    // Build query - exclude only explicitly archived employees
    let query: any = {
      status,
      isArchived: { $ne: true }  // Only exclude employees explicitly marked as archived
    };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { nationalId: { $regex: search, $options: "i" } }
      ];
    }

    // If requesting only active employees
    if (active) {
      query.status = "active";
    }

    // If requesting potential managers (typically more senior positions)
    if (managers) {
      // Could add additional criteria for managers if needed
      // For now, just ensure they are active employees
      query.status = "active";
    }

    if (department) {
      query.department = department;
    }

    if (team) {
      query.team = team;
    }

    console.log("📊 Database query:", {
      query,
      page,
      limit,
      skip: (page - 1) * limit
    });

    // Count total documents
    const total = await Employee.countDocuments(query);
    console.log("📈 Total employees found:", total);

    // Get employees with pagination - handle populate errors gracefully
    let employees;
    try {
      employees = await Employee.find(query)
        .populate('department', 'name code')
        .populate('team', 'name code')
        .populate('manager', 'firstName lastName employeeId')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });
    } catch (popError) {
      console.warn("⚠️ Populate failed, fetching without population:", popError.message);
      // If populate fails (models don't exist), fetch without populate
      employees = await Employee.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });
    }

    console.log("👥 Employees retrieved:", employees.length);
    if (employees.length > 0) {
      console.log("📝 Sample employee:", {
        id: employees[0]._id,
        employeeId: employees[0].employeeId,
        name: `${employees[0].firstName} ${employees[0].lastName}`,
        status: employees[0].status,
        isArchived: employees[0].isArchived
      });
    }

    const response = {
      meta: {
        status: 200,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      data: { employees }
    };

    console.log("📤 API Response:", {
      status: response.meta.status,
      total: response.meta.total,
      employeesCount: response.data.employees.length
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error("❌ Error fetching employees:", error);

    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    const errorDetails = process.env.NODE_ENV === 'development' ? {
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    } : { error: "Internal Server Error" };

    return NextResponse.json(errorDetails, { status: 500 });
  }
};

// POST /api/hr/employees - Create new employee
export const POST = async (req: NextRequest) => {
  console.log('🚀 [POST /api/hr/employees] Request received');

  try {
    const body = await req.json();
    console.log('📨 [POST] Request body received:', {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      position: body.position,
      useMockData: body.useMockData,
      hasRequiredFields: !!(body.firstName && body.lastName && body.email)
    });

    const useMockData = body.useMockData;

    if (useMockData) {
      console.log('🎭 [POST] Using mock data mode');
      // Simulate creating an employee with mock data
      const newEmployeeId = `EMP${String(Date.now()).slice(-3).padStart(3, '0')}`;
      const newEmployee = {
        _id: new Date().getTime().toString(),
        employeeId: newEmployeeId,
        ...body,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('✅ [POST] Mock employee created:', newEmployee.employeeId);
      return NextResponse.json({
        meta: {
          status: 201,
          message: "Employee created successfully (mock mode)"
        },
        data: { employee: newEmployee }
      });
    }

    console.log('💾 [POST] Using database mode - connecting to database...');
    await connectToDB();
    console.log('✅ [POST] Database connected');

    // Ensure models are registered
    if (Department) console.log("✅ [POST] Department model registered");
    if (Team) console.log("✅ [POST] Team model registered");

    console.log('🔐 [POST] Checking authentication...');
    let session;
    try {
      session = await auth();
      console.log('🔐 [POST] Auth result:', {
        hasSession: !!session,
        userEmail: session?.user?.email,
        userId: session?.user?.id
      });
    } catch (authError) {
      console.error('❌ [POST] Authentication failed:', authError);
      // In development, allow bypass
      if (process.env.NODE_ENV === 'development') {
        console.log('🚨 [POST] Development bypass activated');
        session = { user: { email: 'dev@local.com', role: 'admin', id: 'dev-user', sub: 'dev-user' } };
      } else {
        return NextResponse.json(
          { error: "Authentication failed" },
          { status: 401 }
        );
      }
    }

    if (!session?.user?.email) {
      console.log('❌ [POST] No session or email found');
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log('✅ [POST] User authenticated:', session.user.email);

    // Generate employee ID
    console.log('📊 [POST] Generating employee ID...');
    const employeeCount = await Employee.countDocuments();
    const employeeId = `EMP${String(employeeCount + 1).padStart(3, '0')}`;
    console.log('🆔 [POST] Generated employee ID:', employeeId, '(based on count:', employeeCount, ')');

    // Create new employee
    console.log('👤 [POST] Creating new employee document...');

    // Clean empty string values and unwanted fields to avoid validation errors
    const cleanData = Object.entries(body).reduce((acc: any, [key, value]) => {
      // Skip useMockData and hasRequiredFields - these are frontend flags
      if (['useMockData', 'hasRequiredFields'].includes(key)) {
        return acc;
      }

      // Skip empty strings for optional ObjectId fields
      if (['department', 'team', 'manager', 'primarySite'].includes(key) && value === '') {
        return acc;
      }

      // Skip empty strings for enum fields
      if (['gender', 'maritalStatus'].includes(key) && value === '') {
        return acc;
      }

      // Skip empty arrays
      if (Array.isArray(value) && value.length === 0) {
        return acc;
      }

      // Handle nested objects (address, emergencyContact, bankAccount)
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const cleanedObject = Object.entries(value).reduce((objAcc: any, [objKey, objValue]) => {
          if (objValue !== '' && objValue !== null && objValue !== undefined) {
            objAcc[objKey] = objValue;
          }
          return objAcc;
        }, {});

        // Only include the object if it has non-empty fields
        if (Object.keys(cleanedObject).length > 0) {
          acc[key] = cleanedObject;
        }
        return acc;
      }

      // Keep non-empty values
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }

      return acc;
    }, {});

    // Get default branch and region if not provided
    let defaultBranch = null;
    let defaultRegion = null;

    if (!cleanData.branch || cleanData.branch === '') {
      console.log('🏢 [POST] No branch specified, looking for default branch...');
      try {
        defaultBranch = await BRANCH.findOne({ isActive: true });
        if (defaultBranch) {
          console.log('✅ [POST] Found default branch:', defaultBranch.name);
        }
      } catch (branchError) {
        console.warn('⚠️ [POST] Could not find default branch:', branchError.message);
      }
    }

    if (!cleanData.region || cleanData.region === '') {
      console.log('🌍 [POST] No region specified, looking for default region...');
      try {
        // Try to import Region model dynamically
        const Region = require("@/model/region");
        defaultRegion = await Region.findOne({ isActive: true });
        if (defaultRegion) {
          console.log('✅ [POST] Found default region:', defaultRegion.name);
        }
      } catch (regionError) {
        console.warn('⚠️ [POST] Could not find default region:', regionError.message);
      }
    }

    // Set required defaults if not provided
    const employeeData = {
      ...cleanData,
      employeeId,
      createdBy: session.user.sub || session.user.id,
      // Provide required defaults
      hireDate: cleanData.hireDate || new Date(),
      birthDate: cleanData.birthDate || new Date('1990-01-01'),
      salary: cleanData.salary || 8200,
      branch: cleanData.branch || defaultBranch?._id,
      region: cleanData.region || defaultRegion?._id
    };

    console.log('🧹 [POST] Cleaned data:', cleanData);
    console.log('📋 [POST] Employee data to save:', {
      employeeId: employeeData.employeeId,
      firstName: employeeData.firstName,
      lastName: employeeData.lastName,
      email: employeeData.email,
      position: employeeData.position,
      salary: employeeData.salary,
      branch: employeeData.branch,
      region: employeeData.region,
      createdBy: employeeData.createdBy,
      hasRequiredDates: !!(employeeData.birthDate && employeeData.hireDate)
    });

    const employee = new Employee(employeeData);

    console.log('💾 [POST] Saving employee to database...');
    const savedEmployee = await employee.save();
    console.log('✅ [POST] Employee saved successfully:', {
      id: savedEmployee._id,
      employeeId: savedEmployee.employeeId,
      name: `${savedEmployee.firstName} ${savedEmployee.lastName}`
    });

    // Log activity
    console.log('📝 [POST] Creating activity log...');
    const log = new ACTIVITYLOG({
      // Required fields
      userId: session.user.sub || session.user.id,
      userEmail: session.user.email,
      userRole: session.user.role || 'admin',
      action: 'employee_created',
      actionType: 'employee_management',
      module: 'hr',

      // Optional target information
      targetType: 'employee',
      targetId: savedEmployee.employeeId,
      targetDescription: `Employee ${savedEmployee.firstName} ${savedEmployee.lastName} created`,

      // Legacy compatibility
      branch: savedEmployee.branch,
      process: "Employee Added",

      // Status
      status: 'success'
    });
    await log.save();
    console.log('✅ [POST] Activity log created');

    const response = {
      meta: {
        status: 201,
        message: "Employee created successfully"
      },
      data: { employee: savedEmployee }
    };

    console.log('📤 [POST] Sending success response');
    return NextResponse.json(response);

  } catch (error) {
    console.error("❌ [POST] Error creating employee:", error);

    // Detailed error logging
    if (error instanceof Error) {
      console.error('❌ [POST] Error name:', error.name);
      console.error('❌ [POST] Error message:', error.message);
      console.error('❌ [POST] Error stack:', error.stack);
    }

    const errorResponse = process.env.NODE_ENV === 'development' ? {
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    } : { error: "Internal Server Error" };

    console.log('📤 [POST] Sending error response:', errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
  }
};