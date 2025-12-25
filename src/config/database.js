/**
 * Database Connection
 * Tách riêng logic kết nối database
 */

const { connectMongo } = require('./db');
const logger = require('./logger');

/**
 * Khởi tạo kết nối MongoDB
 */
async function initializeDatabase() {
	setImmediate(async () => {
		try {
			await connectMongo();
			logger.info('MongoDB connection initiated');
		} catch (e) {
			logger.error('MongoDB init failed:', e.message);
			logger.warn(' ** Server vẫn chạy nhưng chưa kết nối được MongoDB');
			logger.warn(' ** Hướng dẫn: Chạy "npm run db:up" để khởi động MongoDB');
		}
	});
}

module.exports = { initializeDatabase };