const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const path = require('path');
require('dotenv').config();

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/features'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static files
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Kết nối MongoDB (tạm thời comment để test)
// connectDB();

// Routes
// Trang chủ: chuyển thẳng về trang giáo viên
app.get('/', (req, res) => {
    res.redirect('/teacher/home');
});

// Teacher home (giáo viên)
app.get('/teacher/home', (req, res) => {
    res.render('borrow/views/teacher-home', { title: 'Trang chủ giáo viên', currentPage: 'teacher-home' });
});

// Alias to support links that point to /borrow/teacher-home
app.get('/borrow/teacher-home', (req, res) => {
    res.redirect('/teacher/home');
});

// Borrow routes
app.get('/borrow/register', (req, res) => {
    res.render('borrow/views/register', { title: 'Đăng ký mượn thiết bị', currentPage: 'register' });
});

app.get('/borrow/slip/:id', (req, res) => {
    res.render('borrow/views/slip', { title: 'Phiếu mượn thiết bị', slipId: req.params.id, from: req.query.from || '' });
});

app.get('/borrow/history', (req, res) => {
    res.render('borrow/views/history', { title: 'Lịch sử mượn/trả', currentPage: 'history' });
});

app.get('/borrow/pending-approvals', (req, res) => {
    res.render('borrow/views/pending-approvals', { title: 'Chờ duyệt', currentPage: 'status' });
});

// Backward-compatible alias for status → pending approvals
app.get('/borrow/status', (req, res) => {
    res.redirect('/borrow/pending-approvals');
});

app.get('/borrow/detail/:id', (req, res) => {
    res.render('borrow/views/detail', { title: 'Chi tiết phiếu', id: req.params.id });
});

app.get('/borrow/cancel', (req, res) => {
    res.render('borrow/views/cancel', { title: 'Hủy phiếu' });
});

// Routes cho các feature (sẽ implement sau)
app.get('/devices', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Quản lý thiết bị</title>
            <link href="/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
                <div class="container">
                    <a class="navbar-brand" href="/">🏫 Equipment Management</a>
                </div>
            </nav>
            <div class="container mt-4">
                <h1>📱 Quản lý thiết bị</h1>
                <div class="alert alert-info">
                    <h5>Chức năng đang được phát triển...</h5>
                    <p>Danh sách thiết bị sẽ hiển thị ở đây</p>
                </div>
                <a href="/" class="btn btn-secondary">← Quay lại trang chủ</a>
            </div>
        </body>
        </html>
    `);
});

app.get('/auth/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Đăng nhập</title>
            <link href="/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
                <div class="container">
                    <a class="navbar-brand" href="/">🏫 Equipment Management</a>
                </div>
            </nav>
            <div class="container mt-5">
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h4 class="text-center">🔐 Đăng nhập</h4>
                            </div>
                            <div class="card-body">
                                <form>
                                    <div class="mb-3">
                                        <label for="username" class="form-label">Tên đăng nhập</label>
                                        <input type="text" class="form-control" id="username" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="password" class="form-label">Mật khẩu</label>
                                        <input type="password" class="form-control" id="password" required>
                                    </div>
                                    <div class="d-grid">
                                        <button type="submit" class="btn btn-primary">Đăng nhập</button>
                                    </div>
                                </form>
                                <div class="text-center mt-3">
                                    <a href="/" class="btn btn-secondary">← Quay lại trang chủ</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));