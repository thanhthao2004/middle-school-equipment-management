# 👥 Team Workflow Guide

Hướng dẫn quy trình làm việc cho team Middle School Equipment Management

# 1. Clone project (nếu chưa có)
git clone <repository-url>
cd middle-school-equipment-management

# 2. Cài đặt dependencies
npm install

# 3. Tạo file .env
touch .env
# Thêm nội dung vào .env (xem docs/README.md)

# 4. Chuyển sang nhánh của mình
git checkout feature/devices/member-a-ui

# 5. Bắt đầu code
# Làm việc trong: src/features/devices/
```

### **Bước 4: Commit và push thường xuyên**

```bash
# 1. Xem thay đổi
git status

# 2. Thêm file đã sửa
git add .

# 3. Commit với message rõ ràng
git commit -m "feat(devices): add device list UI"

# 4. Push lên remote
git push origin feature/devices/member-a-ui
```

### **Bước 5: Merge nhánh con vào feature**

```bash
# 1. Chuyển về nhánh feature
git checkout feature/devices

# 2. Merge nhánh con
git merge feature/devices/member-a-ui

# 3. Push nhánh feature
git push origin feature/devices
```

## 📝 Quy tắc đặt tên

### **Nhánh feature:**
- `feature/<feature-name>`
- Ví dụ: `feature/devices`, `feature/auth`

### **Nhánh con:**
- `feature/<feature-name>/<member-name>-<task-type>`
- Ví dụ: `feature/devices/member-a-ui`, `feature/auth/member-b-api`

### **Task types:**
- `ui` - Giao diện người dùng
- `api` - API endpoints
- `model` - Database models
- `test` - Unit tests
- `fix` - Bug fixes
- `docs` - Documentation

### **Commit message:**
- `feat(feature): description` - Tính năng mới
- `fix(feature): description` - Sửa lỗi
- `docs(feature): description` - Cập nhật tài liệu
- `style(feature): description` - Format code
- `refactor(feature): description` - Refactor code

## 🎯 Cấu trúc thư mục làm việc

Mỗi member làm việc trong thư mục feature của mình:

```
src/features/<feature-name>/
├── controllers/    # Logic xử lý request
│   └── <feature>.controller.js
├── services/       # Business logic
│   └── <feature>.service.js
├── repositories/   # Database access
│   └── <feature>.repo.js
├── models/         # Database schemas
│   └── <feature>.model.js
├── routes/         # API endpoints
│   └── <feature>.routes.js
├── validators/     # Input validation
│   └── <feature>.validators.js
└── views/          # EJS templates
    ├── list.ejs
    ├── create.ejs
    ├── edit.ejs
    └── detail.ejs
```

## ⚠️ Lưu ý quan trọng

### **1. Không cross-import giữa features**
```javascript
// ❌ SAI - Không import từ feature khác
const authService = require('../auth/services/auth.service');

// ✅ ĐÚNG - Import từ core nếu cần
const responseHelper = require('../../core/utils/response');
```

### **2. Shared code phải đặt trong core**
```javascript
// ✅ ĐÚNG - Code chung đặt trong src/core/
src/core/
├── utils/          # Helper functions
├── constants/      # Constants
├── middlewares/    # Middleware chung
└── libs/          # External libraries
```

### **3. Commit thường xuyên**
```bash
# Commit mỗi khi hoàn thành 1 tính năng nhỏ
git add .
git commit -m "feat(devices): add device create form"
git push origin feature/devices/member-a-ui
```

### **4. Tạo Pull Request**
- Tạo PR từ nhánh con vào nhánh feature
- Review code trước khi merge
- Đảm bảo không có conflict

## 🚨 Xử lý conflict

Khi có conflict:

```bash
# 1. Pull latest changes
git checkout feature/devices
git pull origin feature/devices

# 2. Merge vào nhánh con
git checkout feature/devices/member-a-ui
git merge feature/devices

# 3. Resolve conflict trong file
# 4. Add file đã resolve
git add <file>

# 5. Commit
git commit -m "resolve: fix merge conflict"

# 6. Push
git push origin feature/devices/member-a-ui
```

## 📊 Theo dõi tiến độ

### **Checklist cho mỗi member:**

- [ ] Đã setup môi trường (Node.js, npm, .env)
- [ ] Đã clone project và cài dependencies
- [ ] Đã checkout đúng nhánh của mình
- [ ] Đã hiểu cấu trúc thư mục làm việc
- [ ] Đã commit và push code đầu tiên
- [ ] Đã tạo Pull Request

### **Checklist cho Team Lead:**

- [ ] Đã tạo tất cả nhánh feature
- [ ] Đã tạo nhánh con cho từng member
- [ ] Đã hướng dẫn member setup môi trường
- [ ] Đã review code của member
- [ ] Đã merge nhánh con vào feature

## 🎉 Kết quả mong đợi

- Mỗi member làm việc độc lập trên nhánh riêng
- Code được review trước khi merge
- Lịch sử commit rõ ràng, dễ theo dõi
- Có thể rollback dễ dàng nếu cần
- Team có thể làm việc song song mà không conflict

---

**Chúc team làm việc hiệu quả! 🚀**
