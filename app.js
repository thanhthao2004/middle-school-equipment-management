const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const config = require('./src/config/env'); 
const logger = require('./src/config/logger');
const { errorHandler, notFoundHandler } = require('./src/core/middlewares/error.middleware'); 

const app = express();

// ==========================
// ⚙️ Cấu hình view engine
// ==========================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/features'));

// ==========================
// ⚙️ Middleware & Static
// ==========================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// ==========================
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
// ==========================

// Trang chủ mặc định: Chuyển hướng đến Trang chủ giáo viên (hoặc Đăng nhập)
app.get('/', (req, res) => res.redirect('/borrow/teacher-home'));


// Purchasing Plans feature
const purchasingRoutes = require('./src/features/purchasing-plans/routes/purchasing.routes');
app.use('/purchasing-plans', purchasingRoutes);

// Borrow feature (mượn thiết bị)
const borrowRoutes = require('./src/features/borrow/routes/borrow.routes');
app.use('/borrow', borrowRoutes);

// Categories feature
const categoriesRoutes = require('./src/features/categories/routes/categories.routes');
app.use('/categories', categoriesRoutes);

// Auth feature routes (login, change-password, etc.)
const authRoutes = require('./src/features/auth/routes/auth.routes');
app.use('/auth', authRoutes);

// ==========================
// Error Handling
// ==========================
// Must be placed after all routes
app.use(notFoundHandler); 
app.use(errorHandler);

// ==========================
// Khởi động server
// ==========================
app.listen(config.port, () => {
  logger.info(`Server đang chạy tại: http://localhost:${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
});