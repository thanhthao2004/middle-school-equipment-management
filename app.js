const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const path = require('path');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const logger = require('morgan'); // Giữ lại morgan logger
require('dotenv').config(); // Đảm bảo biến môi trường được tải

// Các modules chính và Middleware
const config = require('./src/config/env');
const appLogger = require('./src/config/logger'); // Đổi tên để tránh xung đột với morgan logger
const { errorHandler, notFoundHandler } = require('./src/core/middlewares/error.middleware');

const app = express();

// ==========================
// Cấu hình view engine
// ==========================
// CHỌN: Sử dụng 'src/features' làm thư mục views chính. Nếu cần 'src/views', hãy thay đổi logic này.
app.set('views', path.join(__dirname, 'src/features'));
app.set('view engine', 'ejs');

// ==========================
// Middleware & Static
// ==========================
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
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files (Đã hợp nhất các định nghĩa)
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
// CHỌN: Sử dụng prefix '/public' cho thư mục public để rõ ràng hơn
app.use('/public', express.static(path.join(__dirname, 'public')));


// ==========================
// Kết nối MongoDB
// ==========================
// CHỌN: Chỉ giữ lại 1 logic kết nối, sử dụng async/await và appLogger
setImmediate(async () => {
	try {
		const { connectMongo } = require('./src/config/db');
		await connectMongo();
		appLogger.info('MongoDB connection initiated');
	} catch (e) {
		appLogger.error('MongoDB init failed:', e.message);
		appLogger.warn(' ** Server vẫn chạy nhưng chưa kết nối được MongoDB');
		appLogger.warn(' ** Hướng dẫn: Chạy "npm run db:up" để khởi động MongoDB');
	}
});


// ==========================
// ROUTES
// ==========================
// Khai báo Routes
const borrowRoutes = require('./src/features/borrow/routes/borrow.routes');
const purchasingRoutes = require('./src/features/purchasing-plans/routes/purchasing.routes');
const categoriesRoutes = require('./src/features/categories/routes/categories.routes');
const trainingRoutes = require('./src/features/training-plans/routes/training.routes');
const periodicReportsRoutes = require('./src/features/periodic-reports/routes/periodic-report.routes');
const acceptanceRoutes = require('./src/features/acceptance/routes/acceptance.routes');
const disposalRoutes = require('./src/features/disposal/routes/disposal.routes');

// Borrow feature (mượn thiết bị)
const borrowRoutes = require('./src/features/borrow/routes/borrow.routes');
app.use('/borrow', borrowRoutes);

// Categories feature
const categoriesRoutes = require('./src/features/categories/routes/categories.routes');
// Áp dụng Routes
app.use('/borrow', borrowRoutes);
app.use('/purchasing-plans', purchasingRoutes);
app.use('/categories', categoriesRoutes);
app.use('/training-plans', trainingRoutes);
app.use('/periodic-reports', periodicReportsRoutes);
app.use('/acceptance', acceptanceRoutes);
app.use('/disposal', disposalRoutes);

// CHỌN: Chỉ giữ lại một Redirect trang chủ
app.get('/', (req, res) => res.redirect('/borrow/teacher-home'));


// Auth feature routes (login, change-password, etc.)
const authRoutes = require('./src/features/auth/routes/auth.routes');
app.use('/auth', authRoutes);

// ==========================
// Error Handling (Handlers 404 & 500)
// ==========================
// Sử dụng các middleware từ lõi:
app.use(notFoundHandler); // 404
app.use(errorHandler); // 500

// Nếu bạn muốn dùng logic 404 và 500 cũ, bạn cần thay thế notFoundHandler và errorHandler bằng các đoạn sau:
/*
// 404 Handler (Logic cũ)
app.use((req, res, next) => {
    res.status(404).render('error_page', {
        title: '404 - Không tìm thấy trang',
        message: 'Trang bạn yêu cầu không tồn tại.',
        status: 404
    });
});

// 500 Handler (Logic cũ)
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.stack);
    const status = err.status || 500;

    res.status(status).render('error_page', {
        title: `${status} - Lỗi máy chủ`,
        status: status,
        errorDetail: app.get('env') === 'development' ? err.stack : undefined
    });
});
*/


// ==========================
// Khởi động server
// ==========================
// CHỌN: Chỉ giữ lại 1 lần khởi động server, dùng config.port và appLogger
app.listen(config.port, () => {
    appLogger.info(`Server đang chạy tại: http://localhost:${config.port}`);
    appLogger.info(`Environment: ${config.nodeEnv}`);
    if (process.send) {
        process.send('ready');
    }
});

module.exports = app;