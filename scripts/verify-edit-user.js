const { connectMongo } = require('../src/config/db');
const usersService = require('../src/features/users/services/users.service');
const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const logFile = 'verify_log.txt';
function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
}

async function verifyEditUser() {
    try {
        fs.writeFileSync(logFile, 'Starting verification...\n');
        log('Connecting to database...');
        await connectMongo();

        const testUser = {
            username: 'test_edit_user',
            password: 'password123',
            fullname: 'Test Edit User',
            email: 'test_edit_user@school.edu.vn',
            phone: '0123456789',
            address: 'Test Address',
            role: 'giao_vien',
            experience: '1 năm',
            gender: 'Nam',
            subject: 'Toán',
            dob: '1990-01-01',
            specialization: 'Cử nhân'
        };

        log('Creating test user...');
        // Clean up if exists
        try {
            const existing = await usersService.getAllUsers('test_edit_user');
            if (existing && existing.length > 0) {
                const u = existing.find(u => u.username === 'test_edit_user');
                if (u) await usersService.deleteUser(u.id);
            }
        } catch (e) {
            log('Cleanup error (ignored): ' + e.message);
        }

        const createdUser = await usersService.createUser(testUser);
        log('User created: ' + createdUser.id);

        const updateData = {
            fullname: 'Test Edit User Updated',
            phone: '0987654321',
            address: 'New Address',
            experience: '2 năm',
            specialization: 'Thạc sĩ'
        };

        log('Updating user...');
        const updatedUser = await usersService.updateUser(createdUser.id, updateData);

        log('Verifying update...');
        if (updatedUser.fullname !== updateData.fullname) throw new Error('Fullname not updated');
        if (updatedUser.phone !== updateData.phone) throw new Error('Phone not updated');
        if (updatedUser.address !== updateData.address) throw new Error('Address not updated');
        if (updatedUser.experience !== updateData.experience) throw new Error('Experience not updated');
        if (updatedUser.specialization !== updateData.specialization) throw new Error('Specialization not updated');

        log('Update verified successfully!');

        log('Cleaning up...');
        await usersService.deleteUser(createdUser.id);
        log('Cleanup successful.');

    } catch (error) {
        log('Verification failed: ' + error.message);
        log(error.stack);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

verifyEditUser();
