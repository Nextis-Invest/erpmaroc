# Deployment Guide

This guide covers the deployment setup for the ERP Maroc application, including the creation of admin users and environment configuration.

## 🚀 Quick Deployment Setup

### 1. Environment Variables Setup

Create or update your `.env.local` file with the required variables:

```bash
# Database Configuration
MONGODB_URI="mongodb://localhost:27017/erp-maroc"
# For production: mongodb+srv://username:password@cluster.mongodb.net/erp-maroc

# Admin User Configuration (Required for deployment)
ADMIN_NAME="Your Full Name"
ADMIN_EMAIL="admin@company.com"
ADMIN_PASSWORD="SecurePassword123!"
ADMIN_TENANT="default"

# Application Configuration
NODE_ENV="production"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-nextauth-secret-key"
```

### 2. Create Initial Admin User

Run the deployment script to create the initial admin user:

```bash
# Using Node.js directly
node scripts/deploy-create-admin.js

# Or using pnpm
pnpm run deploy:admin
```

## 📋 Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | Database connection string | `mongodb://localhost:27017/erp-maroc` |
| `ADMIN_NAME` | Full name of the admin user | `"John Doe"` |
| `ADMIN_EMAIL` | Admin user email address | `"admin@company.com"` |
| `ADMIN_PASSWORD` | Admin user password | `"SecurePassword123!"` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_TENANT` | Tenant identifier | `"default"` |
| `NODE_ENV` | Environment mode | `"production"` |

## 🔒 Security Recommendations

### Password Requirements

The deployment script recommends passwords that meet these criteria:
- At least 8 characters long
- Contains uppercase and lowercase letters
- Contains at least one number
- Contains at least one special character (@$!%*?&)

**Example secure passwords:**
- `MySecure2024!`
- `Admin#Pass123`
- `ERP$ecure2024`

### Production Security Checklist

- [ ] Use strong, unique passwords
- [ ] Store sensitive environment variables securely (e.g., using secret managers)
- [ ] Use HTTPS in production
- [ ] Regularly rotate admin passwords
- [ ] Enable MongoDB authentication in production
- [ ] Use encrypted MongoDB connections (TLS/SSL)

## 🛠️ Deployment Script Features

### Automatic Features
- ✅ **Environment validation** - Checks all required variables
- ✅ **Password strength validation** - Warns about weak passwords
- ✅ **Email format validation** - Ensures valid email format
- ✅ **Duplicate handling** - Updates existing admin users
- ✅ **Secure password hashing** - Uses bcrypt with salt rounds 12
- ✅ **Error handling** - Comprehensive error messages
- ✅ **Graceful shutdown** - Handles process signals properly

### Output Example

```
🚀 Starting admin user deployment script...
==================================================
📋 Validating environment variables...
✅ Environment variables validated
🔗 Connecting to MongoDB...
✅ Connected to MongoDB
🔍 Checking for existing admin user...
👤 Creating new admin user...
🔒 Hashing password...
✅ Admin user created successfully!
   ID: 64f8a1b2c3d4e5f6789abcde
   Created: 2024-09-24T10:30:45.123Z

📊 Admin User Summary:
==============================
   Name: John Doe
   Email: admin@company.com
   Tenant: default
   Role: admin
   Debug Mode: false
   Password: [SECURED - 16 characters]

🎉 Deployment script completed successfully!
💡 You can now login with the created admin credentials
🔌 Database connection closed
```

## 🔄 Updating Admin Users

To update an existing admin user's password or details:

1. Update the environment variables in `.env.local`
2. Run the deployment script again:
   ```bash
   node scripts/deploy-create-admin.js
   ```

The script will automatically detect existing users and update their credentials.

## 🐛 Troubleshooting

### Common Issues

**❌ "Missing required environment variables"**
- Ensure all required variables are set in `.env.local`
- Check variable names for typos
- Verify the `.env.local` file is in the project root

**❌ "Database connection error"**
- Verify `MONGODB_URI` is correct
- Check if MongoDB service is running
- Ensure network connectivity to MongoDB server

**❌ "Duplicate key error"**
- An admin with this email already exists
- The script will update the existing admin automatically

**❌ "Validation error"**
- Check email format is valid
- Ensure all required fields are provided
- Verify password meets minimum requirements

### Debug Mode

For additional debugging information, set:
```bash
NODE_ENV="development"
```

This will provide more detailed error messages and stack traces.

## 📦 Package.json Scripts

Add these scripts to your `package.json` for easier deployment:

```json
{
  "scripts": {
    "deploy:admin": "node scripts/deploy-create-admin.js",
    "deploy:setup": "pnpm install && node scripts/deploy-create-admin.js"
  }
}
```

## 🏗️ CI/CD Integration

For automated deployments, you can integrate this script into your CI/CD pipeline:

```yaml
# Example GitHub Actions step
- name: Create Admin User
  run: node scripts/deploy-create-admin.js
  env:
    MONGODB_URI: ${{ secrets.MONGODB_URI }}
    ADMIN_NAME: ${{ secrets.ADMIN_NAME }}
    ADMIN_EMAIL: ${{ secrets.ADMIN_EMAIL }}
    ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
    ADMIN_TENANT: ${{ secrets.ADMIN_TENANT }}
```

## 📞 Support

If you encounter issues during deployment:

1. Check the troubleshooting section above
2. Review the script output for specific error messages
3. Verify environment variables and database connectivity
4. Check MongoDB logs for additional details

For additional support, refer to the project documentation or contact the development team.