/**
 * Seed Admin User Script
 * Creates default admin user for production deployment
 * 
 * Usage: node scripts/seed-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../src/config/env');
const User = require('../src/features/users/models/user.model');
const authService = require('../src/features/auth/services/auth.service');

const ADMIN_USER = {
    maNV: 'ADM001',
    hoTen: 'Quản trị viên',
    username: 'admin',
    email: 'admin@school.edu.vn',
    soDienThoai: '',
    diaChi: '',
    chucVu: 'Quản trị viên hệ thống',
    role: 'admin',
    password: 'Admin@123', // Must change on first login
    trangThai: 'active',
    isActive: true,
    firstLogin: true,
};

async function seedAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(config.mongodb.uri, {
            dbName: config.mongodb.dbName,
        });

        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ username: 'admin' });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists. Skipping...');
            process.exit(0);
        }

        // Hash password
        const matKhauHash = await authService.hashPassword(ADMIN_USER.password);

        // Create admin user
        const admin = new User({
            ...ADMIN_USER,
            matKhauHash,
        });

        await admin.save();

        console.log('✅ Admin user created successfully!');
        console.log('');
        console.log('═══════════════════════════════════════');
        console.log('  LOGIN CREDENTIALS');
        console.log('═══════════════════════════════════════');
        console.log(`  Username: ${ADMIN_USER.username}`);
        console.log(`  Password: ${ADMIN_USER.password}`);
        console.log('═══════════════════════════════════════');
        console.log('');
        console.log('⚠️  IMPORTANT: Change password after first login!');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding admin user:', error);
        process.exit(1);
    }
}

seedAdmin();
