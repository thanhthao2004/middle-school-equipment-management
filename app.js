const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

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


// Use feature routes
const purchasingRoutes = require('./src/features/purchasing-plans/routes/purchasing.routes');
app.use('/purchasing-plans', purchasingRoutes);

// Categories feature (từ develop)
const categoriesRoutes = require('./src/features/categories/routes/categories.routes');
app.use('/categories', categoriesRoutes);

const usersRoutes = require('./src/features/users/routes/users.routes');
app.use('/users', usersRoutes);
// ==========================
// ⚙️ ROUTES
// ==========================

// Borrow (mượn thiết bị)
app.get('/', (req, res) => res.redirect('/teacher/home'));

app.get('/teacher/home', (req, res) => {
  res.render('borrow/views/teacher-home', { title: 'Trang chủ giáo viên', currentPage: 'teacher-home' });
});

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

app.get('/borrow/detail/:id', (req, res) => {
  res.render('borrow/views/detail', { title: 'Chi tiết phiếu', id: req.params.id });
});

app.get('/borrow/cancel', (req, res) => {
  res.render('borrow/views/cancel', { title: 'Hủy phiếu' });
});

// Categories feature (từ develop)

// ==========================
// Khởi động server
// ==========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server đang chạy tại: http://localhost:${PORT}`));
