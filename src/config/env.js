/**
 * Environment configuration
 */
require('dotenv').config();

const config = {
	port: process.env.PORT || 3000,
	nodeEnv: process.env.NODE_ENV,
	mongodb: {
		uri: process.env.MONGODB_URI,
		dbName: process.env.MONGODB_DB,
	},
	jwt: {
		secret: process.env.JWT_SECRET || 'dev_secret_key_fallback',
		expiresIn: process.env.JWT_EXPIRES_IN || '24h',
	},
	session: {
		secret: process.env.SESSION_SECRET,
	},
	upload: {
		maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB
		allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
		uploadDir: process.env.UPLOAD_DIR || 'uploads',
	},
	rabbitmq: {
		uri: process.env.RABBITMQ_URI
	},
};

module.exports = config;

