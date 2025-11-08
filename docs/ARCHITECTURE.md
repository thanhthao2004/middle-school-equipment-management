#  TÀI LIỆU KIẾN TRÚC VÀ MODELS - HỆ THỐNG QUẢN LÝ THIẾT BỊ TRƯỜNG THCS

##  Mục lục
1. [Tổng quan về kiến trúc](#tổng-quan-về-kiến-trúc)
2. [Models (Mô hình dữ liệu)](#models-mô-hình-dữ-liệu)
3. [Core (Các thành phần cốt lõi)](#core-các-thành-phần-cốt-lõi)
4. [Config (Cấu hình)](#config-cấu-hình)
5. [Views (Giao diện)](#views-giao-diện)
6. [app.js (File khởi tạo ứng dụng)](#appjs-file-khởi-tạo-ứng-dụng)

---

## 🏗️ Tổng quan về kiến trúc

Project này được xây dựng theo kiến trúc **Feature-Based Architecture** với Express.js và MongoDB, sử dụng EJS làm view engine.

### Cấu trúc thư mục:
```
src/
├── config/          # Cấu hình hệ thống
├── core/            # Thành phần cốt lõi (shared)
├── features/        # Các tính năng theo module
└── views/           # Layout và partials chung

app.js               # Entry point của ứng dụng
```

---

##  MODELS (Mô hình dữ liệu)

Models định nghĩa cấu trúc dữ liệu trong MongoDB sử dụng Mongoose. Mỗi model tương ứng với một collection trong database.

### 1. **User Model** (`src/features/users/models/user.model.js`)
**Mục đích**: Quản lý thông tin người dùng (Nhân viên) trong hệ thống.

**Schema:**
- `maNV` (String, unique): Mã nhân viên tự động tạo (NV001, NV002, ...)
- `hoTen` (String): Họ và tên
- `email` (String, unique): Email đăng nhập
- `soDienThoai` (String): Số điện thoại
- `diaChi` (String): Địa chỉ
- `chucVu` (String): Chức vụ
- `role` (String): Vai trò trong hệ thống
  - `admin`: Quản trị viên
  - `giao_vien`: Giáo viên
  - `to_truong`: Tổ trưởng
  - `ql_thiet_bi`: Quản lý thiết bị
  - `hieu_truong`: Hiệu trưởng
- `matKhauHash` (String): Mật khẩu đã được hash
- `trangThai` (String): Trạng thái tài khoản (active/inactive)

**Đặc điểm:**
- Tự động tạo mã nhân viên bằng `getNextCode('NV', 3)` khi tạo mới
- Index trên `maNV` và `email` để tìm kiếm nhanh

---

### 2. **Device Model** (`src/features/devices/models/device.model.js`)
**Mục đích**: Quản lý thông tin thiết bị trong trường.

**Schema:**
- `maTB` (String, unique): Mã thiết bị tự động (TB001, TB002, ...)
- `tenTB` (String): Tên thiết bị
- `nguonGoc` (String): Nguồn gốc (ví dụ: "Mua mới", "Tặng", ...)
- `soLuong` (Number): Số lượng thiết bị
- `tinhTrangThietBi` (String): Tình trạng (ví dụ: "Tốt", "Hỏng", "Đang sử dụng", ...)
- `viTriLuuTru` (String): Vị trí lưu trữ
- `ngayNhap` (Date): Ngày nhập vào hệ thống
- `hinhAnh` (String): Đường dẫn hình ảnh
- `huongDanSuDung` (String): Hướng dẫn sử dụng
- `maDM` (String): Mã danh mục (string reference)
- `category` (ObjectId): Tham chiếu đến Category model

**Đặc điểm:**
- Tự động tạo mã thiết bị bằng `getNextCode('TB', 3)`
- Có quan hệ với Category model

---

### 3. **Category Model** (`src/features/categories/models/category.model.js`)
**Mục đích**: Quản lý danh mục phân loại thiết bị.

**Schema:**
- `maDM` (String, unique): Mã danh mục tự động (DM001, DM002, ...)
- `tenDM` (String): Tên danh mục (ví dụ: "Máy tính", "Bàn ghế", ...)
- `viTriLuuTru` (String): Vị trí lưu trữ mặc định cho danh mục này

**Đặc điểm:**
- Tự động tạo mã danh mục bằng `getNextCode('DM', 3)`

---

### 4. **BorrowTicket Model** (`src/features/borrow/models/borrow-ticket.model.js`)
**Mục đích**: Quản lý phiếu mượn thiết bị.

**Models liên quan:**
- **BorrowTicket**: Phiếu mượn chính
  - `maPhieu` (String, unique): Mã phiếu tự động (PM0001, PM0002, ...)
  - `ngayMuon` (Date): Ngày mượn
  - `ngayDuKienTra` (Date): Ngày dự kiến trả
  - `lyDo` (String): Lý do mượn
  - `nguoiLapPhieuId` (ObjectId): ID người lập phiếu (tham chiếu User)
  - `trangThai` (String): Trạng thái phiếu
    - `dang_muon`: Đang mượn
    - `da_hoan_tat`: Đã hoàn tất (trả đủ)
    - `huy`: Đã hủy
  - `ghiChu` (String): Ghi chú

- **BorrowDetail**: Chi tiết thiết bị mượn trong phiếu
  - `maPhieu` (String): Mã phiếu mượn (tham chiếu BorrowTicket)
  - `maTB` (String): Mã thiết bị
  - `soLuongMuon` (Number): Số lượng mượn
  - `ngayTraDuKien` (Date): Ngày trả dự kiến
  - `tinhTrangLucMuon` (String): Tình trạng khi mượn
  - `soLuongDaTra` (Number): Tổng số lượng đã trả (cộng dồn)
  - `ghiChu` (String): Ghi chú

- **ReturnSlip**: Phiếu trả thiết bị (có thể trả nhiều lần)
  - `maPhieuTra` (String, unique): Mã phiếu trả tự động (PT0001, PT0002, ...)
  - `maPhieuMuon` (String): Mã phiếu mượn (tham chiếu BorrowTicket)
  - `ngayTra` (Date): Ngày trả
  - `nguoiTraId` (ObjectId): ID người trả (tham chiếu User)
  - `ghiChu` (String): Ghi chú

- **ReturnDetail**: Chi tiết thiết bị trả trong phiếu trả
  - `maPhieuTra` (String): Mã phiếu trả (tham chiếu ReturnSlip)
  - `maTB` (String): Mã thiết bị
  - `soLuongTra` (Number): Số lượng trả
  - `tinhTrangLucTra` (String): Tình trạng khi trả
  - `ghiChu` (String): Ghi chú

**Đặc điểm:**
- Hỗ trợ trả thiết bị nhiều lần (partial return)
- Tự động tạo mã phiếu mượn (`PM`) và phiếu trả (`PT`)

---

### 5. **Acceptance Model** (`src/features/acceptance/models/acceptance.model.js`)
**Mục đích**: Quản lý biên bản nghiệm thu thiết bị.

**Models liên quan:**
- **AcceptanceMinutes**: Biên bản nghiệm thu
  - `maBienBan` (String, unique): Mã biên bản tự động (NT001, NT002, ...)
  - `namHoc` (String): Năm học
  - `trangThaiNghiemThu` (String): Trạng thái nghiệm thu
  - `ngayLap` (Date): Ngày lập biên bản
  - `tenBienBan` (String): Tên biên bản
  - `duongDanFile` (String): Đường dẫn file đính kèm

- **AcceptanceDetail**: Chi tiết nghiệm thu thiết bị
  - `maBienBan` (String): Mã biên bản (tham chiếu AcceptanceMinutes)
  - `maTB` (String): Mã thiết bị
  - `soLuongThucTe` (Number): Số lượng thực tế
  - `chatLuong` (String): Chất lượng
  - `lyDo` (String): Lý do (nếu có vấn đề)

**Đặc điểm:**
- Tự động tạo mã biên bản bằng `getNextCode('NT', 3)`

---

### 6. **Disposal Model** (`src/features/disposal/models/disposal-report.model.js`)
**Mục đích**: Quản lý thanh lý thiết bị.

**Models liên quan:**
- **DisposalTicket**: Phiếu thanh lý
  - `maThanhLy` (String, unique): Mã thanh lý tự động (TL001, TL002, ...)
  - `soLuong` (Number): Số lượng thiết bị thanh lý
  - `tinhTrangDuyet` (String): Tình trạng duyệt
  - `mucDoHong` (String): Mức độ hỏng
  - `duongDanFile` (String): Đường dẫn file đính kèm

- **DisposalReport**: Báo cáo thanh lý
  - `maBaoCao` (String, unique): Mã báo cáo tự động (TLBC001, TLBC002, ...)
  - `namHoc` (String): Năm học
  - `ngayLapBaoCao` (Date): Ngày lập báo cáo
  - `trangThai` (String): Trạng thái báo cáo
  - `tenFile` (String): Tên file
  - `duongDanFile` (String): Đường dẫn file

- **DisposalDetail**: Chi tiết thanh lý
  - `maThanhLy` (String): Mã thanh lý (tham chiếu DisposalTicket)
  - `maTB` (String): Mã thiết bị
  - `lyDo` (String): Lý do thanh lý
  - `mucDoHong` (String): Mức độ hỏng
  - `giaBan` (Number): Giá bán (nếu có)
  - `ngayBan` (Date): Ngày bán

**Đặc điểm:**
- Tự động tạo mã thanh lý (`TL`) và mã báo cáo thanh lý (`TLBC`)

---

### 7. **PurchasingPlan Model** (`src/features/purchasing-plans/models/purchasing-plan.model.js`)
**Mục đích**: Quản lý kế hoạch mua sắm thiết bị.

**Models liên quan:**
- **PurchasingPlan**: Kế hoạch mua sắm
  - `maKeHoachMuaSam` (String, unique): Mã kế hoạch tự động (KH001, KH002, ...)
  - `namHoc` (String): Năm học
  - `trangThai` (String): Trạng thái kế hoạch
  - `tenFile` (String): Tên file
  - `duongDanFile` (String): Đường dẫn file

- **PurchasingPlanDetail**: Chi tiết kế hoạch mua sắm
  - `maKeHoachMuaSam` (String): Mã kế hoạch (tham chiếu PurchasingPlan)
  - `maTB` (String): Mã thiết bị
  - `soLuongDuKienMua` (Number): Số lượng dự kiến mua
  - `donViTinh` (String): Đơn vị tính
  - `thoiGianDuKienMua` (Date): Thời gian dự kiến mua
  - `duToanKinhPhi` (Number): Dự toán kinh phí
  - `lyDoMua` (String): Lý do mua

**Đặc điểm:**
- Tự động tạo mã kế hoạch bằng `getNextCode('KH', 3)`

---

### 8. **TrainingPlan Model** (`src/features/training-plans/models/training-plan.model.js`)
**Mục đích**: Quản lý kế hoạch đào tạo.

**Schema:**
- `maKeHoachDaoTao` (String, unique): Mã kế hoạch tự động (DT001, DT002, ...)
- `namHoc` (String): Năm học
- `ngayLap` (Date): Ngày lập kế hoạch
- `tenFile` (String): Tên file
- `duongDanFile` (String): Đường dẫn file

**Đặc điểm:**
- Tự động tạo mã kế hoạch bằng `getNextCode('DT', 3)`

---

### 9. **PeriodicReport Model** (`src/features/periodic-reports/models/periodic-report.model.js`)
**Mục đích**: Quản lý báo cáo tình trạng thiết bị định kỳ.

**Schema:**
- `maBaoCao` (String, unique): Mã báo cáo tự động (BC001, BC002, ...)
- `kyBaoCao` (String): Kỳ báo cáo (ví dụ: "Học kỳ 1", "Học kỳ 2", ...)
- `ngayLap` (Date): Ngày lập báo cáo
- `trangThaiBaoCao` (String): Trạng thái báo cáo
- `tenFile` (String): Tên file
- `duongDanFile` (String): Đường dẫn file

**Đặc điểm:**
- Tự động tạo mã báo cáo bằng `getNextCode('BC', 3)`

---

### 10. **Report Model** (`src/features/reports/models/report.model.js`)
**Mục đích**: Quản lý các báo cáo tổng hợp (damaged-summary, custom reports).

**Schema:**
- `type` (String, enum): Loại báo cáo
  - `damaged-summary`: Tổng hợp thiết bị hỏng
  - `custom`: Báo cáo tùy chỉnh
- `fromDate` (Date): Ngày bắt đầu
- `toDate` (Date): Ngày kết thúc
- `filters` (Object): Bộ lọc
  - `category` (ObjectId): Lọc theo danh mục
  - `supplier` (ObjectId): Lọc theo nhà cung cấp
  - `status` (String): Lọc theo trạng thái
- `summary` (Object): Kết quả tổng hợp
  - `totalDamaged` (Number): Tổng số thiết bị hỏng
  - `totalDisposed` (Number): Tổng số thiết bị đã thanh lý
  - `byCategory` (Object): Thống kê theo danh mục
  - `byStatus` (Object): Thống kê theo trạng thái
- `sources` (Object): Tham chiếu tài liệu phát sinh
  - `disposalReports` (Array<ObjectId>): Danh sách báo cáo thanh lý liên quan
- `generatedAt` (Date): Thời gian tạo báo cáo
- `meta` (Object): Metadata bổ sung

**Đặc điểm:**
- Lưu trữ kết quả tổng hợp để không cần tính lại mỗi lần xem

---

### 11. **Supplier Model** (`src/features/suppliers/models/supplier.model.js`)
**Mục đích**: Quản lý thông tin nhà cung cấp thiết bị.

**Schema:**
- `maNCC` (String, unique): Mã nhà cung cấp tự động (NCC001, NCC002, ...)
- `tenNCC` (String): Tên nhà cung cấp
- `diaChi` (String): Địa chỉ
- `soDienThoai` (String): Số điện thoại
- `email` (String): Email
- `loaiTBCC` (String): Loại thiết bị cung cấp
- `trangThai` (String): Trạng thái (ví dụ: "Hoạt động", "Ngừng hoạt động")

**Đặc điểm:**
- Tự động tạo mã nhà cung cấp bằng `getNextCode('NCC', 3)`

---

### 12. **DeviceStats Model** (`src/features/device-stats/models/device-stats.model.js`)
**Mục đích**: Thống kê thiết bị theo danh mục/tình trạng/nhà cung cấp.

**Schema:**
- `category` (ObjectId): Tham chiếu Category (có thể null nếu là toàn cục)
- `maDM` (String): Mã danh mục (string reference)
- `supplier` (ObjectId): Tham chiếu Supplier (có thể null)
- `status` (String): Tình trạng thiết bị
- `totalDevices` (Number): Tổng số thiết bị
- `available` (Number): Số lượng có sẵn
- `borrowed` (Number): Số lượng đang mượn
- `broken` (Number): Số lượng hỏng
- `disposed` (Number): Số lượng đã thanh lý

**Đặc điểm:**
- Index trên các trường để truy vấn nhanh
- Dùng để cache thống kê, không cần tính lại mỗi lần

---

### 13. **Profile Model** (`src/features/profile/models/profile.model.js`)
**Mục đích**: Quản lý thông tin chi tiết (profile) của người dùng.

**Schema:**
- `userId` (ObjectId, unique): Tham chiếu User (1-1 relationship)
- `avatarUrl` (String): Đường dẫn avatar
- `ngaySinh` (Date): Ngày sinh
- `gioiTinh` (String): Giới tính
- `noiCongTac` (String): Nơi công tác
- `ghiChu` (String): Ghi chú

**Đặc điểm:**
- Quan hệ 1-1 với User model

---

## 🔧 CORE (Các thành phần cốt lõi)

Thư mục `src/core/` chứa các thành phần dùng chung cho toàn bộ ứng dụng.

### 1. **Constants** (`src/core/constants/`)

#### **error-codes.js**
**Mục đích**: Định nghĩa mã lỗi và thông báo lỗi chuẩn hóa.

**Export:**
- `ERROR_CODES`: Object chứa các mã lỗi
  - General: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `INTERNAL_ERROR`
  - Auth: `AUTH_INVALID_CREDENTIALS`, `AUTH_TOKEN_EXPIRED`, `AUTH_TOKEN_INVALID`, `AUTH_REQUIRED`
  - User: `USER_NOT_FOUND`, `USER_ALREADY_EXISTS`, `USER_EMAIL_EXISTS`
  - Device: `DEVICE_NOT_FOUND`, `DEVICE_INSUFFICIENT_QUANTITY`, `DEVICE_ALREADY_EXISTS`
  - Borrow: `BORROW_TICKET_NOT_FOUND`, `BORROW_INVALID_STATUS`, `BORROW_ALREADY_RETURNED`
  - Category: `CATEGORY_NOT_FOUND`, `CATEGORY_ALREADY_EXISTS`, `CATEGORY_IN_USE`
- `ERROR_MESSAGES`: Object map mã lỗi với thông báo tiếng Việt
- `getErrorMessage(code, defaultMessage)`: Hàm lấy thông báo lỗi theo mã

**Cách dùng:**
```javascript
const { ERROR_CODES, getErrorMessage } = require('../core/constants/error-codes');
sendError(res, getErrorMessage(ERROR_CODES.NOT_FOUND), 404);
```

#### **roles.js** (File trống - cần implement)
**Mục đích**: Định nghĩa các vai trò trong hệ thống.

**Cần implement:**
```javascript
const ROLES = {
  ADMIN: 'admin',
  GIAO_VIEN: 'giao_vien',
  TO_TRUONG: 'to_truong',
  QL_THIET_BI: 'ql_thiet_bi',
  HIEU_TRUONG: 'hieu_truong',
};
```

#### **permissions.js** (File trống - cần implement)
**Mục đích**: Định nghĩa các quyền trong hệ thống.

**Cần implement:**
```javascript
const PERMISSIONS = {
  DEVICE_CREATE: 'device:create',
  DEVICE_UPDATE: 'device:update',
  DEVICE_DELETE: 'device:delete',
  // ...
};
```

---

### 2. **Libs** (`src/core/libs/`)

#### **sequence.js**
**Mục đích**: Tạo mã tự động tăng (auto-increment code) cho các models.

**Export:**
- `getNextCode(prefix, width = 3)`: Tạo mã tiếp theo
  - `prefix`: Tiền tố (ví dụ: "NV", "TB", "PM")
  - `width`: Độ rộng số (ví dụ: 3 → "001", "002")

**Cách hoạt động:**
- Sử dụng Counter collection trong MongoDB
- Mỗi prefix có một counter riêng
- Tự động tăng và format với leading zeros

**Ví dụ:**
```javascript
const { getNextCode } = require('../../../core/libs/sequence');
const maNV = await getNextCode('NV', 3); // "NV001", "NV002", ...
```

---

### 3. **Middlewares** (`src/core/middlewares/`)

#### **auth.middleware.js**
**Mục đích**: Xác thực người dùng và kiểm tra quyền truy cập.

**Export:**
- `authenticate(req, res, next)`: Middleware xác thực người dùng
  - **TODO**: Cần implement logic kiểm tra session/JWT token
  - Hiện tại: Bỏ qua kiểm tra (skip auth)
- `requireRole(...allowedRoles)`: Middleware kiểm tra vai trò
  - **TODO**: Cần implement logic kiểm tra role từ `req.user`
- `requirePermission(permission)`: Middleware kiểm tra quyền
  - **TODO**: Cần implement logic kiểm tra permission

**Cách dùng:**
```javascript
const { authenticate, requireRole } = require('../core/middlewares/auth.middleware');

router.get('/protected', authenticate, requireRole('admin'), controller.action);
```

---

#### **error.middleware.js**
**Mục đích**: Xử lý lỗi tập trung cho toàn bộ ứng dụng.

**Export:**
- `errorHandler(err, req, res, next)`: Middleware xử lý lỗi
  - Xử lý Mongoose validation errors
  - Xử lý duplicate key errors (11000)
  - Xử lý cast errors (invalid ObjectId)
  - Xử lý custom errors với statusCode
  - Default: 500 Internal Server Error
- `notFoundHandler(req, res)`: Middleware xử lý route không tìm thấy (404)

**Cách dùng:**
```javascript
const { errorHandler, notFoundHandler } = require('./src/core/middlewares/error.middleware');

app.use(notFoundHandler); // Phải đặt sau tất cả routes
app.use(errorHandler);    // Phải đặt cuối cùng
```

---

#### **validation.middleware.js**
**Mục đích**: Xác thực dữ liệu đầu vào sử dụng Joi/express-validator.

**Export:**
- `validate(schema)`: Middleware validate request body
  - Sử dụng Joi schema
  - Trả về lỗi nếu validation fail
- `validateQuery(schema)`: Middleware validate request query
- `validateParams(schema)`: Middleware validate request params

**Cách dùng:**
```javascript
const { validate } = require('../core/middlewares/validation.middleware');
const Joi = require('joi');

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

router.post('/login', validate(schema), controller.login);
```

---

### 4. **Utils** (`src/core/utils/`)

#### **response.js**
**Mục đích**: Chuẩn hóa format response cho API.

**Export:**
- `sendSuccess(res, data, message, statusCode)`: Gửi response thành công
  - Format: `{ success: true, message, data }`
- `sendError(res, message, statusCode, errors)`: Gửi response lỗi
  - Format: `{ success: false, message, errors }`
- `sendPaginated(res, data, pagination, message)`: Gửi response có phân trang
  - Format: `{ success: true, message, data, pagination }`

**Cách dùng:**
```javascript
const { sendSuccess, sendError } = require('../core/utils/response');

sendSuccess(res, user, 'Lấy thông tin thành công', 200);
sendError(res, 'Không tìm thấy', 404);
```

---

#### **pagination.js**
**Mục đích**: Hỗ trợ phân trang cho các API.

**Export:**
- `getPaginationParams(req, defaultLimit, maxLimit)`: Lấy tham số phân trang từ request
  - Trả về: `{ page, limit, skip }`
  - Mặc định: `defaultLimit = 10`, `maxLimit = 100`
- `getPaginationMeta(total, page, limit)`: Tạo metadata phân trang
  - Trả về: `{ currentPage, totalPages, totalItems, itemsPerPage, hasNextPage, hasPrevPage }`

**Cách dùng:**
```javascript
const { getPaginationParams, getPaginationMeta } = require('../core/utils/pagination');

const { page, limit, skip } = getPaginationParams(req, 10, 100);
const devices = await Device.find().skip(skip).limit(limit);
const total = await Device.countDocuments();
const pagination = getPaginationMeta(total, page, limit);

sendPaginated(res, devices, pagination);
```

---

#### **date.js**
**Mục đích**: Hỗ trợ xử lý ngày tháng.

**Export:**
- `formatDate(date, format)`: Format ngày tháng
  - Format mặc định: `'DD/MM/YYYY'`
  - Hỗ trợ: `DD`, `MM`, `YYYY`, `HH`, `mm`, `ss`
- `isValidDate(date)`: Kiểm tra ngày hợp lệ
- `addDays(date, days)`: Thêm số ngày vào ngày
- `isPast(date)`: Kiểm tra ngày đã qua
- `isFuture(date)`: Kiểm tra ngày tương lai

**Cách dùng:**
```javascript
const { formatDate, addDays } = require('../core/utils/date');

const formatted = formatDate(new Date(), 'DD/MM/YYYY HH:mm'); // "25/12/2024 14:30"
const futureDate = addDays(new Date(), 7); // 7 ngày sau
```

---

##  CONFIG (Cấu hình)

Thư mục `src/config/` chứa các file cấu hình hệ thống.

### 1. **env.js** (`src/config/env.js`)
**Mục đích**: Load và quản lý biến môi trường từ file `.env`.

**Export:**
- `config`: Object chứa cấu hình
  - `port`: Port server (mặc định: 3000)
  - `nodeEnv`: Môi trường (development/production)
  - `mongodb.uri`: MongoDB connection string
  - `mongodb.dbName`: Tên database
  - `jwt.secret`: Secret key cho JWT
  - `jwt.expiresIn`: Thời gian hết hạn JWT
  - `session.secret`: Secret key cho session
  - `upload.maxFileSize`: Kích thước file tối đa (mặc định: 5MB)
  - `upload.allowedTypes`: Các loại file được phép
  - `upload.uploadDir`: Thư mục lưu file upload

**Cách dùng:**
```javascript
const config = require('./src/config/env');
app.listen(config.port);
```

---

### 2. **db.js** (`src/config/db.js`)
**Mục đích**: Kết nối MongoDB và quản lý connection.

**Export:**
- `connectMongo()`: Hàm kết nối MongoDB
  - Sử dụng connection pooling
  - Tự động reconnect khi mất kết nối
  - Log sự kiện: connected, error, disconnected

**Cách dùng:**
```javascript
const { connectMongo } = require('./src/config/db');
await connectMongo();
```

**Lưu ý:**
- File `config/db.js` ở root là file cũ, nên sử dụng `src/config/db.js`

---

### 3. **logger.js** (`src/config/logger.js`)
**Mục đích**: Logger đơn giản cho ứng dụng.

**Export:**
- `logger`: Object chứa các hàm log
  - `logger.error(...args)`: Log lỗi
  - `logger.warn(...args)`: Log cảnh báo
  - `logger.info(...args)`: Log thông tin
  - `logger.debug(...args)`: Log debug (chỉ trong development)

**Cách hoạt động:**
- Production: Chỉ log error, warn, info
- Development: Log tất cả (bao gồm debug)

**Cách dùng:**
```javascript
const logger = require('./src/config/logger');
logger.info('Server đang chạy tại port 3000');
logger.error('Lỗi kết nối database:', err);
```

---

##  VIEWS (Giao diện)

Thư mục `src/views/` chứa các layout và partials chung cho EJS templates.

### 1. **Layouts** (`src/views/layouts/`)

#### **main.ejs**
**Mục đích**: Layout chính cho các trang không có sidebar.

**Cấu trúc:**
- Header (include từ `partials/header`)
- Main content (biến `body`)
- Footer (include từ `partials/footer`)
- Bootstrap 5.3.0 CSS/JS
- Font Awesome 6.4.0
- Custom CSS từ `/public/stylesheets/style.css`
- Hỗ trợ `additionalCSS` và `additionalJS` cho từng trang

**Cách dùng:**
```javascript
res.render('feature/view', {
  layout: 'main',
  title: 'Tiêu đề trang',
  body: 'Nội dung trang',
  additionalCSS: '<link ...>',
  additionalJS: '<script ...>',
});
```

---

#### **with-sidebar.ejs**
**Mục đích**: Layout có sidebar cho các trang quản lý.

**Cấu trúc:**
- Sidebar (include từ `partials/borrow-sidebar` hoặc `partials/sidebar`)
- Main content area (9-10 cột)
- Page header (tùy chọn)
- Hỗ trợ `sidebarType` để chọn loại sidebar

**Cách dùng:**
```javascript
res.render('feature/view', {
  layout: 'with-sidebar',
  sidebarType: 'borrow-sidebar', // hoặc 'sidebar'
  currentPage: 'register',
  body: 'Nội dung trang',
});
```

---

### 2. **Partials** (`src/views/partials/`)

#### **header.ejs**
**Mục đích**: Header navigation chung cho toàn bộ ứng dụng.

**Nội dung:**
- Logo và tên hệ thống
- Navigation menu:
  - Trang chủ
  - Mượn/Trả (dropdown)
    - Đăng ký mượn
    - Lịch sử mượn
    - Tình trạng phiếu
- User menu (dropdown)
  - Thông tin cá nhân
  - Cài đặt
  - Đăng xuất

**Biến hỗ trợ:**
- `currentPage`: Trang hiện tại (để highlight menu)

---

#### **footer.ejs**
**Mục đích**: Footer chung cho toàn bộ ứng dụng.

**Nội dung:**
- Thông tin hệ thống
- Links chức năng
- Thông tin liên hệ
- Links hỗ trợ
- Copyright

---

#### **sidebar.ejs**
**Mục đích**: Sidebar cho trang quản lý (không phải borrow).

**Menu items:**
- Xem báo cáo thống kê thiết bị hỏng
- Xem kế hoạch đào tạo
- Quản lý kế hoạch mua sắm

**Biến hỗ trợ:**
- `active`: Menu item đang active

---

#### **borrow-sidebar.ejs**
**Mục đích**: Sidebar cho feature mượn/trả thiết bị.

**Menu items:**
- Trang chủ giáo viên
- Đăng ký mượn thiết bị
- Xem lịch sử mượn/trả
- Xem tình trạng phiếu mượn

**Biến hỗ trợ:**
- `currentPage`: Trang hiện tại (để highlight menu)

---

##  APP.JS (File khởi tạo ứng dụng)

**Mục đích**: Entry point của ứng dụng, khởi tạo Express server và cấu hình middleware.

### Cấu trúc:

#### 1. **Import dependencies**
```javascript
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const config = require('./src/config/env');
const logger = require('./src/config/logger');
const { errorHandler, notFoundHandler } = require('./src/core/middlewares/error.middleware');
```

#### 2. **Cấu hình View Engine**
- Engine: EJS
- Views directory: `src/features` (mỗi feature có thư mục views riêng)

#### 3. **Middleware & Static Files**
- `bodyParser.urlencoded`: Parse form data
- `bodyParser.json`: Parse JSON
- Static files:
  - `/css`: Bootstrap CSS
  - `/js`: Bootstrap JS
  - `/public`: Public assets (CSS, JS, images)

#### 4. **Kết nối MongoDB**
- Gọi `connectMongo()` để kết nối database
- Xử lý lỗi nếu kết nối thất bại

#### 5. **Routes**
- `/purchasing-plans`: Routes cho kế hoạch mua sắm
- `/borrow`: Routes cho mượn/trả thiết bị
- `/categories`: Routes cho danh mục

**Lưu ý:** Các routes khác cần được thêm vào đây khi implement.

#### 6. **Error Handling**
- `notFoundHandler`: Xử lý 404 (phải đặt sau tất cả routes)
- `errorHandler`: Xử lý lỗi (phải đặt cuối cùng)

#### 7. **Khởi động Server**
- Listen trên port từ config
- Log thông tin server và environment

---

##  GHI CHÚ QUAN TRỌNG

### 1. **Auto-generated Codes**
Tất cả models sử dụng `getNextCode()` để tạo mã tự động:
- `NV` → Mã nhân viên (NV001, NV002, ...)
- `TB` → Mã thiết bị (TB001, TB002, ...)
- `DM` → Mã danh mục (DM001, DM002, ...)
- `PM` → Mã phiếu mượn (PM0001, PM0002, ...)
- `PT` → Mã phiếu trả (PT0001, PT0002, ...)
- `NT` → Mã biên bản nghiệm thu (NT001, NT002, ...)
- `TL` → Mã thanh lý (TL001, TL002, ...)
- `TLBC` → Mã báo cáo thanh lý (TLBC001, TLBC002, ...)
- `KH` → Mã kế hoạch mua sắm (KH001, KH002, ...)
- `DT` → Mã kế hoạch đào tạo (DT001, DT002, ...)
- `BC` → Mã báo cáo định kỳ (BC001, BC002, ...)
- `NCC` → Mã nhà cung cấp (NCC001, NCC002, ...)

### 2. **Timestamps**
Tất cả models sử dụng `{ timestamps: true }` để tự động thêm:
- `createdAt`: Ngày tạo
- `updatedAt`: Ngày cập nhật

### 3. **Relationships**
- `User` ↔ `Profile`: 1-1
- `User` ↔ `BorrowTicket`: 1-N (người lập phiếu)
- `Category` ↔ `Device`: 1-N
- `Device` ↔ `BorrowDetail`: 1-N
- `BorrowTicket` ↔ `BorrowDetail`: 1-N
- `BorrowTicket` ↔ `ReturnSlip`: 1-N
- `ReturnSlip` ↔ `ReturnDetail`: 1-N

### 4. **TODO Items**
- **auth.middleware.js**: Cần implement logic xác thực thực tế (JWT/session)
- **roles.js**: Cần định nghĩa các vai trò
- **permissions.js**: Cần định nghĩa các quyền
- **app.js**: Cần thêm các routes còn lại (devices, users, reports, ...)

### 5. **Best Practices**
- Sử dụng `sendSuccess`, `sendError`, `sendPaginated` cho response chuẩn
- Sử dụng `validate` middleware cho validation
- Sử dụng `ERROR_CODES` cho xử lý lỗi chuẩn
- Sử dụng `logger` thay vì `console.log`
- Sử dụng `getNextCode` cho auto-generated codes
- Sử dụng `timestamps: true` cho models

---

##  TÀI LIỆU THAM KHẢO

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [EJS Documentation](https://ejs.co/)
- [Bootstrap 5.3 Documentation](https://getbootstrap.com/docs/5.3/)

