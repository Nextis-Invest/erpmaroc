#!/usr/bin/env node

const http = require('http');

async function testDepartmentAPI() {
  console.log('🔍 Testing Department API endpoint with bypass...');

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/departments?bypass=true',
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
          console.log('✅ API Response received:');
          console.log('Status:', res.statusCode);

          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            console.log('Meta:', response.meta);

            if (response.data?.departments) {
              console.log(`📊 Found ${response.data.departments.length} departments:`);
              response.data.departments.forEach((dept, index) => {
                console.log(`${index + 1}. ${dept.name}`);
                if (dept.code) console.log(`   Code: ${dept.code}`);
                if (dept.description) console.log(`   Description: ${dept.description}`);
                if (dept.manager) {
                  console.log(`   Manager: ${dept.manager.firstName} ${dept.manager.lastName} (${dept.manager.employeeId})`);
                }
                console.log(`   Active: ${dept.isActive}`);
                console.log(`   ID: ${dept._id}`);
                console.log('   ---');
              });

              if (response.data.departments.length === 0) {
                console.log('\n🚨 No departments found in database!');
                console.log('💡 This might be why the DepartmentSelector is empty.');
                console.log('🔧 We may need to seed some sample departments.');
              }
            } else {
              console.log('No departments found in response');
            }
          } else {
            console.log('Error response:', data);
          }

          resolve(data);
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
    await testDepartmentAPI();
    console.log('\n✅ Department API test completed!');
  } catch (error) {
    console.error('\n❌ Department API test failed:', error.message);
    process.exit(1);
  }
}

main();