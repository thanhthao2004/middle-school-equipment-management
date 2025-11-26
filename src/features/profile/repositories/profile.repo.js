// Profile Repository - Database operations cho profile
const Profile = require('../models/profile.model');
const User = require('../../users/models/user.model');

class ProfileRepo {
    // Tìm profile theo userId
    async findByUserId(userId) {
        try {
            const profile = await Profile.findOne({ userId }).populate('userId');
            return profile;
        } catch (error) {
            console.error('Error finding profile by userId:', error);
            throw error;
        }
    }

    // Tạo hoặc cập nhật profile
    async updateByUserId(userId, profileData) {
        try {
            const profile = await Profile.findOneAndUpdate(
                { userId },
                { $set: profileData },
                { new: true, upsert: true }
            ).populate('userId');
            return profile;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    // Lấy thông tin user kèm profile
    async getUserWithProfile(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) return null;

            const profile = await Profile.findOne({ userId });
            
            return {
                ...user.toObject(),
                profile: profile ? profile.toObject() : null
            };
        } catch (error) {
            console.error('Error getting user with profile:', error);
            throw error;
        }
    }
}

module.exports = new ProfileRepo();

