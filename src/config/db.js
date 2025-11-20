const mongoose = require('mongoose');
const config = require('./env');
const logger = require('./logger');

let isConnected = false;

async function connectMongo() {
	if (isConnected) return mongoose.connection;

	// Kiểm tra URI có tồn tại không
	if (!config.mongodb.uri) {
		logger.warn('MongoDB URI không được cấu hình, bỏ qua kết nối');
		return null;
	}

	try {
		// Đóng connection cũ nếu có
		if (mongoose.connection.readyState !== 0) {
			await mongoose.connection.close();
		}

		const connectionOptions = {
			dbName: config.mongodb.dbName,
			autoIndex: false, // Tắt autoIndex để tăng tốc kết nối
			serverSelectionTimeoutMS: 3000, // Timeout sau 3 giây
			socketTimeoutMS: 30000, // Socket timeout 30 giây
			connectTimeoutMS: 5000, // Connection timeout 5 giây
			maxPoolSize: 10, // Giới hạn connection pool
			directConnection: false, // Không dùng direct connection
		};

		await mongoose.connect(config.mongodb.uri, connectionOptions);

		isConnected = true;
		logger.info('MongoDB connected successfully');
		return mongoose.connection;
	} catch (error) {
		isConnected = false;
		logger.error('MongoDB connection failed:', error.message);
		// Không throw error, chỉ log để app vẫn chạy được
		return null;
	}
}

mongoose.connection.on('connected', () => {
	logger.info('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
	logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
	logger.warn('MongoDB disconnected');
});

module.exports = { connectMongo };

