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
// 🔌 Kết nối MongoDB
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

// Purchasing Plans
const purchasingRoutes = require('./src/features/purchasing-plans/routes/purchasing.routes');
app.use('/purchasing-plans', purchasingRoutes);

// Borrow (mượn thiết bị)
const borrowRoutes = require('./src/features/borrow/routes/borrow.routes');
app.use('/borrow', borrowRoutes);

// Categories
const categoriesRoutes = require('./src/features/categories/routes/categories.routes');
app.use('/categories', categoriesRoutes);

// ==========================
// ➕ Periodic Reports (Báo cáo định kỳ) — Added
// ==========================
const periodicReportsRoutes = require('./src/features/periodic-reports/routes/periodic-report.routes');
app.use('/periodic-reports', periodicReportsRoutes);
const acceptanceRoutes = require('./src/features/acceptance/routes/acceptance.routes');
app.use('/acceptance', acceptanceRoutes);

// ==========================
// ❌ Error Handling
// ==========================
app.use(notFoundHandler);
app.use(errorHandler);

// ==========================
// 🚀 Khởi động server
// ==========================
app.listen(config.port, () => {
    logger.info(`Server đang chạy tại: http://localhost:${config.port}`);
    logger.info(`Environment: ${config.nodeEnv}`);
});
