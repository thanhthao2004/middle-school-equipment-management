const express = require('express');
const path = require('path');
<<<<<<< HEAD
const config = require('./src/config/env'); 
const logger = require('./src/config/logger');
const { errorHandler, notFoundHandler } = require('./src/core/middlewares/error.middleware'); 
=======
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();
>>>>>>> features/borrow

const app = express();

// ==========================
// ⚙️ Cấu hình view engine
// ==========================
// THAY ĐỔI QUAN TRỌNG: Cấu hình views về thư mục gốc chứa views
app.set('views', path.join(__dirname, 'src/views')); 
app.set('view engine', 'ejs');

// ==========================
// ⚙️ Middleware & Static Files
// ==========================
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use(express.static(path.join(__dirname, 'public')));

// ==========================
<<<<<<< HEAD
//  Kết nối MongoDB
// ==========================
(async () => {
	try {
		const { connectMongo } = require('./src/config/db');
		await connectMongo();
		logger.info('MongoDB connection initiated');
	} catch (e) {
		logger.error('MongoDB init failed:', e.message);
		logger.warn(' ** Server vẫn chạy nhưng chưa kết nối được MongoDB');
		logger.warn(' ** Hướng dẫn: Chạy "npm run db:up" để khởi động MongoDB');
	}
})();

// ==========================
// ⚙️ ROUTES
=======
// ⚙️ Routes cấu hình
>>>>>>> features/borrow
// ==========================
const borrowRoutes = require('./src/features/borrow/routes/borrow.routes');
const purchasingRoutes = require('./src/features/purchasing-plans/routes/purchasing.routes');

<<<<<<< HEAD
// Use feature routes
const purchasingRoutes = require('./src/features/purchasing-plans/routes/purchasing.routes');
app.use('/purchasing-plans', purchasingRoutes);

// Borrow (mượn thiết bị)
const borrowRoutes = require('./src/features/borrow/routes/borrow.routes');
app.use('/borrow', borrowRoutes);
// app.get('/', (req, res) => res.redirect('/teacher/home'));

// Categories feature
const categoriesRoutes = require('./src/features/categories/routes/categories.routes');
app.use('/categories', categoriesRoutes);

// ==========================
// Error Handling
// ==========================
app.use(notFoundHandler); 
app.use(errorHandler);

// ==========================
// Khởi động server
// ==========================
app.listen(config.port, () => {
  logger.info(`Server đang chạy tại: http://localhost:${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
});
=======
app.use('/borrow', borrowRoutes);
app.use('/purchasing-plans', purchasingRoutes); // Thêm route của Purchasing Plans
// Thêm các route khác tại đây...

app.get('/', (req, res) => res.redirect('/borrow/teacher-home'));

// ==========================
// ⚙️ 404 & Error Handling
// ==========================
// 404 Handler
app.use((req, res, next) => {
    // THAY ĐỔI QUAN TRỌNG: Gọi file view chung 'error_page'
    res.status(404).render('error_page', { 
        title: '404 - Không tìm thấy trang',
        message: 'Trang bạn yêu cầu không tồn tại.',
        status: 404
    });
});

// 500 Handler (Error middleware)
app.use((err, req, res, next) => {
    console.error('❌ SERVER ERROR:', err.stack);
    
    // Đảm bảo status được set là 500
    const status = err.status || 500;
    
    // THAY ĐỔI QUAN TRỌNG: Gọi file view chung 'error_page'
    res.status(status).render('error_page', { 
        title: `${status} - Lỗi máy chủ`,
        message: 'Đã xảy ra lỗi nội bộ trên server.',
        status: status,
        // Chỉ hiển thị stack trace nếu không phải môi trường production
        errorDetail: app.get('env') === 'development' ? err.stack : undefined 
    });
});

// ==========================
// ⚙️ Xuất app cho bin/www
// ==========================
module.exports = app;
>>>>>>> features/borrow
