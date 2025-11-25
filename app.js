const express = require('express');
const path = require('path');

// Từ HEAD
const config = require('./src/config/env');
const { errorHandler, notFoundHandler } = require('./src/core/middlewares/error.middleware');

// Từ features/borrow
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();

const app = express();

// ==========================
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
app.use('/purchasing-plans', purchasingRoutes);
app.use('/categories', categoriesRoutes);
// app.get('/', (req, res) => res.redirect('/teacher/home'));

// Disposal feature
const disposalRoutes = require('./src/features/disposal/routes/disposal.routes');
app.use('/disposal', disposalRoutes);

// Redirect trang chủ
app.get('/', (req, res) => res.redirect('/borrow/teacher-home'));

// ==========================
// ⚙️ 404 Handler
// ==========================
app.use((req, res, next) => {
    res.status(404).render('error_page', {
        title: '404 - Không tìm thấy trang',
        message: 'Trang bạn yêu cầu không tồn tại.',
        status: 404
    });
});

// ==========================
// ⚙️ 500 Handler
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
// ⚙️ Start Server
// ==========================
app.listen(config.port, () => {
    console.log(`Server đang chạy tại: http://localhost:${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
});

module.exports = app;
