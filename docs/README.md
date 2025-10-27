# 🏫 Middle School Equipment Management

Hệ thống quản lý thiết bị trường THCS - Dự án sinh viên

## 📋 Mục lục

- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt dự án](#cài-đặt-dự-án)
- [Cấu hình môi trường](#cấu-hình-môi-trường)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Quy trình làm việc](#quy-trình-làm-việc)
- [Troubleshooting](#troubleshooting)

## 🖥️ Yêu cầu hệ thống

### **Phần mềm cần thiết:**
- **Node.js** >= 18.x
- **npm** >= 8.x
- **Git** >= 2.x
- **MongoDB** (tùy chọn - có thể bỏ qua để test)

### **Kiểm tra phiên bản:**
```bash
node --version    # >= 18.x
npm --version     # >= 8.x
git --version     # >= 2.x
```

## 🚀 Cài đặt dự án

### **Bước 1: Clone repository**
```bash
git clone <repository-url>
cd middle-school-equipment-management
```

### **Bước 2: Cài đặt dependencies**
```bash
npm install
```

### **Bước 3: Tạo file .env**
```bash
touch .env
```

## ⚙️ Cấu hình môi trường

### **Tạo file `.env` trong thư mục gốc:**

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Database Configuration (tùy chọn)
MONGODB_URI=mongodb://127.0.0.1:27017/production_db
DB_NAME=production_db

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-here
JWT_SECRET=your-jwt-secret-key-here

# Application Settings
APP_NAME="Middle School Equipment Management"
APP_VERSION="1.0.0"
APP_URL=http://localhost:3001

# Security Settings
BCRYPT_ROUNDS=12
TOKEN_EXPIRES_IN=24h

# Pagination Settings
DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=100
```

### **Lưu ý quan trọng:**
- ✅ **Bắt buộc:** Tạo file `.env` trước khi chạy
- ✅ **Bắt buộc:** Thay đổi `SESSION_SECRET` và `JWT_SECRET`
- ⚠️ **Tùy chọn:** MongoDB có thể bỏ qua để test

## 🎯 Chạy ứng dụng

### **Cách 1: Chạy development**
```bash
npm run dev
```

### **Cách 2: Chạy production**
```bash
npm start
```

### **Cách 3: Chạy với port khác**
```bash
PORT=3002 npm run dev
```

## 🌐 Truy cập ứng dụng

Sau khi chạy thành công, truy cập:

- **Trang chủ:** http://localhost:3001
- **Quản lý thiết bị:** http://localhost:3001/devices
- **Đăng nhập:** http://localhost:3001/auth/login

## 📁 Cấu trúc dự án

```
middle-school-equipment-management/
├── docs/                          # Tài liệu dự án
├── src/                          # Source code chính
│   ├── features/                 # Các tính năng
│   │   ├── auth/                 # Đăng nhập/đăng xuất
│   │   ├── devices/              # Quản lý thiết bị
│   │   ├── borrow/               # Mượn/trả thiết bị
│   │   └── ...                   # Các feature khác
│   ├── core/                     # Code chung
│   └── views/                    # Layout chung
├── config/                       # Cấu hình
├── public/                       # Static files
├── app.js                        # File chính
├── package.json                  # Dependencies
└── .env                         # Biến môi trường (tự tạo)
```

## 👥 Quy trình làm việc

### **1. Tạo nhánh feature (Team Lead)**
```bash
# Tạo nhánh feature mới
git checkout -b feature/devices
git push -u origin feature/devices
```

### **2. Tạo nhánh con cho member**
```bash
# Team Lead tạo nhánh cho member
git checkout feature/devices
git checkout -b feature/devices/member-name-ui
git push -u origin feature/devices/member-name-ui
```

### **3. Member làm việc**
```bash
# Member checkout nhánh của mình
git checkout feature/devices/member-name

# Làm việc trong thư mục
src/features/devices/
├── controllers/    # Logic xử lý
├── services/       # Business logic
├── models/         # Database schemas
├── routes/         # API endpoints
├── views/          # Giao diện
└── validators/     # Validation
```

### **4. Commit và push**
```bash
git add .
git commit -m "feat(devices): add device list UI"
git push origin feature/devices/member-name-ui
```

## Troubleshooting

### **Lỗi thường gặp:**

#### **1. Port đã được sử dụng**
```bash
Error: listen EADDRINUSE: address already in use :::3000
```
**Giải pháp:**
```bash
# Tìm process đang dùng port
lsof -i:3000

# Tắt process
kill -9 <PID>

# Hoặc đổi port
PORT=3002 npm run dev
```

#### **2. MongoDB connection error**
```bash
MongoDB connection error: connect ECONNREFUSED
```
**Giải pháp:**
- Bỏ qua MongoDB (đã được comment trong code)
- Hoặc cài MongoDB: `brew install mongodb-community`

#### **3. Module not found**
```bash
Error: Cannot find module 'express'
```
**Giải pháp:**
```bash
npm install
```

#### **4. File .env không tồn tại**
```bash
Error: Cannot find module './.env'
```
**Giải pháp:**
```bash
touch .env
# Thêm nội dung vào file .env (xem phần cấu hình)
```

### **Kiểm tra trạng thái:**
```bash
# Kiểm tra port
lsof -i:3001

# Kiểm tra process Node.js
ps aux | grep node

# Kiểm tra dependencies
npm list
```

##  Ghi chú

- Dự án sử dụng **Monolith architecture**
- Sử dụng **Express.js + EJS + Bootstrap**
- Database: **MongoDB** 

