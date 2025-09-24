#!/usr/bin/env node

const { connectToDB } = require('../lib/database/connectToDB.ts');
const Department = require('../model/department.ts');
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const sampleDepartments = [
  {
    name: 'Ressources Humaines',
    code: 'RH',
    description: 'Gestion du personnel et des politiques RH',
    isActive: true,
    createdBy: 'system'
  },
  {
    name: 'Développement',
    code: 'DEV',
    description: 'Développement logiciel et applications',
    isActive: true,
    createdBy: 'system'
  },
  {
    name: 'Ventes et Marketing',
    code: 'VENTE',
    description: 'Équipe commerciale et marketing',
    isActive: true,
    createdBy: 'system'
  },
  {
    name: 'Finance et Comptabilité',
    code: 'FINANCE',
    description: 'Gestion financière et comptable',
    isActive: true,
    createdBy: 'system'
  },
  {
    name: 'Opérations',
    code: 'OPS',
    description: 'Opérations et logistique',
    isActive: true,
    createdBy: 'system'
  },
  {
    name: 'Support Client',
    code: 'SUPPORT',
    description: 'Service client et support technique',
    isActive: true,
    createdBy: 'system'
  }
];

async function seedDepartments() {
  try {
    console.log('🌱 Starting department seeding...');

    // Connect to database
    await connectToDB();
    console.log('✅ Connected to database');

    // Check if departments already exist
    const existingCount = await Department.countDocuments();
    console.log(`📊 Current departments in database: ${existingCount}`);

    if (existingCount > 0) {
      console.log('⚠️  Departments already exist. Checking for missing departments...');

      // Add only missing departments
      for (const dept of sampleDepartments) {
        const existing = await Department.findOne({
          $or: [
            { name: dept.name },
            { code: dept.code }
          ]
        });

        if (!existing) {
          console.log(`➕ Adding missing department: ${dept.name}`);
          const department = new Department(dept);
          await department.save();
          console.log(`✅ Created: ${dept.name} (${dept.code})`);
        } else {
          console.log(`👍 Already exists: ${dept.name}`);
        }
      }
    } else {
      console.log('🆕 Creating all sample departments...');

      // Create all departments
      for (const dept of sampleDepartments) {
        console.log(`➕ Creating department: ${dept.name}`);
        const department = new Department(dept);
        await department.save();
        console.log(`✅ Created: ${dept.name} (${dept.code})`);
      }
    }

    // Verify final count
    const finalCount = await Department.countDocuments();
    console.log(`📈 Final department count: ${finalCount}`);

    // List all departments
    console.log('\n📋 Current departments in database:');
    console.log('===================================');

    const allDepartments = await Department.find({ isActive: true }).sort({ name: 1 });
    allDepartments.forEach((dept, index) => {
      console.log(`${index + 1}. ${dept.name} (${dept.code})`);
      if (dept.description) {
        console.log(`   Description: ${dept.description}`);
      }
      console.log(`   ID: ${dept._id}`);
      console.log(`   Active: ${dept.isActive}`);
      console.log('   ---');
    });

    console.log('\n✅ Department seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding departments:', error);

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
seedDepartments();