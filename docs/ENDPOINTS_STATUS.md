# BÁO CÁO TRẠNG THÁI ENDPOINTS

## ✅ ĐÃ CÓ

### 1. **Auth** (`/auth`) - Đăng nhập/Đăng xuất/Đổi mật khẩu
- ✅ `GET /auth/login` - Trang đăng nhập
- ✅ `POST /auth/login` - Xử lý đăng nhập
- ✅ `GET /auth/logout` - Đăng xuất
- ✅ `GET /auth/change-password` - Trang đổi mật khẩu
- ✅ `POST /auth/change-password` - Xử lý đổi mật khẩu
- ❌ `GET /auth/password/forgot` - Quên mật khẩu (CHƯA CÓ)

### 2. **Borrow** (`/borrow`) - Giáo viên bộ môn
- ✅ `GET /borrow/teacher-home` - Trang chủ giáo viên
- ✅ `GET /borrow/register` - Đăng ký mượn
- ✅ `POST /borrow/register` - Xử lý đăng ký mượn
- ✅ `GET /borrow/pending-approvals` - Xem chờ duyệt
- ✅ `GET /borrow/history` - Lịch sử mượn/trả
- ✅ `GET /borrow/status` - Tình trạng phiếu mượn
- ✅ `GET /borrow/slip/:id` - Xem chi tiết phiếu mượn
- ❌ `POST /borrow/:id/cancel` - Hủy phiếu (CHƯA CÓ)

### 3. **Borrow Manager** (`/borrow/manager/*`) - QLTB
- ✅ `GET /borrow/manager/manager-home` - Trang chủ QLTB
- ✅ `GET /borrow/manager/approvals` - Danh sách phiếu mượn chờ duyệt
- ✅ `GET /borrow/manager/return-slips` - Danh sách phiếu trả
- ✅ `GET /borrow/manager/borrow/:id` - Chi tiết phiếu mượn
- ✅ `GET /borrow/manager/return/:id` - Chi tiết phiếu trả
- ✅ `POST /borrow/manager/api/borrow/approve/:id` - Duyệt phiếu mượn
- ✅ `POST /borrow/manager/api/borrow/reject/:id` - Từ chối phiếu mượn
- ✅ `POST /borrow/manager/api/return/approve/:id` - Duyệt phiếu trả
- ✅ `POST /borrow/manager/api/return/reject/:id` - Từ chối phiếu trả

### 4. **Acceptance** (`/acceptance`) - QLTB
- ✅ `GET /acceptance` - Danh sách biên bản nghiệm thu
- ✅ `GET /acceptance/edit/:id` - Sửa biên bản
- ✅ `GET /acceptance/delete/:id` - Xóa biên bản
- ❌ `GET /acceptance/:id` - Xem chi tiết (CHƯA CÓ - chỉ có edit và delete)

### 5. **Periodic Reports** (`/periodic-reports`) - QLTB
- ✅ `GET /periodic-reports` - Danh sách báo cáo
- ✅ `GET /periodic-reports/create` - Tạo báo cáo
- ✅ `GET /periodic-reports/:id` - Chi tiết báo cáo
- ✅ `POST /periodic-reports` - Tạo báo cáo mới
- ✅ `POST /periodic-reports/:id` - Cập nhật báo cáo
- ✅ `POST /periodic-reports/:id/delete` - Xóa báo cáo
- ✅ `GET /periodic-reports/:id/download` - Tải file báo cáo

### 6. **Disposal** (`/disposal`) - QLTB
- ✅ `GET /disposal` - Danh sách báo cáo thanh lý
- ✅ `GET /disposal/add` - Thêm báo cáo
- ✅ `GET /disposal/add-devices` - Thêm thiết bị vào báo cáo
- ✅ `GET /disposal/edit/:id` - Sửa báo cáo
- ✅ `GET /disposal/view/:id` - Xem chi tiết báo cáo
- ❌ `POST /disposal` - Tạo báo cáo (CHƯA CÓ)
- ❌ `POST /disposal/:id` - Cập nhật báo cáo (CHƯA CÓ)
- ❌ `POST /disposal/:id/delete` - Xóa báo cáo (CHƯA CÓ)
- ❌ `GET /disposal/search` - Tìm kiếm (CHƯA CÓ)

### 7. **Suppliers** (`/suppliers`) - QLTB
- ✅ `GET /suppliers` - Danh sách nhà cung cấp
- ✅ `GET /suppliers/add` - Thêm nhà cung cấp
- ✅ `GET /suppliers/edit/:id` - Sửa nhà cung cấp
- ❌ `POST /suppliers` - Tạo nhà cung cấp (CHƯA CÓ)
- ❌ `POST /suppliers/:id` - Cập nhật nhà cung cấp (CHƯA CÓ)
- ❌ `POST /suppliers/:id/delete` - Xóa nhà cung cấp (CHƯA CÓ)
- ❌ `GET /suppliers/search` - Tìm kiếm (CHƯA CÓ)

### 8. **Categories** (`/categories`) - QLTB
- ✅ `GET /categories` - Danh sách danh mục
- ✅ `GET /categories/add` - Thêm danh mục
- ✅ `GET /categories/edit/:id` - Sửa danh mục
- ❌ `POST /categories` - Tạo danh mục (CHƯA CÓ)
- ❌ `POST /categories/:id` - Cập nhật danh mục (CHƯA CÓ)
- ❌ `POST /categories/:id/delete` - Xóa danh mục (CHƯA CÓ)
- ❌ `GET /categories/search` - Tìm kiếm (CHƯA CÓ)

## ❌ CHƯA CÓ / CHƯA HOÀN THIỆN

### 1. **Devices** (`/devices`) - QLTB
- ❌ `GET /devices` - Danh sách thiết bị (FILE ROUTES TRỐNG)
- ❌ `GET /devices/create` - Thêm thiết bị
- ❌ `GET /devices/:id` - Xem chi tiết thiết bị
- ❌ `GET /devices/edit/:id` - Sửa thiết bị
- ❌ `POST /devices` - Tạo thiết bị
- ❌ `POST /devices/:id` - Cập nhật thiết bị
- ❌ `POST /devices/:id/delete` - Xóa thiết bị
- ❌ `GET /devices/search` - Tìm kiếm

### 2. **Device Stats** (`/device-stats`) - Tổ trưởng chuyên môn
- ❌ `GET /device-stats` - Tổng quan thống kê (FILE ROUTES TRỐNG)
- ❌ `GET /device-stats/by-category` - Thống kê theo danh mục
- ❌ `GET /device-stats/by-status` - Thống kê theo tình trạng
- ❌ `GET /device-stats/by-supplier` - Thống kê theo nhà cung cấp

### 3. **Reports** (`/reports`) - Tổ trưởng chuyên môn
- ❌ `GET /reports/device-stats` - Báo cáo thống kê thiết bị hỏng (CẦN KIỂM TRA)

## 📋 TÓM TẮT

### Đã hoàn thiện:
- ✅ Auth (thiếu forgot password)
- ✅ Borrow (giáo viên) - thiếu cancel
- ✅ Borrow Manager (QLTB) - đầy đủ
- ✅ Periodic Reports - đầy đủ

### Cần hoàn thiện:
- ⚠️ Acceptance - thiếu xem chi tiết
- ⚠️ Disposal - thiếu POST routes và search
- ⚠️ Suppliers - thiếu POST routes và search
- ⚠️ Categories - thiếu POST routes và search

### Chưa làm:
- ❌ Devices - cần làm toàn bộ
- ❌ Device Stats - cần làm toàn bộ

