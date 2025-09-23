import { NextRequest, NextResponse } from 'next/server';
import { PayrollEmployeeService } from '@/services/payroll/payrollEmployeeService';

/**
 * GET /api/payroll/employees - Get all payroll employees
 */
export async function GET(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI environment variable is not set');
      return NextResponse.json({
        success: false,
        message: 'Database configuration error'
      }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let employees;
    if (search) {
      employees = await PayrollEmployeeService.searchEmployees(search);
    } else {
      employees = await PayrollEmployeeService.getAllEmployees();
    }

    return NextResponse.json({
      success: true,
      data: employees,
      count: employees.length
    }, { status: 200 });

  } catch (error) {
    console.error('Error in GET /api/payroll/employees:', error);

    // Ensure we always return JSON, never HTML
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

/**
 * POST /api/payroll/employees - Create new payroll employee
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await PayrollEmployeeService.createEmployee(body);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.employee,
        message: 'Employee created successfully'
      }, { status: 201 });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in POST /api/payroll/employees:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * PUT /api/payroll/employees - Update payroll employee
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { _id, ...updates } = body;

    if (!_id) {
      return NextResponse.json({
        success: false,
        message: 'Employee ID is required'
      }, { status: 400 });
    }

    const result = await PayrollEmployeeService.updateEmployee(_id, updates);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.employee,
        message: 'Employee updated successfully'
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 404 });
    }

  } catch (error) {
    console.error('Error in PUT /api/payroll/employees:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/payroll/employees - Delete payroll employee
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Employee ID is required'
      }, { status: 400 });
    }

    const result = await PayrollEmployeeService.deleteEmployee(id);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 404 });
    }

  } catch (error) {
    console.error('Error in DELETE /api/payroll/employees:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}