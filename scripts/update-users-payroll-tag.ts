#!/usr/bin/env tsx
/**
 * Script to update users without the payroll tag in database
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { connectToDB } from '@/lib/database/connectToDB';
import ADMIN from '@/model/admin';

async function updateUsersPayrollTag() {
  try {
    console.log('🔄 Updating users with payroll tag...');

    // Connect to database
    await connectToDB();
    console.log('✅ Connected to database');

    // Find all users without payroll tag (or where payroll is false/undefined)
    const usersWithoutPayroll = await ADMIN.find({
      $or: [
        { payroll: { $exists: false } },
        { payroll: false }
      ]
    });

    console.log(`📊 Found ${usersWithoutPayroll.length} users without payroll tag`);

    if (usersWithoutPayroll.length === 0) {
      console.log('✅ All users already have payroll access enabled');
      return;
    }

    let updated = 0;
    let errors = 0;

    console.log('\n🔧 Updating users...');

    for (const user of usersWithoutPayroll) {
      try {
        console.log(`👤 Updating user: ${user.name} (${user.email})`);

        // Update the user to have payroll access
        await ADMIN.findByIdAndUpdate(
          user._id,
          { payroll: true },
          { new: true }
        );

        console.log(`   ✅ Updated ${user.name} with payroll access`);
        updated++;

      } catch (error) {
        console.error(`   ❌ Failed to update ${user.name}:`, error);
        errors++;
      }
    }

    console.log('\n📊 Update Summary:');
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📋 Total: ${usersWithoutPayroll.length}`);

    if (updated > 0) {
      console.log('\n🎉 Users updated successfully with payroll access!');

      // Verify the updates
      console.log('\n🔍 Verifying updates...');
      const allUsers = await ADMIN.find({});
      console.log(`📈 Total users: ${allUsers.length}`);

      const usersWithPayroll = await ADMIN.find({ payroll: true });
      console.log(`💼 Users with payroll access: ${usersWithPayroll.length}`);

      console.log('\n👥 User Status:');
      for (const user of allUsers) {
        const payrollStatus = user.payroll ? '✅ Yes' : '❌ No';
        console.log(`   ${user.name} (${user.role}): Payroll Access ${payrollStatus}`);
      }
    }

  } catch (error) {
    console.error('❌ Failed to update users:', error);
    process.exit(1);
  }
}

// Run the update if executed directly
if (import.meta.url === `file://${process.argv[1].replace(/ /g, '%20')}`) {
  updateUsersPayrollTag();
}

export { updateUsersPayrollTag };