// Profile Controller - Quản lý thông tin cá nhân (Frontend only - không gọi service)
class ProfileController {
    // GET /profile - Xem thông tin cá nhân
    getProfilePage(req, res) {
        // Mock data cho frontend
        const mockProfile = {
            hoTen: 'Nguyễn Văn A',
            email: 'nguyenvana@example.com',
            soDienThoai: '0123456789',
            diaChi: '123 Đường ABC, Quận XYZ',
            chucVu: 'Giáo viên',
            ngaySinh: '1990-01-01',
            gioiTinh: 'Nam'
        };
        
        res.render('profile/views/profile', {
            title: 'Quản lý thông tin cá nhân',
            currentPage: 'profile',
            profile: mockProfile,
            user: req.user || { hoTen: 'Nguyễn Văn A', role: 'giao_vien' }
        });
    }

    // POST /profile - Cập nhật thông tin cá nhân (Frontend only - chỉ redirect)
    updateProfile(req, res) {
        // TODO: Implement backend logic sau
        res.redirect('/profile?success=true');
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

