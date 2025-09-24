#!/usr/bin/env node

const { connectToDB } = require('../lib/database/connectToDB.ts');
const Employee = require('../model/hr/employee.ts');
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function fetchEmployees() {
  try {
    console.log('🔍 Starting employee database fetch...');

    // Connect to database
    await connectToDB();
    console.log('✅ Connected to database');

    // Fetch total employee count
    const totalEmployees = await Employee.countDocuments();
    console.log(`📊 Total employees in database: ${totalEmployees}`);

    // Fetch active employees count
    const activeEmployees = await Employee.countDocuments({ status: 'active', isArchived: { $ne: true } });
    console.log(`👥 Active employees: ${activeEmployees}`);

    // Fetch archived employees count
    const archivedEmployees = await Employee.countDocuments({ isArchived: true });
    console.log(`📁 Archived employees: ${archivedEmployees}`);

    if (totalEmployees === 0) {
      console.log('⚠️  No employees found in database');
      return;
    }

    // Fetch first 10 employees with basic info
    console.log('\n📋 Sample employees (first 10):');
    console.log('=====================================');

    let employees;
    try {
      // Try to populate department and team if models exist
      employees = await Employee.find({ isArchived: { $ne: true } })
        .populate('department', 'name code')
        .populate('team', 'name code')
        .populate('manager', 'firstName lastName employeeId')
        .limit(10)
        .sort({ createdAt: -1 });
    } catch (popError) {
      console.log('⚠️  Population failed, fetching without references');
      // Fallback without population
      employees = await Employee.find({ isArchived: { $ne: true } })
        .limit(10)
        .sort({ createdAt: -1 });
    }

    employees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.employeeId} - ${emp.firstName} ${emp.lastName}`);
      console.log(`   📧 Email: ${emp.email}`);
      console.log(`   📞 Phone: ${emp.phone}`);
      console.log(`   💼 Position: ${emp.position}`);
      console.log(`   🏢 Department: ${emp.department?.name || emp.department || 'N/A'}`);
      console.log(`   👥 Team: ${emp.team?.name || emp.team || 'N/A'}`);
      console.log(`   📅 Hire Date: ${emp.hireDate ? new Date(emp.hireDate).toLocaleDateString('fr-FR') : 'N/A'}`);
      console.log(`   💰 Salary: ${emp.salary ? `${emp.salary.toLocaleString()} MAD` : 'N/A'}`);
      console.log(`   🟢 Status: ${emp.status}`);
      console.log(`   📁 Archived: ${emp.isArchived ? 'Yes' : 'No'}`);
      console.log('   ---');
    });

    // Statistics by department
    const departmentStats = await Employee.aggregate([
      { $match: { isArchived: { $ne: true } } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    console.log('\n📊 Employees by Department:');
    console.log('============================');
    departmentStats.forEach((dept) => {
      console.log(`Department ${dept._id || 'Unassigned'}: ${dept.count} employees`);
    });

    // Statistics by status
    const statusStats = await Employee.aggregate([
      { $match: { isArchived: { $ne: true } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    console.log('\n📈 Employees by Status:');
    console.log('=======================');
    statusStats.forEach((status) => {
      console.log(`${status._id}: ${status.count} employees`);
    });

    console.log('\n✅ Employee fetch completed successfully!');

  } catch (error) {
    console.error('❌ Error fetching employees:', error);

    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }

    process.exit(1);
  } finally {
    // Close database connection
    try {
      await mongoose.connection.close();
      console.log('🔌 Database connection closed');
    } catch (closeError) {
      console.error('Error closing database connection:', closeError);
    }
  }
}

// Run the script
fetchEmployees();