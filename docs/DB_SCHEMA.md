# Database Schema Overview

Tài liệu này mô tả các collection MongoDB và vị trí model tương ứng trong `src/features/**/models`.

## Devices
- File: `src/features/devices/models/device.model.js`
- Collection: `devices`
- Trường chính:
  - `maTB` (String, unique) — mã thiết bị (auto generate: TB001...)
  - `tenTB` (String)
  - `nguonGoc` (String)
  - `soLuong` (Number)
  - `tinhTrangThietBi` (String) — trạng thái tổng quát (available/borrowed/broken/...)
  - `viTriLuuTru` (String)
  - `ngayNhap` (Date)
  - `hinhAnh` (String)
  - `huongDanSuDung` (String)
  - `maDM` (String) — mã danh mục
  - `category` (ObjectId → Category)

## Categories
- File: `src/features/categories/models/category.model.js`
- Collection: `categories`
- Trường chính:
  - `maDM` (String, unique)
  - `tenDM` (String)
  - `viTriLuuTru` (String)

## Disposal
- File: `src/features/disposal/models/disposal-report.model.js`
- Collections:
  - `disposaltickets` (phiếu thanh lý)
    - `maThanhLy` (String, unique)
    - `soLuong` (Number)
    - `tinhTrangDuyet` (String)
    - `mucDoHong` (String)
    - `duongDanFile` (String)
  - `disposalreports` (báo cáo thanh lý)
    - `maBaoCao` (String, unique)
    - `namHoc` (String)
    - `ngayLapBaoCao` (Date)
    - `trangThai` (String)
    - `tenFile` (String)
    - `duongDanFile` (String)
  - `disposaldetails` (chi tiết thanh lý)
    - `maThanhLy` (String, index)
    - `maTB` (String)
    - `lyDo` (String)
    - `mucDoHong` (String)
    - `giaBan` (Number)
    - `ngayBan` (Date)

## Device Stats (Thống kê thiết bị)
- File: `src/features/device-stats/models/device-stats.model.js`
- Collection: `devicestats`
- Ý nghĩa: Tổng hợp theo danh mục (`category`/`maDM`), tình trạng (`status`), nhà cung cấp (`supplier`).
- Trường chính:
  - `category` (ObjectId → Category)
  - `maDM` (String)
  - `supplier` (ObjectId → Supplier)
  - `status` (String)
  - `totalDevices` (Number)
  - `available` (Number)
  - `borrowed` (Number)
  - `broken` (Number)
  - `disposed` (Number)
- Index: `{ category, maDM, supplier, status }`

## Reports
- File: `src/features/reports/models/report.model.js`
- Collection: `reports`
- Ý nghĩa: Lưu snapshot kết quả báo cáo, ví dụ `damaged-summary` (thiết bị hỏng/thanh lý theo thời gian).
- Trường chính:
  - `type` (Enum: `damaged-summary`, `custom`)
  - `fromDate` / `toDate` (Date)
  - `filters`:
    - `category` (ObjectId → Category)
    - `supplier` (ObjectId → Supplier)
    - `status` (String)
  - `summary`:
    - `totalDamaged` (Number)
    - `totalDisposed` (Number)
    - `byCategory` (Object)
    - `byStatus` (Object)
  - `sources.disposalReports` ([ObjectId] → DisposalReport)

## Borrow (Mượn/Trả thiết bị)
- File: `src/features/borrow/models/borrow-ticket.model.js`
- Collections:
  - `borrowtickets` (phiếu mượn)
    - `maPhieu` (String, unique)
    - `ngayMuon`, `ngayDuKienTra` (Date)
    - `lyDo` (String), `trangThai` (String)
    - `nguoiLapPhieuId` (ObjectId → User)
  - `borrowdetails` (chi tiết mượn)
    - `maPhieu` (String, index), `maTB` (String), `soLuongMuon` (Number), ...
  - `returnslips` (phiếu trả)
    - `maPhieuTra` (String, unique), `maPhieuMuon` (String, index), `nguoiTraId` (ObjectId → User), ...
  - `returndetails` (chi tiết trả)
    - `maPhieuTra` (String, index), `maTB` (String), `soLuongTra` (Number), ...

## Purchasing Plans (Kế hoạch mua sắm)
- File: `src/features/purchasing-plans/models/purchasing-plan.model.js`
- Collections:
  - `purchasingplans`
    - `maKeHoachMuaSam` (String, unique), `namHoc`, `trangThai`, `tenFile`, `duongDanFile`
  - `purchasingplandetails`
    - `maKeHoachMuaSam` (String, index), `maTB` (String), `soLuongDuKienMua` (Number), ...

## Training Plans (Kế hoạch đào tạo)
- File: `src/features/training-plans/models/training-plan.model.js`
- Collection: `trainingplans`
- Trường chính: `maKeHoachDaoTao` (unique), `namHoc`, `ngayLap`, `tenFile`, `duongDanFile`

## Periodic Reports (Bình kỳ)
- File: `src/features/periodic-reports/models/periodic-report.model.js`
- Collection: `periodicreports`
- Trường chính: `maBaoCao` (unique), `kyBaoCao`, `ngayLap`, `trangThaiBaoCao`, `tenFile`, `duongDanFile`

## Suppliers (Nhà cung cấp)
- File: `src/features/suppliers/models/supplier.model.js`
- Collection: `suppliers`
- Trường chính: `maNCC` (unique), `tenNCC`, `diaChi`, `soDienThoai`, `email`, `loaiTBCC`, `trangThai`

## Acceptance (Nghiệm thu)
- File: `src/features/acceptance/models/acceptance.model.js`
- Collections:
  - `acceptanceminutes`
    - `maBienBan` (unique), `namHoc`, `trangThaiNghiemThu`, `ngayLap`, `tenBienBan`, `duongDanFile`
  - `acceptancedetails`
    - `maBienBan` (index), `maTB`, `soLuongThucTe`, `chatLuong`, `lyDo`

## Users/Auth
- File chính: `src/features/users/models/user.model.js` (được re-export tại `src/features/auth/models/user.model.js`)
- Collection: `users`
- Trường chính: `maNV` (unique), `hoTen`, `email` (unique), `soDienThoai`, `diaChi`, `chucVu`, `role`, `matKhauHash`, `trangThai`

## Profile
- File: `src/features/profile/models/profile.model.js`
- Collection: `profiles`
- Trường chính: `userId` (ObjectId → User, unique), `avatarUrl`, `ngaySinh`, `gioiTinh`, `noiCongTac`, `ghiChu`

## Notes
- Mã tự sinh: một số model dùng helper `getNextCode` để phát sinh code (VD: `maTB`, `maThanhLy`, `maBaoCao`).
- Tham chiếu:
  - `Device.category` → `Category`
  - `DeviceStats.category` → `Category`
  - `Report.sources.disposalReports` → `DisposalReport`
  - `Borrow*`.`nguoiLapPhieuId`/`nguoiTraId` → `User`
  - `Profile.userId` → `User`
- Triển khai thật có thể bổ sung `Category`, `Supplier`, và các model khác trong những feature tương ứng.


