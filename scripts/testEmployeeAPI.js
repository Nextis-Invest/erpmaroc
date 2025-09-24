#!/usr/bin/env node

// Simple script to test the employee API endpoint
const https = require('https');
const http = require('http');

async function testEmployeeAPI() {
  console.log('🔍 Testing Employee API endpoint...');

  // We'll test the API directly using a simple HTTP request
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/hr/employees?bypass=true&limit=5',
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
          console.log('Status:', res.statusCode);
          console.log('Meta:', response.meta);

          if (response.data?.employees) {
            console.log(`📊 Found ${response.data.employees.length} employees:`);
            response.data.employees.forEach((emp, index) => {
              console.log(`${index + 1}. ${emp.employeeId || 'No ID'} - ${emp.firstName} ${emp.lastName}`);
              console.log(`   📧 Email: ${emp.email}`);
              console.log(`   💼 Position: ${emp.position}`);
              console.log(`   🟢 Status: ${emp.status}`);
              console.log('   ---');
            });
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

      // If localhost:3000 is not running, suggest starting the dev server
      if (error.code === 'ECONNREFUSED') {
        console.log('\n💡 Tip: Make sure the Next.js development server is running:');
        console.log('   pnpm run dev');
        console.log('   Then run this script again.\n');
      }

      reject(error);
    });

    req.end();
  });
}

// Check if server is running first
async function checkServerStatus() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/hr/employees',
    method: 'HEAD',
    timeout: 5000
  };

  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      resolve(true);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function main() {
  console.log('🚀 Starting Employee API test...\n');

  // Check if server is running
  const serverRunning = await checkServerStatus();

  if (!serverRunning) {
    console.log('❌ Next.js server is not running on localhost:3000');
    console.log('\n💡 Please start the development server first:');
    console.log('   pnpm run dev');
    console.log('\nThen run this script again.');
    process.exit(1);
  }

  console.log('✅ Server is running, testing API...\n');

  try {
    await testEmployeeAPI();
    console.log('\n🎉 Employee API test completed successfully!');
  } catch (error) {
    console.error('\n❌ Employee API test failed:', error.message);
    process.exit(1);
  }
}

main();