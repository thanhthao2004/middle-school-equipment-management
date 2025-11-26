// Auth Controller
// Chứa logic hiển thị và xử lý Đăng nhập/Đăng xuất (Phiên bản tinh gọn)

class AuthController {
    // GET /auth/login - Hiển thị trang đăng nhập
    getLoginPage(req, res) {
        // Mặc định render trang login.ejs với title và các biến trống
        res.render('auth/views/login', {
            title: 'Đăng nhập hệ thống',
            error: req.query.error || null, // Truyền error từ query string (nếu có)
            success: req.query.success || null,
        });
    }

    // POST /auth/login - Xử lý đăng nhập (Logic mock)
    handleLogin(req, res) {
        const { username, password } = req.body;

        // --- Logic xác thực (MOCK) ---
        // Cho phép đăng nhập nếu là 'admin' / '123456'
        if (username === 'admin' && password === '123456') {
            // Xác thực thành công: Chuyển hướng đến trang chủ
            return res.redirect('/teacher/borrow/teacher-home'); 
        } else {
            // Xác thực thất bại: Chuyển hướng lại trang login với thông báo lỗi
            const errorMessage = 'Tên đăng nhập hoặc mật khẩu không đúng.';
            return res.redirect(`/auth/login?error=${encodeURIComponent(errorMessage)}`);
        }
    }

    // POST /auth/logout - Xử lý đăng xuất (Logic mock)
    handleLogout(req, res) {
        // TODO: Xóa session/JWT token thực sự
        res.redirect('/auth/login?success=Đăng xuất thành công');
    }

    // GET /auth/password/change - Hiển thị form đổi mật khẩu
    getChangePasswordPage(req, res) {
        res.render('auth/views/change-password', {
            title: 'Đổi mật khẩu',
            errors: [],
            success: null
        });
    }

    // POST /auth/password/change - Xử lý đổi mật khẩu
    handleChangePassword(req, res) {
        // TODO: Implement logic đổi mật khẩu
        // Tạm thời redirect về trang đổi mật khẩu với thông báo thành công
        res.redirect('/auth/password/change?success=Đổi mật khẩu thành công');
    }

    // GET /auth/password/forgot - Hiển thị form quên mật khẩu
    getForgotPasswordPage(req, res) {
        res.render('auth/views/forgot-password', {
            title: 'Quên mật khẩu',
            errors: [],
            success: null
        });
    }

    // POST /auth/password/forgot - Xử lý quên mật khẩu
    handleForgotPassword(req, res) {
        // TODO: Implement logic quên mật khẩu (gửi email reset password)
        // Tạm thời redirect về trang login với thông báo thành công
        res.redirect('/auth/login?success=Vui lòng kiểm tra email để đặt lại mật khẩu');
    }
}

module.exports = new AuthController();