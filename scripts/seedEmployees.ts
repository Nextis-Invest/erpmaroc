#!/usr/bin/env tsx

/**
 * Seed script to populate the database with employee data
 * Run with: npx tsx scripts/seedEmployees.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { PayrollEmployeeService } from '../services/payroll/payrollEmployeeService';

async function seedEmployees() {
  try {
    console.log('🌱 Starting employee seeding process...');
    console.log('📊 Using MongoDB URI from environment...');

    const result = await PayrollEmployeeService.saveAllEmployeesToDatabase();

    if (result.success) {
      console.log(`✅ ${result.message}`);
      console.log(`👥 Total employees seeded: ${result.count}`);

      // Verify the seeding by fetching employees
      console.log('\n🔍 Verifying seeded data...');
      const employees = await PayrollEmployeeService.getAllEmployees();

      console.log(`📋 Database contains ${employees.length} employees:`);
      employees.forEach((emp, index) => {
        console.log(`  ${index + 1}. ${emp.employeeId} - ${emp.prenom} ${emp.nom} (${emp.fonction})`);
      });

      console.log('\n🎉 Seeding completed successfully!');
    } else {
      console.error(`❌ Seeding failed: ${result.message}`);
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Error during seeding:', error);
    process.exit(1);
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedEmployees()
    .then(() => {
      console.log('🏁 Seeding script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding script failed:', error);
      process.exit(1);
    });
}

export { seedEmployees };