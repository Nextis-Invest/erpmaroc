#!/usr/bin/env node

const http = require('http');

const sampleDepartments = [
  {
    name: 'Ressources Humaines',
    code: 'RH',
    description: 'Gestion du personnel et des politiques RH'
  },
  {
    name: 'Développement',
    code: 'DEV',
    description: 'Développement logiciel et applications'
  },
  {
    name: 'Ventes et Marketing',
    code: 'VENTE',
    description: 'Équipe commerciale et marketing'
  },
  {
    name: 'Finance et Comptabilité',
    code: 'FINANCE',
    description: 'Gestion financière et comptable'
  },
  {
    name: 'Opérations',
    code: 'OPS',
    description: 'Opérations et logistique'
  },
  {
    name: 'Support Client',
    code: 'SUPPORT',
    description: 'Service client et support technique'
  }
];

async function createDepartment(department) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(department);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/departments?bypass=true',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 201) {
            const response = JSON.parse(data);
            resolve(response);
          } else if (res.statusCode === 400 && data.includes('existe déjà')) {
            console.log(`⚠️  Department ${department.name} already exists`);
            resolve({ existing: true });
          } else {
            console.error(`❌ Failed to create ${department.name}:`, res.statusCode, data);
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function checkExistingDepartments() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/departments?bypass=true',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            resolve(response.data?.departments || []);
          } else {
            console.log('Could not fetch existing departments, will try to create all');
            resolve([]);
          }
        } catch (error) {
          console.log('Could not parse existing departments response');
          resolve([]);
        }
      });
    });

    req.on('error', (error) => {
      console.log('Could not fetch existing departments:', error.message);
      resolve([]);
    });

    req.end();
  });
}

async function seedDepartments() {
  console.log('🌱 Starting department seeding via API...');

  try {
    // Check existing departments
    console.log('📊 Checking existing departments...');
    const existingDepartments = await checkExistingDepartments();
    console.log(`📈 Found ${existingDepartments.length} existing departments`);

    if (existingDepartments.length > 0) {
      console.log('📋 Existing departments:');
      existingDepartments.forEach((dept, index) => {
        console.log(`${index + 1}. ${dept.name} (${dept.code})`);
      });
    }

    let createdCount = 0;
    let existingCount = 0;

    for (const department of sampleDepartments) {
      try {
        console.log(`➕ Creating department: ${department.name}...`);
        const result = await createDepartment(department);

        if (result.existing) {
          existingCount++;
        } else {
          createdCount++;
          console.log(`✅ Created: ${department.name} (${department.code})`);
        }
      } catch (error) {
        console.error(`❌ Failed to create ${department.name}:`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Created: ${createdCount} departments`);
    console.log(`👍 Already existed: ${existingCount} departments`);

    // Verify final state
    console.log('\n🔍 Verifying final state...');
    const finalDepartments = await checkExistingDepartments();
    console.log(`📈 Total departments now: ${finalDepartments.length}`);

    if (finalDepartments.length > 0) {
      console.log('\n📋 All departments in database:');
      console.log('================================');
      finalDepartments.forEach((dept, index) => {
        console.log(`${index + 1}. ${dept.name} (${dept.code || 'No Code'})`);
        if (dept.description) {
          console.log(`   Description: ${dept.description}`);
        }
        console.log('   ---');
      });
    }

    console.log('\n✅ Department seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error during department seeding:', error);
    process.exit(1);
  }
}

// Run the script
seedDepartments();