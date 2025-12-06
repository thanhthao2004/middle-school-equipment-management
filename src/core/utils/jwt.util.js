/**
 * JWT Utility Functions
 * Wrapper around jsonwebtoken for signing, verifying, and decoding JWTs
 */

const jwt = require('jsonwebtoken');
const config = require('../../config/env');

/**
 * Sign a JWT token with payload
 * @param {Object} payload - Data to encode in token (e.g., { id, username, role })
 * @param {String} expiresIn - Token expiration (default from config)
 * @returns {String} Signed JWT token
 */
function sign(payload, expiresIn = config.jwt.expiresIn) {
    if (!config.jwt.secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.sign(payload, config.jwt.secret, {
        expiresIn,
        issuer: 'middle-school-equipment-mgmt',
    });
}

/**
 * Verify and decode a JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
function verify(token) {
    if (!config.jwt.secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    try {
        return jwt.verify(token, config.jwt.secret, {
            issuer: 'middle-school-equipment-mgmt',
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Token không hợp lệ.');
        } else {
            throw error;
        }
    }
}

/**
 * Decode a JWT token without verifying signature
 * WARNING: Only use for debugging or extracting non-sensitive data
 * @param {String} token - JWT token to decode
 * @returns {Object} Decoded payload (unverified)
 */
function decode(token) {
    return jwt.decode(token);
}

module.exports = {
    sign,
    verify,
    decode,
};
