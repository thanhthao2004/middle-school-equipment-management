# ⚙️ Environment Setup Guide

Hướng dẫn chi tiết cài đặt môi trường cho Middle School Equipment Management

## 🖥️ Yêu cầu hệ thống

### **Phần mềm bắt buộc:**
- **Node.js** >= 18.x
- **npm** >= 8.x
- **Git** >= 2.x

### **Phần mềm tùy chọn:**
- **MongoDB** (có thể bỏ qua để test)
- **MongoDB Compass** (GUI cho MongoDB)
- **VS Code** (editor khuyến nghị)

## 📥 Cài đặt Node.js

### **macOS:**
```bash
# Cách 1: Sử dụng Homebrew
brew install node

# Cách 2: Tải từ website
# Truy cập: https://nodejs.org
# Tải phiên bản LTS (>= 18.x)
```

### **Windows:**
```bash
# Tải từ website
# Truy cập: https://nodejs.org
# Tải phiên bản LTS (>= 18.x)
# Chạy installer và làm theo hướng dẫn
```

### **Linux (Ubuntu/Debian):**
```bash
# Cập nhật package list
sudo apt update

# Cài Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 🔍 Kiểm tra cài đặt

```bash
# Kiểm tra Node.js
node --version
# Kết quả mong đợi: v18.x.x hoặc cao hơn

# Kiểm tra npm
npm --version
# Kết quả mong đợi: 8.x.x hoặc cao hơn

# Kiểm tra Git
git --version
# Kết quả mong đợi: 2.x.x hoặc cao hơn
```

## 📁 Cài đặt dự án

### **Bước 1: Clone repository**
```bash
# Clone project
git clone <repository-url>
cd middle-school-equipment-management

# Kiểm tra cấu trúc thư mục
ls -la
```

### **Bước 2: Cài đặt dependencies**
```bash
# Cài đặt tất cả dependencies
npm install

# Kiểm tra dependencies đã cài
npm list
```

### **Bước 3: Tạo file .env**
```bash
# Tạo file .env
touch .env
```

## 🔧 Cấu hình file .env

### **Nội dung file `.env` (bắt buộc):**

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration (tùy chọn)
MONGODB_URI=mongodb://127.0.0.1:27017/production_db
DB_NAME=production_db

# Session Configuration (BẮT BUỘC - thay đổi giá trị)
SESSION_SECRET=your-super-secret-session-key-here-12345
JWT_SECRET=your-jwt-secret-key-here-67890

# Application Settings
APP_NAME="Middle School Equipment Management"
APP_VERSION="1.0.0"
APP_URL=http://localhost:3000

# Security Settings
BCRYPT_ROUNDS=12
TOKEN_EXPIRES_IN=24h

# Pagination Settings
DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=100
```

### **Lưu ý quan trọng:**
-  **Bắt buộc:** Thay đổi `SESSION_SECRET` và `JWT_SECRET`
-  **Bắt buộc:** Đảm bảo file `.env` nằm trong thư mục gốc
-  **Tùy chọn:** MongoDB có thể bỏ qua để test

## 🗄️ Cài đặt MongoDB (Tùy chọn)

### **macOS:**
```bash
# Cài MongoDB Community Edition
brew tap mongodb/brew
brew install mongodb-community

# Khởi động MongoDB
brew services start mongodb-community

# Kiểm tra MongoDB đang chạy
brew services list | grep mongodb
```

### **Windows:**
```bash
# Tải MongoDB Community Server
# Truy cập: https://www.mongodb.com/try/download/community
# Chọn Windows và tải về
# Chạy installer và làm theo hướng dẫn
```

### **Linux (Ubuntu/Debian):**
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Tạo file list cho MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Cập nhật package database
sudo apt-get update

# Cài MongoDB
sudo apt-get install -y mongodb-org

# Khởi động MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## 

### **Bước 1: Chạy ứng dụng**
```bash
npm run dev
```

### **Bước 2: Kiểm tra kết quả**
- Mở trình duyệt: http://localhost:3000
- Thấy trang chủ với giao diện Bootstrap
- Không có lỗi trong terminal


##  Troubleshooting

### **Lỗi thường gặp:**

#### **1. Node.js version quá cũ**
```bash
Error: Node.js version < 18
```
**Giải pháp:**
```bash
# Cập nhật Node.js lên phiên bản mới
# macOS: brew upgrade node
# Windows: Tải từ nodejs.org
```

#### **2. Port đã được sử dụng**
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

#### **3. Module not found**
```bash
Error: Cannot find module 'express'
```
**Giải pháp:**
```bash
# Cài lại dependencies
rm -rf node_modules package-lock.json
npm install
```

#### **4. File .env không tồn tại**
```bash
Error: Cannot find module './.env'
```
**Giải pháp:**
```bash
# Tạo file .env
touch .env
# Thêm nội dung (xem phần cấu hình)
```

#### **5. MongoDB connection error**
```bash
MongoDB connection error: connect ECONNREFUSED
```
**Giải pháp:**
- Bỏ qua MongoDB (đã được comment trong code)
- Hoặc cài MongoDB theo hướng dẫn trên

##  Checklist hoàn thành

- [ ] Node.js >= 18.x đã cài
- [ ] npm >= 8.x đã cài
- [ ] Git >= 2.x đã cài
- [ ] Project đã clone
- [ ] Dependencies đã cài (`npm install`)
- [ ] File `.env` đã tạo và cấu hình
- [ ] Ứng dụng chạy được (`npm run dev`)
- [ ] Truy cập được http://localhost:3000
- [ ] Không có lỗi trong terminal

##  Bước tiếp theo

Sau khi setup xong môi trường:

1. **Đọc tài liệu:** `docs/README.md`
2. **Xem quy trình:** `docs/TEAM-WORKFLOW.md`
3. **Bắt đầu code:** Chọn feature và tạo nhánh
4. **Liên hệ team lead:** Nếu có vấn đề

---

**Chúc bạn setup thành công! 🚀**
