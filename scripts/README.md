# 📝 Hướng dẫn Test Feature Borrow

## 🚀 Cách chạy scripts

### **Bước 1: Đảm bảo MongoDB đang chạy**

```bash
# Kiểm tra MongoDB có đang chạy không
mongosh --eval "db.version()"

# Hoặc nếu dùng Docker
npm run db:up
```

### **Bước 2: Seed data (Thêm dữ liệu test)**

```bash
# Chạy script seed data
node scripts/seed-data.js
```

**Script này sẽ tạo:**
- ✅ 3 users (giáo viên và admin)
- ✅ 4 categories (Hóa học, Vật lý, Tin học, Ngữ văn)
- ✅ 6 devices (thiết bị mẫu)
- ✅ 2 borrow tickets (phiếu mượn mẫu)
- ✅ 3 borrow details (chi tiết mượn)
- ✅ Counters (cho sequence generation)

**Thông tin đăng nhập test:**
- Email: `teacher1@school.edu.vn`
- Password: `123456`
- User ID sẽ được hiển thị sau khi chạy script

### **Bước 3: Lấy thông tin data test**

```bash
# Xem tất cả data đã seed
node scripts/get-test-data.js
```

**Script này sẽ hiển thị:**
- 👤 Danh sách users với IDs
- 📁 Danh sách categories
- 🔧 Danh sách devices
- 📋 Danh sách borrow tickets
- 📝 Danh sách borrow details
- 💡 Thông tin để test (User IDs, Device IDs, etc.)

## 🧪 Test Feature Borrow

### **1. Test API Endpoints**

Sau khi seed data, bạn có thể test các API:

```bash
# Lấy danh sách thiết bị
curl http://localhost:3000/borrow/api/devices

# Lấy phiếu mượn chờ duyệt (cần user ID hợp lệ)
curl http://localhost:3000/borrow/api/pending-approvals

# Lấy lịch sử mượn/trả
curl http://localhost:3000/borrow/api/history
```

### **2. Test với User ID**

Sau khi chạy `get-test-data.js`, bạn sẽ có User ID. Sử dụng ID này để:

**Option 1: Mock user trong controller**
```javascript
// Trong borrow.controller.js, tạm thời hardcode user ID
const userId = "PASTE_USER_ID_HERE" || req.user?.id || null;
```

**Option 2: Sử dụng middleware auth**
- Đảm bảo middleware auth set `req.user.id` với ObjectId hợp lệ

### **3. Test qua Browser**

1. Khởi động server:
   ```bash
   npm run dev
   ```

2. Truy cập các trang:
   - `/borrow/register` - Đăng ký mượn thiết bị
   - `/borrow/history` - Lịch sử mượn/trả
   - `/borrow/pending-approvals` - Phiếu chờ duyệt
   - `/borrow/status` - Tình trạng phiếu mượn

## 🔄 Reset Data

Nếu muốn reset và seed lại data:

```bash
# Chạy lại seed script (sẽ xóa data cũ và tạo mới)
node scripts/seed-data.js
```

## 📊 Cấu trúc Data Test

### **Users:**
- `NV001` - Nguyễn Văn A (giao_vien)
- `NV002` - Trần Thị B (giao_vien)  
- `NV003` - Lê Văn C (ql_thiet_bi)

### **Categories:**
- `DM001` - Hóa học
- `DM002` - Vật lý
- `DM003` - Tin học
- `DM004` - Ngữ văn

### **Devices:**
- `TB001` - Ống nghiệm thủy tinh (50 cái)
- `TB002` - Bình cầu đun nước (20 cái)
- `TB003` - Máy tính để bàn (30 cái)
- `TB004` - Máy chiếu projector (15 cái)
- `TB005` - Nam châm điện (25 cái)
- `TB006` - Sách giáo khoa lớp 6 (100 cuốn)

### **Borrow Tickets:**
- `PM0001` - Nguyễn Văn A mượn thiết bị hóa học
- `PM0002` - Trần Thị B mượn máy tính

## ⚠️ Lưu ý

1. **MongoDB Connection**: Đảm bảo MongoDB đang chạy và connection string trong `.env` đúng
2. **User ID**: Phải là ObjectId hợp lệ (24 ký tự hex), không phải số
3. **Password Hash**: Script sử dụng bcryptjs để hash password
4. **Counters**: Script sẽ tạo counters để sequence generation hoạt động

## 🐛 Troubleshooting

### **Lỗi: "Cannot find module 'bcryptjs'"**
```bash
npm install bcryptjs
```

### **Lỗi: "MongoDB connection failed"**
- Kiểm tra MongoDB có đang chạy không
- Kiểm tra `MONGODB_URI` trong file `.env`

### **Lỗi: "Cast to ObjectId failed"**
- Đảm bảo User ID là ObjectId hợp lệ (24 ký tự hex)
- Chạy `get-test-data.js` để lấy User ID đúng

### **Data không hiển thị**
- Kiểm tra xem data đã được seed chưa: `node scripts/get-test-data.js`
- Kiểm tra User ID trong request có đúng không

