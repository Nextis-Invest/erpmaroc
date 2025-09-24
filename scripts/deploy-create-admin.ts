#!/usr/bin/env node

/**
 * Deployment Script: Create Admin User
 *
 * This script creates an admin user using environment variables.
 * It's designed for deployment scenarios and ensures secure credential handling.
 *
 * Required Environment Variables:
 * - MONGODB_URI: Database connection string
 * - ADMIN_NAME: Full name of the admin user
 * - ADMIN_EMAIL: Email address for the admin user
 * - ADMIN_PASSWORD: Password for the admin user
 * - ADMIN_TENANT: Tenant identifier (defaults to 'default')
 *
 * Usage:
 * node scripts/deploy-create-admin.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
config({ path: '.env.local' });

// Import the Admin model
import ADMIN from '../model/admin';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateEnvironmentVariables() {
  const required = ['MONGODB_URI', 'ADMIN_NAME', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
  const missing = [];

  for (const variable of required) {
    if (!process.env[variable]) {
      missing.push(variable);
    }
  }

  if (missing.length > 0) {
    log('❌ Missing required environment variables:', 'red');
    missing.forEach(variable => {
      log(`   - ${variable}`, 'red');
    });
    log('\n💡 Please ensure all required environment variables are set in your .env.local file:', 'yellow');
    log('   ADMIN_NAME="Your Full Name"', 'yellow');
    log('   ADMIN_EMAIL="admin@company.com"', 'yellow');
    log('   ADMIN_PASSWORD="SecurePassword123!"', 'yellow');
    log('   ADMIN_TENANT="default"', 'yellow');
    return false;
  }

  return true;
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  // At least 8 characters, contains uppercase, lowercase, number, and special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

async function createAdminUser() {
  let connection = null;

  try {
    log('🚀 Starting admin user deployment script...', 'cyan');
    log('=' .repeat(50), 'cyan');

    // Validate environment variables
    log('📋 Validating environment variables...', 'blue');
    if (!validateEnvironmentVariables()) {
      process.exit(1);
    }
    log('✅ Environment variables validated', 'green');

    // Extract environment variables
    const adminData = {
      name: process.env.ADMIN_NAME.trim(),
      email: process.env.ADMIN_EMAIL.trim().toLowerCase(),
      password: process.env.ADMIN_PASSWORD,
      tenant: process.env.ADMIN_TENANT?.trim() || 'default',
      connection: 'Username-Password-Authentication',
      role: 'admin',
      debug: process.env.NODE_ENV === 'development',
      is_signup: true,
      usePasskey: false
    };

    // Validate email format
    if (!validateEmail(adminData.email)) {
      log('❌ Invalid email format provided', 'red');
      process.exit(1);
    }

    // Validate password strength (optional but recommended)
    if (!validatePassword(adminData.password)) {
      log('⚠️  Password does not meet recommended security requirements:', 'yellow');
      log('   - At least 8 characters long', 'yellow');
      log('   - Contains uppercase and lowercase letters', 'yellow');
      log('   - Contains at least one number', 'yellow');
      log('   - Contains at least one special character (@$!%*?&)', 'yellow');
      log('', 'yellow');

      // Ask for confirmation in interactive mode
      if (process.stdin.isTTY) {
        const { createInterface } = await import('readline');
        const rl = createInterface({
          input: process.stdin,
          output: process.stdout
        });

        const proceed = await new Promise((resolve) => {
          rl.question('Do you want to proceed anyway? (y/N): ', (answer) => {
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
          });
        });

        rl.close();

        if (!proceed) {
          log('👋 Operation cancelled by user', 'yellow');
          process.exit(0);
        }
      }
    }

    // Connect to MongoDB
    log('🔗 Connecting to MongoDB...', 'blue');
    connection = await mongoose.connect(process.env.MONGODB_URI);
    log('✅ Connected to MongoDB', 'green');

    // Check if admin already exists
    log('🔍 Checking for existing admin user...', 'blue');
    const existingAdmin = await ADMIN.findOne({ email: adminData.email });

    if (existingAdmin) {
      log('⚠️  Admin user with this email already exists!', 'yellow');
      log(`   Name: ${existingAdmin.name}`, 'yellow');
      log(`   Email: ${existingAdmin.email}`, 'yellow');
      log(`   Created: ${existingAdmin._id.getTimestamp()}`, 'yellow');

      // In deployment mode, update the password
      log('🔄 Updating existing admin password...', 'blue');

      const saltRounds = 12; // Higher security for production
      const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

      existingAdmin.password = hashedPassword;
      existingAdmin.name = adminData.name; // Update name as well
      existingAdmin.tenant = adminData.tenant;
      existingAdmin.debug = adminData.debug;

      await existingAdmin.save();

      log('✅ Admin user updated successfully!', 'green');
      log(`   Updated: ${new Date().toISOString()}`, 'green');

    } else {
      log('👤 Creating new admin user...', 'blue');

      // Hash the password with high security
      const saltRounds = 12;
      log('🔒 Hashing password...', 'blue');
      const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
      adminData.password = hashedPassword;

      // Create new admin
      const newAdmin = new ADMIN(adminData);
      await newAdmin.save();

      log('✅ Admin user created successfully!', 'green');
      log(`   ID: ${newAdmin._id}`, 'green');
      log(`   Created: ${newAdmin._id.getTimestamp()}`, 'green');
    }

    // Display summary (without sensitive data)
    log('', 'reset');
    log('📊 Admin User Summary:', 'bright');
    log('=' .repeat(30), 'cyan');
    log(`   Name: ${adminData.name}`, 'cyan');
    log(`   Email: ${adminData.email}`, 'cyan');
    log(`   Tenant: ${adminData.tenant}`, 'cyan');
    log(`   Role: ${adminData.role}`, 'cyan');
    log(`   Debug Mode: ${adminData.debug}`, 'cyan');
    log(`   Password: [SECURED - ${adminData.password.length} characters]`, 'cyan');

    log('', 'reset');
    log('🎉 Deployment script completed successfully!', 'green');
    log('💡 You can now login with the created admin credentials', 'yellow');

  } catch (error) {
    log('❌ Error during admin user creation:', 'red');

    if (error.code === 11000) {
      log('   Duplicate key error - admin with this email may already exist', 'red');
    } else if (error.name === 'ValidationError') {
      log('   Validation error:', 'red');
      Object.keys(error.errors).forEach(key => {
        log(`     - ${key}: ${error.errors[key].message}`, 'red');
      });
    } else if (error.name === 'MongoNetworkError') {
      log('   Database connection error - please check MONGODB_URI', 'red');
    } else {
      log(`   ${error.message}`, 'red');
      if (process.env.NODE_ENV === 'development') {
        log('   Full error:', 'red');
        console.error(error);
      }
    }

    process.exit(1);

  } finally {
    // Close the database connection
    if (connection) {
      try {
        await mongoose.connection.close();
        log('🔌 Database connection closed', 'blue');
      } catch (closeError) {
        log('⚠️  Error closing database connection:', 'yellow');
        log(`   ${closeError.message}`, 'yellow');
      }
    }
  }
}

// Handle process signals gracefully
process.on('SIGINT', async () => {
  log('\n👋 Received SIGINT, closing gracefully...', 'yellow');
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log('\n👋 Received SIGTERM, closing gracefully...', 'yellow');
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(0);
});

// Run the script when executed directly
if (import.meta.url === `file://${process.argv[1].replace(/ /g, '%20')}`) {
  createAdminUser();
}

export { createAdminUser };