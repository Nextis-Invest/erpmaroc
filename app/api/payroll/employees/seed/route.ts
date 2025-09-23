import { NextRequest, NextResponse } from 'next/server';
import { PayrollEmployeeService } from '@/services/payroll/payrollEmployeeService';
import { allMockPayrollEmployees } from '@/lib/payroll/mockPayrollData';

/**
 * POST /api/payroll/employees/seed - Seed database with mock payroll employees
 * This endpoint will save the pre-generated payroll employee data to database
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Starting employee database seeding...');

    const result = await PayrollEmployeeService.saveAllEmployeesToDatabase();

    if (result.success) {
      console.log(`✅ Successfully seeded ${result.count} employees to database`);

      return NextResponse.json({
        success: true,
        message: result.message,
        count: result.count,
        timestamp: new Date().toISOString(),
        preview: allMockPayrollEmployees.slice(0, 3).map(emp => ({
          employeeId: emp.employeeId,
          nom: emp.nom,
          prenom: emp.prenom,
          fonction: emp.fonction,
          salaire_base: emp.salaire_base
        }))
      }, { status: 200 });
    } else {
      console.error('❌ Failed to seed employees:', result.message);

      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error in POST /api/payroll/employees/seed:', error);

    return NextResponse.json({
      success: false,
      message: 'Internal server error during seeding process',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * GET /api/payroll/employees/seed - Get information about the seeding process
 */
export async function GET(request: NextRequest) {
  try {
    const employees = await PayrollEmployeeService.getAllEmployees();

    return NextResponse.json({
      success: true,
      message: 'Employee seeding status',
      data: {
        currentCount: employees.length,
        isSeeded: employees.length > 0,
        lastSeededAt: employees.length > 0 ?
          Math.max(...employees.map(emp => new Date(emp.createdAt || 0).getTime())) : null,
        sampleEmployees: employees.slice(0, 3).map(emp => ({
          employeeId: emp.employeeId,
          name: `${emp.prenom} ${emp.nom}`,
          fonction: emp.fonction,
          salaire_base: emp.salaire_base
        }))
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error in GET /api/payroll/employees/seed:', error);

    return NextResponse.json({
      success: false,
      message: 'Error getting seeding status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}