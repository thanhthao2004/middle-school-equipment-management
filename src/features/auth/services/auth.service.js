/**
 * Authentication Service
 * Business logic for user authentication and authorization
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../../../features/users/models/user.model');
const jwtUtil = require('../../../core/utils/jwt.util');
const { ROLES, isValidRole } = require('../../../core/constants/roles.constants');


const SALT_ROUNDS = 10;
const REGISTRATION_TOKEN_EXPIRY_HOURS = 72; // 3 days

class AuthService {
    /**
     * Authenticate user with username and password
     * @param {String} username - Username or email
     * @param {String} password - Plain text password
     * @returns {Object} User object if successful
     * @throws {Error} If authentication fails
     */
    async login(username, password) {
        // Find user by username only
        const user = await User.findOne({ username: username.toLowerCase() });

        if (!user) {
            throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
        }

        // Check if user is active
        if (user.trangThai !== 'active') {
            throw new Error('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
        }

        // Verify password
        const isValidPassword = await this.comparePassword(password, user.matKhauHash);
        if (!isValidPassword) {
            throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
        }

        // Return user without password
        return this._sanitizeUser(user);
    }

    /**
     * Generate JWT token for authenticated user
     * @param {Object} user - User object
     * @returns {String} JWT token
     */
    generateToken(user) {
        const payload = {
            id: user._id.toString(),
            username: user.username,
            role: user.role,
            hoTen: user.hoTen,
        };

        return jwtUtil.sign(payload);
    }

    /**
     * Verify JWT token and return payload
     * @param {String} token - JWT token
     * @returns {Object} Decoded payload
     */
    verifyToken(token) {
        return jwtUtil.verify(token);
    }

    /**
     * Hash password using bcrypt
     * @param {String} password - Plain text password
     * @returns {String} Hashed password
     */
    async hashPassword(password) {
        return await bcrypt.hash(password, SALT_ROUNDS);
    }

    /**
     * Compare plain password with hashed password
     * @param {String} plainPassword - Plain text password
     * @param {String} hashedPassword - Hashed password
     * @returns {Boolean} True if passwords match
     */
    async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Change user password
     * @param {String} userId - User ID
     * @param {String} oldPassword - Current password
     * @param {String} newPassword - New password
     * @throws {Error} If old password is incorrect
     */
    async changePassword(userId, oldPassword, newPassword) {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('Người dùng không tồn tại');
        }

        // Verify old password
        const isValid = await this.comparePassword(oldPassword, user.matKhauHash);
        if (!isValid) {
            throw new Error('Mật khẩu hiện tại không đúng');
        }

        // Hash and save new password
        user.matKhauHash = await this.hashPassword(newPassword);
        user.firstLogin = false;
        await user.save();
    }

    /**
     * Generate unique registration token for new user
     * @returns {String} Registration token
     */
    generateRegistrationToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Verify registration token and return user
     * @param {String} token - Registration token
     * @returns {Object} User object if token is valid
     * @throws {Error} If token is invalid or expired
     */
    async verifyRegistrationToken(token) {
        const user = await User.findOne({ registrationToken: token });

        if (!user) {
            throw new Error('Token không hợp lệ hoặc đã được sử dụng');
        }

        if (user.registrationTokenExpiry && user.registrationTokenExpiry < new Date()) {
            throw new Error('Token đã hết hạn. Vui lòng liên hệ quản trị viên để được cấp token mới.');
        }

        return this._sanitizeUser(user);
    }

    /**
     * Activate user account with password
     * @param {String} token - Registration token
     * @param {String} password - New password
     * @returns {Object} Activated user
     * @throws {Error} If token is invalid
     */
    async activateUserWithPassword(token, password) {
        const user = await User.findOne({ registrationToken: token });

        if (!user) {
            throw new Error('Token không hợp lệ hoặc đã được sử dụng');
        }

        if (user.registrationTokenExpiry && user.registrationTokenExpiry < new Date()) {
            throw new Error('Token đã hết hạn');
        }

        // Set password and activate account
        user.matKhauHash = await this.hashPassword(password);
        user.isActive = true;
        user.registrationToken = undefined;
        user.registrationTokenExpiry = undefined;
        user.trangThai = 'active';

        await user.save();

        return this._sanitizeUser(user);
    }

    /**
     * Create registration token for existing user (for password reset)
     * @param {String} userId - User ID
     * @returns {String} Registration token
     */
    async createRegistrationTokenForUser(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('Người dùng không tồn tại');
        }

        const token = this.generateRegistrationToken();
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + REGISTRATION_TOKEN_EXPIRY_HOURS);

        user.registrationToken = token;
        user.registrationTokenExpiry = expiry;
        user.isActive = false;

        await user.save();

        return token;
    }

    /**
     * Remove sensitive fields from user object
     * @private
     * @param {Object} user - User document
     * @returns {Object} Sanitized user
     */
    _sanitizeUser(user) {
        const userObj = user.toObject();
        delete userObj.matKhauHash;
        delete userObj.registrationToken;
        delete userObj.registrationTokenExpiry;
        return userObj;
    }
    /**
     * Create password reset token for user
     * @param {String} username - Username
     * @returns {String} Registration/Reset token
     * @throws {Error} If user not found
     */
    async createPasswordResetToken(username) {
        // Clean input
        const cleanUsername = username.trim().toLowerCase();

        // Find user by username
        const user = await User.findOne({ username: cleanUsername });

        if (!user) {
            throw new Error('Tên đăng nhập không tồn tại');
        }

        const token = this.generateRegistrationToken();
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + REGISTRATION_TOKEN_EXPIRY_HOURS);

        user.registrationToken = token;
        user.registrationTokenExpiry = expiry;
        // Do not set isActive=false here, as they might be an active user just resetting password.
        // But the original createRegistrationTokenForUser sets it to false. 
        // For password reset flow, we should probably keep their status as is, 
        // but set-password flow might expect a certain state. 
        // Checking getRegisterWithToken logic... it just verifies token.

        await user.save();

        return token;
    }
}

module.exports = new AuthService();
