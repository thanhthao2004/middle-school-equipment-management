# Tổng hợp Routes theo Actor

Tài liệu này tổng hợp tất cả các routes trong hệ thống, được phân loại theo từng actor (người dùng).

---

##  AUTHENTICATION & PROFILE (Tất cả users)

### Authentication
- `GET /auth/login` - Trang đăng nhập
- `POST /auth/login` - Xử lý đăng nhập
- `GET /auth/logout` - Đăng xuất
- `GET /auth/password/change` - Form đổi mật khẩu
- `POST /auth/password/change` - Xử lý đổi mật khẩu
- `GET /auth/password/forgot` - Form quên mật khẩu
- `POST /auth/password/forgot` - Xử lý quên mật khẩu
- `GET /auth/change-password` - Form đổi mật khẩu (Legacy)
- `POST /auth/change-password` - Xử lý đổi mật khẩu (Legacy)

### Profile
- `GET /profile` - Xem thông tin cá nhân
- `POST /profile` - Cập nhật thông tin cá nhân
- `GET /profile/password/change` - Form đổi mật khẩu cá nhân
- `POST /profile/password/change` - Xử lý đổi mật khẩu cá nhân

---

##  ADMIN (Quản trị viên)

**Prefix:** `/admin`

### Quản lý người dùng
- `GET /admin` - Danh sách người dùng
- `GET /admin/create` - Form tạo tài khoản mới
- `POST /admin/create` - Xử lý tạo tài khoản

---

##  MANAGER - Nhân viên quản lý thiết bị (QLTB)

**Prefix:** `/manager`

### Trang chủ
- `GET /manager` - Trang chủ QLTB
- `GET /manager/manager-home` - Trang chủ QLTB (Legacy)

### Duyệt mượn/trả
- `GET /manager/approvals` - Danh sách phiếu mượn chờ duyệt
- `GET /manager/borrow/:id` - Chi tiết phiếu mượn
- `GET /manager/return-slips` - Danh sách phiếu trả
- `GET /manager/return/:id` - Chi tiết phiếu trả

### Quản lý thiết bị
- `GET /manager/devices` - Danh sách thiết bị
- `GET /manager/devices/create` - Tạo thiết bị mới
- `GET /manager/devices/detail/:id` - Chi tiết thiết bị
- `GET /manager/devices/edit/:id` - Sửa thiết bị
- `GET /manager/devices/delete/:id` - Xóa thiết bị
- `POST /manager/devices/create` - Xử lý tạo thiết bị
- `POST /manager/devices/update/:id` - Xử lý cập nhật thiết bị
- `POST /manager/devices/delete/:id` - Xử lý xóa thiết bị

### Danh mục thiết bị
- `GET /manager/categories` - Danh sách danh mục 
- `GET /manager/categories/add` - Form thêm danh mục 
- `GET /manager/categories/edit/:id` - Form sửa danh mục 
- `POST /manager/categories` - Xử lý tạo danh mục (đã sửa form action)
- `POST /manager/categories/:id` - Xử lý cập nhật danh mục  (đã sửa form action)
- `POST /manager/categories/:id/delete` - Xử lý xóa danh mục (cần thêm route handler)

### Nhà cung cấp
- `GET /manager/suppliers` - Danh sách nhà cung cấp 
- `GET /manager/suppliers/add` - Form thêm nhà cung cấp 
- `GET /manager/suppliers/edit/:id` - Form sửa nhà cung cấp 
- `POST /manager/suppliers` - Xử lý tạo nhà cung cấp  (đã sửa form action)
- `POST /manager/suppliers/:id` - Xử lý cập nhật nhà cung cấp  (đã sửa form action)
- `POST /manager/suppliers/:id/delete` - Xử lý xóa nhà cung cấp (đã sửa form action và JS)

### Thống kê thiết bị
- `GET /manager/device-stats` - Thống kê thiết bị

### Biên bản nghiệm thu
**Lưu ý:** Biên bản nghiệm thu có model riêng, lưu trữ theo từng đợt/năm
- `GET /manager/acceptance` - Danh sách biên bản nghiệm thu 
- `GET /manager/acceptance/detail/:id` - Chi tiết biên bản nghiệm thu 
- `GET /manager/acceptance/edit/:id` - Form sửa biên bản nghiệm thu 
- `GET /manager/acceptance/delete/:id` - Form xác nhận xóa biên bản 
- `POST /manager/acceptance/edit/:id` - Xử lý cập nhật biên bản nghiệm thu
- `POST /manager/acceptance/delete/:id` - Xử lý xóa biên bản nghiệm thu

### Báo cáo định kỳ
**Lưu ý:** Báo cáo định kỳ có model riêng, lưu trữ theo từng năm/đợt
- `GET /manager/periodic-reports` - Danh sách báo cáo định kỳ 
- `GET /manager/periodic-reports/create` - Form tạo báo cáo định kỳ 
- `GET /manager/periodic-reports/:id` - Chi tiết báo cáo định kỳ 
- `GET /manager/periodic-reports/:id/download` - Tải file báo cáo 
- `POST /manager/periodic-reports` - Xử lý tạo báo cáo định kỳ  (đã sửa form action)
- `POST /manager/periodic-reports/:id` - Xử lý cập nhật báo cáo  (đã sửa form action)
- `POST /manager/periodic-reports/:id/delete` - Xử lý xóa báo cáo  (đã sửa form action)

### Báo cáo thanh lý
**Lưu ý:** Báo cáo thanh lý có model riêng, lưu trữ theo từng năm/đợt
- `GET /manager/disposal` - Danh sách báo cáo thanh lý 
- `GET /manager/disposal/add` - Form tạo báo cáo thanh lý 
- `GET /manager/disposal/create` - Form tạo báo cáo thanh lý (alias cho /add)
- `GET /manager/disposal/add-devices` - Thêm thiết bị vào báo cáo 
- `GET /manager/disposal/edit/:id` - Form sửa báo cáo thanh lý 
- `GET /manager/disposal/view/:id` - Xem chi tiết báo cáo 
- `POST /manager/disposal` - Xử lý tạo báo cáo thanh lý
- `POST /manager/disposal/:id` - Xử lý cập nhật báo cáo
- `POST /manager/disposal/:id/delete` - Xử lý xóa báo cáo

### Manager APIs
- `GET /manager/api/borrow/pending` - Lấy danh sách phiếu mượn chờ duyệt
- `GET /manager/api/return/pending` - Lấy danh sách phiếu trả chờ duyệt
- `POST /manager/api/borrow/approve/:id` - Duyệt phiếu mượn
- `POST /manager/api/borrow/reject/:id` - Từ chối phiếu mượn
- `POST /manager/api/return/approve/:id` - Duyệt phiếu trả
- `POST /manager/api/return/reject/:id` - Từ chối phiếu trả

---

##  TEACHER - Giáo viên bộ môn

**Prefix:** `/teacher/borrow`

### Trang chủ
- `GET /teacher` - Redirect đến `/teacher/borrow/teacher-home`
- `GET /teacher/borrow/teacher-home` - Trang chủ giáo viên

### Đăng ký mượn thiết bị
- `GET /teacher/borrow` - Form đăng ký mượn
- `GET /teacher/borrow/register` - Form đăng ký mượn (Legacy)
- `POST /teacher/borrow` - Xử lý đăng ký mượn
- `POST /teacher/borrow/register` - Xử lý đăng ký mượn (Legacy)

### Xem tình trạng
- `GET /teacher/borrow/pending` - Danh sách phiếu chờ duyệt
- `GET /teacher/borrow/pending-approvals` - Danh sách phiếu chờ duyệt (Legacy)

### Lịch sử mượn/trả
- `GET /teacher/borrow/history` - Lịch sử mượn/trả

### Chi tiết phiếu
- `GET /teacher/borrow/:id` - Chi tiết phiếu mượn
- `GET /teacher/borrow/slip/:id` - Chi tiết phiếu mượn (Legacy)
- `GET /teacher/borrow/return/:id` - Chi tiết phiếu trả

### Hủy phiếu mượn
- `POST /teacher/borrow/:id/cancel` - Hủy phiếu mượn

### Teacher APIs
- `GET /teacher/borrow/api/devices` - Lấy danh sách thiết bị
- `GET /teacher/borrow/api/history` - Lấy lịch sử mượn/trả
- `GET /teacher/borrow/api/pending` - Lấy danh sách phiếu chờ duyệt
- `GET /teacher/borrow/api/pending-approvals` - Lấy danh sách phiếu chờ duyệt (Legacy)
- `POST /teacher/borrow/api/cancel/:id` - Hủy phiếu mượn (API)

---

##  DEPARTMENT HEAD - Tổ trưởng chuyên môn

**Lưu ý:** Tổ trưởng chuyên môn sử dụng **TẤT CẢ** routes của Teacher + thêm các routes sau:

**Prefix:** `/teacher` (cùng prefix với Teacher)

### Báo cáo
- `GET /teacher/reports` - Redirect đến `/teacher/reports/damaged-summary`
- `GET /teacher/reports/device-stats` - Báo cáo thiết bị hỏng
- `GET /teacher/reports/damaged-summary` - Tóm tắt thiết bị hỏng
- `GET /teacher/reports/damaged-summary/export` - Xuất CSV báo cáo

### Kế hoạch đào tạo
- `GET /teacher/training-plans` - Danh sách kế hoạch đào tạo
- `GET /teacher/training-plans/report` - Báo cáo kế hoạch đào tạo
- `GET /teacher/training-plans/:id` - Chi tiết kế hoạch đào tạo

### Kế hoạch mua sắm
- `GET /teacher/purchasing-plans` - Danh sách kế hoạch mua sắm
- `GET /teacher/purchasing-plans/create` - Tạo kế hoạch mua sắm
- `POST /teacher/purchasing-plans` - Xử lý tạo kế hoạch
- `GET /teacher/purchasing-plans/:id` - Chi tiết kế hoạch mua sắm (read-only)
- `GET /teacher/purchasing-plans/:id/edit` - Sửa kế hoạch mua sắm
- `PUT /teacher/purchasing-plans/:id` - Cập nhật kế hoạch
- `DELETE /teacher/purchasing-plans/:id` - Xóa kế hoạch

---

##  PRINCIPAL - Hiệu trưởng

**Prefix:** `/principal`

### Trang chủ
- `GET /principal` - Trang chủ hiệu trưởng

### Kế hoạch đào tạo
- `GET /principal/training-plans` - Xem tất cả kế hoạch đào tạo
- `GET /principal/training-plans/:id` - Chi tiết kế hoạch đào tạo

### Duyệt kế hoạch mua sắm
- `GET /principal/purchasing-plans` - Danh sách kế hoạch (có thể filter theo status)
- `GET /principal/purchasing-plans/approve` - Danh sách kế hoạch cần duyệt
- `GET /principal/purchasing-plans/:id` - Chi tiết kế hoạch (read-only)
- `GET /principal/purchasing-plans/:id/approve` - Chi tiết kế hoạch cần duyệt
- `POST /principal/purchasing-plans/:id/approve` - Xử lý duyệt kế hoạch

### Duyệt báo cáo thanh lý
- `GET /principal/disposal` - Danh sách báo cáo thanh lý (có thể filter theo status)
- `GET /principal/disposal/approve` - Danh sách báo cáo thanh lý cần duyệt
- `GET /principal/disposal/view/:id` - Xem chi tiết báo cáo thanh lý
- `POST /principal/disposal/approve/:id` - Xử lý duyệt báo cáo thanh lý

---

##  ROOT ROUTES

- `GET /` - Redirect đến `/teacher/borrow/teacher-home` (mặc định)

---

##  Tóm tắt Routes theo Actor

| Actor | Prefix | Số lượng Routes chính |
|-------|--------|----------------------|
| **Admin** | `/admin` | 3 routes |
| **Manager (QLTB)** | `/manager` | ~40+ routes |
| **Teacher** | `/teacher/borrow` | 12 routes |
| **Department Head** | `/teacher` | 18+ routes (bao gồm Teacher routes) |
| **Principal** | `/principal` | 10+ routes |

---

## Ghi chú bổ sung

### Routes được chia sẻ giữa các Actor

1. **Training Plans**: 
   - Tổ trưởng và Hiệu trưởng đều có thể xem, nhưng route khác nhau:
   - Tổ trưởng: `/teacher/training-plans/*`
   - Hiệu trưởng: `/principal/training-plans/*`

2. **Purchasing Plans**:
   - Tổ trưởng: `/teacher/purchasing-plans/*` (CRUD)
   - Hiệu trưởng: `/principal/purchasing-plans/*` (Duyệt)

3. **Disposal**:
   - Manager: `/manager/disposal/*` (CRUD)
   - Hiệu trưởng: `/principal/disposal/*` (Duyệt)

### Legacy Routes

Một số routes có thêm version "Legacy" để tương thích ngược:
- `/teacher/borrow/register` (Legacy cho `/teacher/borrow`)
- `/teacher/borrow/pending-approvals` (Legacy cho `/teacher/borrow/pending`)
- `/teacher/borrow/slip/:id` (Legacy cho `/teacher/borrow/:id`)
- `/auth/change-password` (Legacy cho `/auth/password/change`)

### API Routes

Các API routes thường được prefix với `/api`:
- Teacher APIs: `/teacher/borrow/api/*`
- Manager APIs: `/manager/api/*`
