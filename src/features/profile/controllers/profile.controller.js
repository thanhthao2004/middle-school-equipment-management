// Profile Controller - Quản lý thông tin cá nhân (kéo dữ liệu từ features/users)
const usersService = require('../../users/services/users.service');
const profileService = require('../services/profile.service');
const { deleteOldAvatar } = require('../../../config/avatar-upload');

class ProfileController {
    // GET /profile - Xem thông tin cá nhân (chi tiết như trang users/detail)
    async getProfilePage(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.redirect('/auth/login');
            }

            const userDetail = await usersService.getUserById(userId);
            if (!userDetail) {
                return res.redirect('/');
            }

            res.render('profile/views/profile', {
                title: 'Thông tin cá nhân',
                currentPage: 'profile',
                userDetail,
                user: req.user || { role: 'giao_vien' }
            });
        } catch (err) {
            console.error(err);
            return res.redirect('/');
        }
    }

    // POST /profile - Cập nhật thông tin cá nhân (tạm thời chỉ redirect)
    updateProfile(req, res) {
        // TODO: Implement backend logic sau
        res.redirect('/profile?success=true');
    }

    // GET /profile/edit - Hiển thị trang chỉnh sửa thông tin cá nhân
    async getEditProfilePage(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.redirect('/auth/login');
            }

            const userDetail = await profileService.getUserWithProfile(userId);
            if (!userDetail) {
                return res.redirect('/');
            }

            res.render('profile/views/edit_profile', {
                title: 'Chỉnh sửa thông tin cá nhân',
                currentPage: 'profile',
                userDetail,
                errors: {},
                error: null,
                success: null,
                user: req.user || { role: 'giao_vien' }
            });
        } catch (err) {
            console.error(err);
            return res.redirect('/profile');
        }
    }

    // POST /profile/edit - Cập nhật thông tin cá nhân (chỉ các trường được phép)
    async updateProfilePage(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.redirect('/auth/login');
            }

            const { fullname, phone, address, dob } = req.body;

            // Validate bắt buộc
            if (!fullname || fullname.trim() === '') {
                const userDetail = await profileService.getUserWithProfile(userId);
                return res.render('profile/views/edit_profile', {
                    title: 'Chỉnh sửa thông tin cá nhân',
                    currentPage: 'profile',
                    userDetail,
                    errors: { fullname: 'Họ và tên là bắt buộc' },
                    error: 'Vui lòng điền đầy đủ các trường bắt buộc',
                    success: null,
                    user: req.user || { role: 'giao_vien' }
                });
            }

            // Chuẩn bị dữ liệu cập nhật user (chỉ 4 trường được phép)
            const updateData = {
                fullname: fullname.trim(),
                phone: phone || '',
                address: address || '',
                dob: dob ? new Date(dob) : null
            };

            // Xử lý upload avatar nếu có
            if (req.file) {
                const avatarUrl = `/uploads/avatars/${req.file.filename}`;

                // Lấy profile cũ để xóa avatar cũ
                const oldProfile = await profileService.getProfile(userId);
                if (oldProfile && oldProfile.avatarUrl) {
                    deleteOldAvatar(oldProfile.avatarUrl);
                }

                // Cập nhật avatar vào profile
                await profileService.updateProfile(userId, { avatarUrl });
            }

            // Gọi service để cập nhật user info
            const updatedUser = await usersService.updateUser(userId, updateData);

            // Fetch updated profile to display
            const updatedUserWithProfile = await profileService.getUserWithProfile(userId);

            res.render('profile/views/edit_profile', {
                title: 'Chỉnh sửa thông tin cá nhân',
                currentPage: 'profile',
                userDetail: updatedUserWithProfile,
                errors: {},
                error: null,
                success: 'Cập nhật thông tin thành công!',
                user: req.user || { role: 'giao_vien' }
            });
        } catch (err) {
            console.error(err);
            const userDetail = await profileService.getUserWithProfile(req.user?.id);
            res.render('profile/views/edit_profile', {
                title: 'Chỉnh sửa thông tin cá nhân',
                currentPage: 'profile',
                userDetail,
                errors: {},
                error: err.message || 'Có lỗi xảy ra khi cập nhật',
                success: null,
                user: req.user || { role: 'giao_vien' }
            });
        }
    }

    // GET /profile/password/change - Form đổi mật khẩu
    getChangePasswordPage(req, res) {
        res.render('profile/views/change-password', {
            title: 'Đổi mật khẩu',
            currentPage: 'profile',
            user: req.user || { hoTen: 'Nguyễn Văn A', role: 'giao_vien' }
        });
    }

    // POST /profile/password/change - Xử lý đổi mật khẩu (Frontend only - chỉ redirect)
    changePassword(req, res) {
        // TODO: Implement backend logic sau
        res.redirect('/profile/password/change?success=true');
    }
}

module.exports = new ProfileController();

