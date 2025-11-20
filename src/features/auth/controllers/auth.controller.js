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
            return res.redirect('/borrow/teacher-home'); 
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

    // Tạm thời giữ lại hàm getChangePasswordPage để không gây lỗi 404 cho route đã có
    getChangePasswordPage(req, res) {
        res.render('auth/views/change-password', {
            title: 'Đổi mật khẩu',
            errors: [],
            success: null
        });
    }
}

module.exports = new AuthController();