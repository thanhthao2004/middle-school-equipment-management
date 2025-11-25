// Profile Service - Business logic cho quản lý thông tin cá nhân
const profileRepo = require('../repositories/profile.repo');
const User = require('../../users/models/user.model');
const bcrypt = require('bcrypt');

class ProfileService {
    // Lấy thông tin profile
    async getProfile(userId) {
        if (!userId) {
            return null;
        }
        return await profileRepo.findByUserId(userId);
    }

    // Cập nhật thông tin profile
    async updateProfile(userId, profileData) {
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        // TODO: Validate profile data
        return await profileRepo.updateByUserId(userId, profileData);
    }

    // Đổi mật khẩu
    async changePassword(userId, passwordData) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const { currentPassword, newPassword, confirmPassword } = passwordData;

        // Validate
        if (!currentPassword || !newPassword || !confirmPassword) {
            throw new Error('Tất cả các trường mật khẩu đều bắt buộc');
        }

        if (newPassword !== confirmPassword) {
            throw new Error('Mật khẩu mới và xác nhận mật khẩu không khớp');
        }

        if (newPassword.length < 6) {
            throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
        }

        // Lấy user hiện tại
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('Người dùng không tồn tại');
        }

        // Kiểm tra mật khẩu hiện tại
        const isPasswordValid = await bcrypt.compare(currentPassword, user.matKhauHash);
        if (!isPasswordValid) {
            throw new Error('Mật khẩu hiện tại không đúng');
        }

        // Hash mật khẩu mới
        const saltRounds = 10;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

        // Cập nhật mật khẩu
        user.matKhauHash = newPasswordHash;
        await user.save();
        
        return user;
    }
}

module.exports = new ProfileService();

