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

// Routes - tạm thời tạo route cơ bản
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Trang chủ</title>
            <link href="/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container mt-5">
                <h1 class="text-center">🏫 Middle School Equipment Management</h1>
                <div class="row mt-4">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Quản lý thiết bị</h5>
                                <p class="card-text">Quản lý danh sách thiết bị trong trường</p>
                                <a href="/devices" class="btn btn-primary">Xem thiết bị</a>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Đăng nhập</h5>
                                <p class="card-text">Truy cập hệ thống</p>
                                <a href="/auth/login" class="btn btn-success">Đăng nhập</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
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