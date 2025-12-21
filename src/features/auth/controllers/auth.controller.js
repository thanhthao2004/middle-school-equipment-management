/**
 * Auth Controller
 * Handles authentication routes: login, logout, password management
 */

const authService = require('../services/auth.service');

class AuthController {
    /**
     * GET /auth/login - Display login page
     */
    getLoginPage(req, res) {
        // If already logged in, redirect to homepage
        if (req.user) {
            return res.redirect('/');
        }

        res.render('auth/views/login', {
            title: 'Đăng nhập hệ thống',
            error: req.query.error || null,
            success: req.query.success || null,
        });
    }

    /**
     * POST /auth/login - Handle login
     */
    async handleLogin(req, res) {
        try {
            const { username, password } = req.body;

            // Validate input
            if (!username || !password) {
                return res.redirect('/auth/login?error=' + encodeURIComponent('Vui lòng nhập đầy đủ thông tin'));
            }

            // Authenticate user
            const user = await authService.login(username, password);

            // Generate JWT token
            const token = authService.generateToken(user);

            // Set HTTP-only cookie (7 days)
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // HTTPS only in production
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                sameSite: 'strict',
            });

            // Redirect based on role
            const redirectPath = this._getRedirectPathByRole(user.role);
            res.redirect(redirectPath);

        } catch (error) {
            console.error('Login error:', error);
            return res.redirect('/auth/login?error=' + encodeURIComponent(error.message));
        }
    }

    /**
     * GET /auth/logout - Handle logout
     */
    handleLogout(req, res) {
        // Clear JWT cookie
        res.clearCookie('token');
        res.redirect('/auth/login?success=' + encodeURIComponent('Đăng xuất thành công'));
    }

    /**
     * GET /auth/register/:token - Display set password page for registration token
     */
    async getRegisterWithToken(req, res) {
        try {
            const { token } = req.params;

            // Verify registration token
            const user = await authService.verifyRegistrationToken(token);

            res.render('auth/views/set-password', {
                title: 'Thiết lập mật khẩu',
                token,
                user,
                error: null,
                query: req.query,
            });

        } catch (error) {
            console.error('Registration token error:', error);
            return res.redirect('/auth/login?error=' + encodeURIComponent(error.message));
        }
    }

    /**
     * POST /auth/register/:token - Handle password setup with token
     */
    async handleSetPassword(req, res) {
        try {
            const { token } = req.params;
            const { password, confirmPassword } = req.body;

            // Validate passwords
            if (!password || !confirmPassword) {
                return res.redirect(`/auth/register/${token}?error=` + encodeURIComponent('Vui lòng nhập đầy đủ thông tin'));
            }

            if (password !== confirmPassword) {
                return res.redirect(`/auth/register/${token}?error=` + encodeURIComponent('Mật khẩu xác nhận không khớp'));
            }

            if (password.length < 6) {
                return res.redirect(`/auth/register/${token}?error=` + encodeURIComponent('Mật khẩu phải có ít nhất 6 ký tự'));
            }

            // Activate user with password
            const user = await authService.activateUserWithPassword(token, password);

            // Auto-login after successful registration
            const jwtToken = authService.generateToken(user);

            res.cookie('token', jwtToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                sameSite: 'strict',
            });

            // Redirect to homepage
            const redirectPath = this._getRedirectPathByRole(user.role);
            res.redirect(redirectPath);

        } catch (error) {
            console.error('Set password error:', error);
            const { token } = req.params;
            return res.redirect(`/auth/register/${token}?error=` + encodeURIComponent(error.message));
        }
    }

    /**
     * GET /auth/password/change - Display change password page
     */
    getChangePasswordPage(req, res) {
        if (!req.user) {
            return res.redirect('/auth/login');
        }

        res.render('auth/views/change-password', {
            title: 'Đổi mật khẩu',
            user: req.user,
            error: req.query.error || null,
            success: req.query.success || null,
        });
    }

    /**
     * POST /auth/password/change - Handle password change
     */
    async handleChangePassword(req, res) {
        try {
            if (!req.user) {
                return res.redirect('/auth/login');
            }

            const { currentPassword, newPassword, confirmPassword } = req.body;

            // Validate input
            if (!currentPassword || !newPassword || !confirmPassword) {
                return res.redirect('/auth/password/change?error=' + encodeURIComponent('Vui lòng nhập đầy đủ thông tin'));
            }

            if (newPassword !== confirmPassword) {
                return res.redirect('/auth/password/change?error=' + encodeURIComponent('Mật khẩu mới không khớp'));
            }

            if (newPassword.length < 6) {
                return res.redirect('/auth/password/change?error=' + encodeURIComponent('Mật khẩu phải có ít nhất 6 ký tự'));
            }

            // Change password
            await authService.changePassword(req.user.id, currentPassword, newPassword);

            res.redirect('/auth/password/change?success=' + encodeURIComponent('Đổi mật khẩu thành công'));

        } catch (error) {
            console.error('Change password error:', error);
            return res.redirect('/auth/password/change?error=' + encodeURIComponent(error.message));
        }
    }

    /**
     * GET /auth/password/forgot - Display forgot password page
     */
    getForgotPasswordPage(req, res) {
        res.render('auth/views/forgot-password', {
            title: 'Quên mật khẩu',
            error: null,
            success: null,
        });
    }

    /**
     * POST /auth/password/forgot - Handle forgot password
     */
    async handleForgotPassword(req, res) {
        try {
            const { username } = req.body;

            if (!username) {
                return res.render('auth/views/forgot-password', {
                    title: 'Quên mật khẩu',
                    error: 'Vui lòng nhập tên đăng nhập',
                    success: null
                });
            }

            // Generate reset token
            const token = await authService.createPasswordResetToken(username);

            // Redirect to set password page
            res.redirect(`/auth/register/${token}`);

        } catch (error) {
            console.error('Forgot password error:', error);
            res.render('auth/views/forgot-password', {
                title: 'Quên mật khẩu',
                error: error.message,
                success: null
            });
        }
    }

    /**
     * Get redirect path based on user role
     * @private
     */
    _getRedirectPathByRole(role) {
        const roleRedirects = {
            'admin': '/admin',
            'ql_thiet_bi': '/manager',
            'giao_vien': '/teacher/borrow/teacher-home',
            'to_truong': '/teacher/borrow/teacher-home',
            'hieu_truong': '/principal',
        };

        return roleRedirects[role] || '/teacher/borrow/teacher-home';
    }

    // Bind methods in constructor
    constructor() {
        // Bind all methods to preserve 'this' context
        this.getLoginPage = this.getLoginPage.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.getRegisterWithToken = this.getRegisterWithToken.bind(this);
        this.handleSetPassword = this.handleSetPassword.bind(this);
        this.getChangePasswordPage = this.getChangePasswordPage.bind(this);
        this.handleChangePassword = this.handleChangePassword.bind(this);
        this.getForgotPasswordPage = this.getForgotPasswordPage.bind(this);
        this.handleForgotPassword = this.handleForgotPassword.bind(this);
    }
}

module.exports = new AuthController();