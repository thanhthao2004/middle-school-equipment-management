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


// Use feature routes
const purchasingRoutes = require('./src/features/purchasing-plans/routes/purchasing.routes');
app.use('/purchasing-plans', purchasingRoutes);

// ==========================
// Khởi động server
// ==========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server đang chạy tại: http://localhost:${PORT}`));