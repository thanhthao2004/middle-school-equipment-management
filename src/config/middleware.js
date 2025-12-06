/**
 * Middleware Configuration
 * Tập trung cấu hình tất cả middleware
 */

const express = require('express');
const path = require('path');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('morgan');
const config = require('./env');

/**
 * Cấu hình middleware cho Express app
 * @param {Express} app - Express application instance
 */
function configureMiddleware(app) {
	// Logger
	app.use(logger('dev'));

	// Compression
	app.use(compression({
		filter: (req, res) => {
			if (req.headers['x-no-compression']) {
				return false;
			}
			return compression.filter(req, res);
		},
		level: 6,
		threshold: 1024
	}));

	// Body Parsers
	app.use(express.json({ limit: '10mb' }));
	app.use(express.urlencoded({ extended: true, limit: '10mb' }));
	app.use(cookieParser());

	// Session middleware (FIX for req.session.flash)
	app.use(session({
		secret: config.session.secret || 'middle-school-equipment-secret-key-2024',
		resave: false,
		saveUninitialized: true,
		cookie: {
			secure: config.nodeEnv === 'production',
			maxAge: 24 * 60 * 60 * 1000 // 24 hours
		}
	}));

	// Static files
	app.use('/css', express.static(path.join(__dirname, '../../node_modules/bootstrap/dist/css')));
	app.use('/js', express.static(path.join(__dirname, '../../node_modules/bootstrap/dist/js')));
	app.use('/public', express.static(path.join(__dirname, '../../public')));
	// Serve uploads directory for uploaded images
	app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));
}

module.exports = { configureMiddleware };


