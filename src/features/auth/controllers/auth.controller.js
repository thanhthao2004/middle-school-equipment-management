const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../../config/env');
const User = require('../../users/models/user.model'); 
const { ERROR_CODES, getErrorMessage } = require('../../../core/constants/error-codes');
const { sendError } = require('../../../core/utils/response');


// Helper function: Tạo JWT, đặt vào cookie và chuyển hướng
const createTokenAndSendResponse = (user, res) => {
    // 1. Tạo JWT
    const token = jwt.sign({ id: user._id, role: user.role }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
    });
    
    // 2. Đặt JWT vào HTTP-only Cookie
    const expiresMatch = config.jwt.expiresIn ? config.jwt.expiresIn.match(/(\d+)(d|h|m|s)/) : null;
    let expiresInDays = 90; 
    if (expiresMatch && expiresMatch[2] === 'd') {
        expiresInDays = parseInt(expiresMatch[1], 10);
    }
    
    const cookieOptions = {
        expires: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000), 
        httpOnly: true, // Bảo mật XSS
        secure: config.nodeEnv === 'production', 
    };
    
    res.cookie('jwt', token, cookieOptions);
    
    // 3. Chuyển hướng dựa trên role
    let redirectPath;
    switch (user.role) {
        case 'admin':
            redirectPath = '/admin';
            break;
        case 'ql_thiet_bi':
            redirectPath = '/manager';
            break;
        case 'hieu_truong':
            redirectPath = '/principal';
            break;
        default: // giao_vien, to_truong
            redirectPath = '/teacher/borrow/teacher-home';
            break;
    }
    
    res.redirect(redirectPath);
}

// Auth Controller
// Chứa logic hiển thị và xử lý Đăng nhập/Đăng xuất (Phiên bản JWT)
class AuthController {
    // GET /auth/login - Hiển thị trang đăng nhập
    getLoginPage(req, res) {
        res.render('auth/views/login', {
            title: 'Đăng nhập hệ thống',
            error: req.query.error || null,
            success: req.query.success || null,
        });
    }

    // POST /auth/login - Xử lý đăng nhập (Logic JWT)
    async handleLogin(req, res) {
        const { username, password } = req.body;
        const loginUrl = '/auth/login';

        if (!username || !password) {
            const errorMessage = getErrorMessage(ERROR_CODES.AUTH_INVALID_CREDENTIALS);
            return res.redirect(`${loginUrl}?error=${encodeURIComponent(errorMessage)}`);
        }
        
        // 1. Tìm user theo username và BẮT BUỘC lấy trường matKhauHash
        const user = await User.findOne({ username }).select('+matKhauHash');
        
        // 2. Kiểm tra user tồn tại và so sánh mật khẩu bằng bcrypt
        if (!user || !(user.matKhauHash && await bcrypt.compare(password, user.matKhauHash))) {
            const errorMessage = getErrorMessage(ERROR_CODES.AUTH_INVALID_CREDENTIALS);
            return res.redirect(`${loginUrl}?error=${encodeURIComponent(errorMessage)}`);
        }
        
        // 3. Tạo và gửi JWT (đặt vào cookie)
        return createTokenAndSendResponse(user, res);
    }

    // GET /auth/logout - Xử lý đăng xuất (Xóa cookie JWT)
    handleLogout(req, res) {
        // Xóa cookie JWT
        res.cookie('jwt', 'loggedout', {
            expires: new Date(Date.now() + 10 * 1000), 
            httpOnly: true,
        });
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
        res.redirect('/auth/login?success=Vui lòng kiểm tra email để đặt lại mật khẩu');
    }
}

module.exports = new AuthController();