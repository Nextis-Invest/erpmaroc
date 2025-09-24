#!/usr/bin/env tsx
/**
 * Script to sync existing HR employees to payroll system
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { connectToDB } from '@/lib/database/connectToDB';
import Employee from '@/model/hr/employee';
import { PayrollEmployeeService } from '@/services/payroll/payrollEmployeeService';

async function syncHRToPayroll() {
  try {
    console.log('🔄 Starting HR to Payroll synchronization...');

    // Connect to database
    await connectToDB();
    console.log('✅ Connected to database');

    // Get all active HR employees
    const hrEmployees = await Employee.find({
      status: 'active',
      isArchived: { $ne: true }
    }).sort({ employeeId: 1 });

    console.log(`📊 Found ${hrEmployees.length} active HR employees`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const hrEmployee of hrEmployees) {
      try {
        console.log(`\n🔍 Processing ${hrEmployee.employeeId}: ${hrEmployee.firstName} ${hrEmployee.lastName}`);

        // Check if payroll employee already exists
        const existingPayroll = await PayrollEmployeeService.getEmployeeByEmployeeId(hrEmployee.employeeId);

        if (existingPayroll) {
          console.log(`⏭️  Payroll employee already exists for ${hrEmployee.employeeId}`);
          skipped++;
          continue;
        }

        // Transform HR data to payroll format
        const payrollData = PayrollEmployeeService.transformHRToPayroll(hrEmployee.toObject());

        // Create payroll employee
        const result = await PayrollEmployeeService.createEmployee(payrollData);

        if (result.success) {
          console.log(`✅ Created payroll employee for ${hrEmployee.employeeId}`);
          created++;
        } else {
          console.error(`❌ Failed to create payroll employee for ${hrEmployee.employeeId}: ${result.message}`);
          errors++;
        }

      } catch (error) {
        console.error(`❌ Error processing ${hrEmployee.employeeId}:`, error);
        errors++;
      }
    }

    console.log('\n📊 Synchronization Summary:');
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📋 Total: ${hrEmployees.length}`);

    if (created > 0) {
      console.log('\n🎉 Synchronization completed successfully!');
    } else if (errors === 0) {
      console.log('\n✅ All employees were already synchronized');
    } else {
      console.log('\n⚠️  Synchronization completed with errors');
    }

  } catch (error) {
    console.error('❌ Synchronization failed:', error);
    process.exit(1);
  }
}

// Run the sync if executed directly
if (import.meta.url === `file://${process.argv[1].replace(/ /g, '%20')}`) {
  syncHRToPayroll();
}

export { syncHRToPayroll };