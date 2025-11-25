const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const path = require('path');
const config = require('./src/config/env');
const logger = require('./src/config/logger');
const { errorHandler, notFoundHandler } = require('./src/core/middlewares/error.middleware');

// Từ HEAD
const config = require('./src/config/env');
const { errorHandler, notFoundHandler } = require('./src/core/middlewares/error.middleware');

// Từ features/borrow
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();

const app = express();

// ==========================
//  Cấu hình view engine
// ==========================
// Cấu hình views directory: tìm trong src/features để có thể render feature views
// Layouts và partials vẫn có thể được include từ src/views trong EJS templates
// Cấu hình nơi Express tìm file template (EJS) để render HTML.
app.set('views', path.join(__dirname, 'src/features')); 
app.set('view engine', 'ejs');

// ==========================
//  Middleware & Static
// ==========================
// Compression middleware - nén response để giảm băng thông
app.use(compression({
	filter: (req, res) => {
		// Chỉ nén nếu client hỗ trợ
		if (req.headers['x-no-compression']) {
			return false;
		}
		// Sử dụng compression mặc định
		return compression.filter(req, res);
	},
	level: 6, // Mức độ nén (1-9, 6 là cân bằng tốt)
	threshold: 1024 // Chỉ nén response > 1KB
}));

app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
// Serve public files với prefix /public để rõ ràng hơn
app.use('/public', express.static(path.join(__dirname, 'public')));

// ==========================
//  Kết nối MongoDB (không block app startup)
// ==========================
// Kết nối MongoDB trong background, không chờ đợi
setImmediate(async () => {
	try {
		const { connectMongo } = require('./src/config/db');
		await connectMongo();
		logger.info('MongoDB connection initiated');
	} catch (e) {
		logger.error('MongoDB init failed:', e.message);
		logger.warn(' ** Server vẫn chạy nhưng chưa kết nối được MongoDB');
		logger.warn(' ** Hướng dẫn: Chạy "npm run db:up" để khởi động MongoDB');
	}
});

// ==========================
//  ROUTES
// ==========================
// Borrow (mượn thiết bị)
const borrowRoutes = require('./src/features/borrow/routes/borrow.routes');
app.use('/borrow', borrowRoutes);

// Purchasing Plans
const purchasingRoutes = require('./src/features/purchasing-plans/routes/purchasing.routes');
app.use('/purchasing-plans', purchasingRoutes);
// ⚙️ View Engine
// ==========================
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'ejs');

// ==========================
// ⚙️ Middleware
// ==========================
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use(express.static(path.join(__dirname, 'public')));

// ==========================
// ⚙️ MongoDB Connection
// ==========================
(async () => {
    try {
        const { connectMongo } = require('./src/config/db');
        await connectMongo();
        console.log('MongoDB connection initiated');
    } catch (e) {
        console.error('MongoDB init failed:', e.message);
        console.warn(' Server vẫn chạy nhưng chưa kết nối được MongoDB');
        console.warn(' Hướng dẫn: Chạy "npm run db:up" để khởi động MongoDB');
    }
})();

// ==========================
// ⚙️ Routes
// ==========================
const borrowRoutes = require('./src/features/borrow/routes/borrow.routes');
const purchasingRoutes = require('./src/features/purchasing-plans/routes/purchasing.routes');
const categoriesRoutes = require('./src/features/categories/routes/categories.routes');

app.use('/borrow', borrowRoutes);

// Categories
const categoriesRoutes = require('./src/features/categories/routes/categories.routes');
app.use('/categories', categoriesRoutes);

// ==========================
//  Periodic Reports (Báo cáo định kỳ) — Added
// ==========================
const periodicReportsRoutes = require('./src/features/periodic-reports/routes/periodic-report.routes');
app.use('/periodic-reports', periodicReportsRoutes);
const acceptanceRoutes = require('./src/features/acceptance/routes/acceptance.routes');
app.use('/acceptance', acceptanceRoutes);

// ==========================
//  Error Handling
// ==========================
app.use(notFoundHandler);
app.use(errorHandler);

// ==========================
//  Khởi động server
// ==========================
app.listen(config.port, () => {
    logger.info(`Server đang chạy tại: http://localhost:${config.port}`);
    logger.info(`Environment: ${config.nodeEnv}`);
});
app.use('/purchasing-plans', purchasingRoutes);
app.use('/categories', categoriesRoutes);
// app.get('/', (req, res) => res.redirect('/teacher/home'));

// Disposal feature
const disposalRoutes = require('./src/features/disposal/routes/disposal.routes');
app.use('/disposal', disposalRoutes);

// Redirect trang chủ
app.get('/', (req, res) => res.redirect('/borrow/teacher-home'));

// ==========================
//  404 Handler
// ==========================
app.use((req, res, next) => {
    res.status(404).render('error_page', {
        title: '404 - Không tìm thấy trang',
        message: 'Trang bạn yêu cầu không tồn tại.',
        status: 404
    });
});

// Root redirect
app.get('/', (req, res) => res.redirect('/borrow/teacher-home'));

// ==========================
//  500 Handler
// ==========================
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.stack);
    const status = err.status || 500;

    res.status(status).render('error_page', {
        title: `${status} - Lỗi máy chủ`,
        message: 'Đã xảy ra lỗi nội bộ trên server.',
        status: status,
        errorDetail: app.get('env') === 'development' ? err.stack : undefined
    });
});

// ==========================
//  Start Server
// ==========================
app.listen(config.port, () => {
  logger.info(`Server đang chạy tại: http://localhost:${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  if (process.send) {
    process.send('ready');
  }
});
    console.log(`Server đang chạy tại: http://localhost:${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
});

module.exports = app;
