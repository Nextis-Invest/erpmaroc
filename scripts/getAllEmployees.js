#!/usr/bin/env node

const http = require('http');

async function getAllEmployees() {
  console.log('🔍 Fetching ALL employees from database...');

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/hr/employees?bypass=true&limit=50',  // Get up to 50 employees
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ API Response received:');
          console.log(`📊 Total employees in database: ${response.meta?.total || 0}`);
          console.log(`📋 Showing employees ${((response.meta?.page || 1) - 1) * (response.meta?.limit || 10) + 1}-${Math.min((response.meta?.page || 1) * (response.meta?.limit || 10), response.meta?.total || 0)}\n`);

          if (response.data?.employees) {
            console.log('👥 EMPLOYEE DIRECTORY');
            console.log('=====================');

            response.data.employees.forEach((emp, index) => {
              console.log(`\n${index + 1}. ${emp.employeeId || 'No ID'} - ${emp.firstName} ${emp.lastName}`);
              console.log(`   📧 Email: ${emp.email}`);
              console.log(`   📞 Phone: ${emp.phone || 'N/A'}`);
              console.log(`   💼 Position: ${emp.position}`);
              console.log(`   🏢 Department: ${emp.department?.name || emp.department || 'N/A'}`);
              console.log(`   👥 Team: ${emp.team?.name || emp.team || 'N/A'}`);
              console.log(`   📅 Birth Date: ${emp.birthDate ? new Date(emp.birthDate).toLocaleDateString('fr-FR') : 'N/A'}`);
              console.log(`   📅 Hire Date: ${emp.hireDate ? new Date(emp.hireDate).toLocaleDateString('fr-FR') : 'N/A'}`);
              console.log(`   💰 Salary: ${emp.salary ? `${emp.salary.toLocaleString()} MAD` : 'N/A'}`);
              console.log(`   👤 Gender: ${emp.gender || 'N/A'}`);
              console.log(`   💍 Marital Status: ${emp.maritalStatus || 'N/A'}`);
              console.log(`   🆔 National ID: ${emp.nationalId || 'N/A'}`);
              console.log(`   🏛️ CNSS: ${emp.cnssNumber || 'N/A'}`);
              console.log(`   🟢 Status: ${emp.status}`);
              console.log(`   📁 Archived: ${emp.isArchived ? 'Yes' : 'No'}`);

              if (emp.address) {
                console.log(`   🏠 Address: ${emp.address.street || ''} ${emp.address.city || ''} ${emp.address.postalCode || ''}`.trim() || 'N/A');
              }

              if (emp.emergencyContact && emp.emergencyContact.name) {
                console.log(`   🚨 Emergency: ${emp.emergencyContact.name} (${emp.emergencyContact.relationship || 'N/A'}) - ${emp.emergencyContact.phone || 'N/A'}`);
              }

              if (emp.skills && emp.skills.length > 0) {
                console.log(`   🛠️ Skills: ${emp.skills.join(', ')}`);
              }
            });

            // Summary statistics
            console.log('\n📊 SUMMARY STATISTICS');
            console.log('====================');

            const employees = response.data.employees;
            const statusCounts = {};
            const departmentCounts = {};
            const genderCounts = {};
            let totalSalary = 0;
            let salaryCount = 0;

            employees.forEach(emp => {
              // Status counts
              statusCounts[emp.status] = (statusCounts[emp.status] || 0) + 1;

              // Department counts
              const dept = emp.department?.name || emp.department || 'Unassigned';
              departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;

              // Gender counts
              genderCounts[emp.gender || 'Unknown'] = (genderCounts[emp.gender || 'Unknown'] || 0) + 1;

              // Salary calculations
              if (emp.salary) {
                totalSalary += emp.salary;
                salaryCount++;
              }
            });

            console.log('\n📈 By Status:');
            Object.entries(statusCounts).forEach(([status, count]) => {
              console.log(`   ${status}: ${count} employees`);
            });

            console.log('\n🏢 By Department:');
            Object.entries(departmentCounts).forEach(([dept, count]) => {
              console.log(`   ${dept}: ${count} employees`);
            });

            console.log('\n👤 By Gender:');
            Object.entries(genderCounts).forEach(([gender, count]) => {
              console.log(`   ${gender}: ${count} employees`);
            });

            if (salaryCount > 0) {
              console.log('\n💰 Salary Information:');
              console.log(`   Average Salary: ${(totalSalary / salaryCount).toLocaleString()} MAD`);
              console.log(`   Total Payroll: ${totalSalary.toLocaleString()} MAD`);
              console.log(`   Employees with salary data: ${salaryCount}/${employees.length}`);
            }
          }

          resolve(response);
        } catch (error) {
          console.error('❌ Error parsing response:', error);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      if (error.code === 'ECONNREFUSED') {
        console.log('\n💡 Make sure the Next.js development server is running: pnpm run dev');
      }
      reject(error);
    });

    req.end();
  });
}

async function main() {
  try {
    await getAllEmployees();
    console.log('\n✅ Employee directory fetch completed successfully!');
  } catch (error) {
    console.error('\n❌ Failed to fetch employee directory:', error.message);
    process.exit(1);
  }
}

main();