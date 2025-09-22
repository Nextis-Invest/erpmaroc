const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Import the Admin model
const ADMIN = require('../model/admin');

async function createAdmin() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Admin details
    const adminData = {
      name: 'Hicham Messaoudi',
      email: 'hicham.messaoudi@gmail.com',
      password: 'Jklkjdh@',
      tenant: 'default',
      connection: 'Username-Password-Authentication',
      debug: false,
      is_signup: true,
      usePasskey: false
    };

    // Check if admin already exists
    const existingAdmin = await ADMIN.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log('Admin with this email already exists!');
      console.log('Updating password for existing admin...');

      // Hash the new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

      // Update the existing admin's password
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();

      console.log('✅ Admin password updated successfully!');
    } else {
      // Hash the password before saving
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
      adminData.password = hashedPassword;

      // Create new admin
      const newAdmin = new ADMIN(adminData);
      await newAdmin.save();

      console.log('✅ Admin created successfully!');
    }

    console.log('Admin details:');
    console.log('Email:', adminData.email);
    console.log('Password: Jklkjdh@ (stored as hashed)');
    console.log('Role: Admin');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
createAdmin();