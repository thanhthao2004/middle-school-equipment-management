/**
 * Seed Test Users Script
 * Creates test users for all roles for development/testing
 * 
 * Usage: node scripts/seed-test-users.js
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const config = require('../src/config/env');
const User = require('../src/features/users/models/user.model');
const authService = require('../src/features/auth/services/auth.service');

const TEST_USERS = [
    {
        maNV: 'ADM001',
        hoTen: 'Quản trị viên',
        username: 'admin',
        email: 'admin@school.edu.vn',
        role: 'admin',
        chucVu: 'Quản trị viên',
        password: 'Admin@123',
    },
    {
        maNV: 'QLTB001',
        hoTen: 'Nguyễn Văn Quản',
        username: 'qltb01',
        email: 'qltb01@school.edu.vn',
        role: 'ql_thiet_bi',
        chucVu: 'Quản lý thiết bị',
        password: 'Qltb@123',
    },
    {
        maNV: 'GV001',
        hoTen: 'Trần Thị Giáo',
        username: 'gv01',
        email: 'gv01@school.edu.vn',
        role: 'giao_vien',
        chucVu: 'Giáo viên',
        password: 'Teacher@123',
    },
    {
        maNV: 'TT001',
        hoTen: 'Lê Văn Trưởng',
        username: 'tt01',
        email: 'tt01@school.edu.vn',
        role: 'to_truong',
        chucVu: 'Tổ trưởng chuyên môn',
        password: 'Head@123',
    },
    {
        maNV: 'HT001',
        hoTen: 'Phạm Thị Hiệu',
        username: 'ht01',
        email: 'ht01@school.edu.vn',
        role: 'hieu_truong',
        chucVu: 'Hiệu trưởng',
        password: 'Principal@123',
    },
];

async function seedTestUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(config.mongodb.uri);


        console.log('✅ Connected to MongoDB');
        console.log('🌱 Seeding test users...\n');

        let createdCount = 0;
        let skippedCount = 0;

        for (const testUser of TEST_USERS) {
            // Check if user already exists
            const existing = await User.findOne({ username: testUser.username });

            if (existing) {
                console.log(`⚠️  User ${testUser.username} already exists. Skipping...`);
                skippedCount++;
                continue;
            }

            // Hash password
            const matKhauHash = await authService.hashPassword(testUser.password);

            // Create user
            const user = new User({
                ...testUser,
                matKhauHash,
                trangThai: 'active',
                isActive: true,
                firstLogin: true,
            });

            await user.save();

            console.log(`✅ Created ${testUser.role}: ${testUser.username}`);
            createdCount++;
        }

        console.log('');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('  TEST USERS CREATED');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`  Total users created: ${createdCount}`);
        console.log(`  Total users skipped: ${skippedCount}`);
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');
        console.log('📋 LOGIN CREDENTIALS:');
        console.log('');

        TEST_USERS.forEach(user => {
            console.log(`  ${user.role.toUpperCase()}`);
            console.log(`    Username: ${user.username}`);
            console.log(`    Password: ${user.password}`);
            console.log('');
        });

        console.log('═══════════════════════════════════════════════════════════');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding test users:', error);
        process.exit(1);
    }
}

seedTestUsers();
