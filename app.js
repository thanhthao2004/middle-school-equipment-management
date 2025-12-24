/**
 * Main Application Entry Point
 * Tổ chức code theo cấu trúc rõ ràng, dễ đọc và dễ quản lý
 */

require('dotenv').config();
const path = require('path');

const express = require('express');
const config = require('./src/config/env');
const logger = require('./src/config/logger');
const { configureMiddleware } = require('./src/config/middleware');
const { configureViewEngine } = require('./src/config/view-engine');
const { initializeDatabase } = require('./src/config/database');
const { errorHandler, notFoundHandler } = require('./src/core/middlewares/error.middleware');
const routes = require('./src/routes');

// ==========================
// Initialize Express App
// ==========================
const app = express();

// ==========================
// Configuration
// ==========================
configureViewEngine(app);
configureMiddleware(app);
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
// ==========================
// Database Connection
// ==========================
initializeDatabase();

// ==========================
// Routes
// ==========================
app.use(routes);

// ==========================
// Error Handling
// ==========================
app.use(notFoundHandler); // 404 - Phải đặt sau tất cả routes
app.use(errorHandler);    // 500 - Phải đặt cuối cùng

// ==========================
// Start Server
// ==========================
const PORT = config.port || 3000;
app.listen(PORT, () => {
    logger.info(`Server đang chạy tại: http://localhost:${PORT}`);
    logger.info(`Environment: ${config.nodeEnv}`);
    if (process.send) {
        process.send('ready');
    }
});

module.exports = app;
