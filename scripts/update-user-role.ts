#!/usr/bin/env npx tsx

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { connectToDB } from '../lib/database/connectToDB';
import ADMIN from '../model/admin';

async function updateUserRole(email: string, newRole: string) {
  try {
    console.log('🔗 Connecting to database...');
    await connectToDB();
    console.log('✅ Connected to database');

    const user = await ADMIN.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    const oldRole = user.role;
    user.role = newRole;
    await user.save();

    console.log('✅ User role updated successfully:');
    console.log(`   👤 Name: ${user.name}`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🔄 Role: ${oldRole} → ${newRole}`);
    console.log(`   ⏰ Updated: ${new Date().toLocaleString()}`);

  } catch (error) {
    console.error('❌ Error updating user role:', error);
    process.exit(1);
  }
}

// Get command line arguments
const email = process.argv[2];
const role = process.argv[3];

if (!email || !role) {
  console.log('Usage: npx tsx scripts/update-user-role.ts <email> <role>');
  console.log('Valid roles: admin, user, manager, hr, payroll');
  process.exit(1);
}

// Update the user role
updateUserRole(email, role).then(() => {
  console.log('🎉 Script completed successfully');
  process.exit(0);
});