const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();

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
// ⚙️ Routes cấu hình
// ==========================
const borrowRoutes = require('./src/features/borrow/routes/borrow.routes');
const purchasingRoutes = require('./src/features/purchasing-plans/routes/purchasing.routes');

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