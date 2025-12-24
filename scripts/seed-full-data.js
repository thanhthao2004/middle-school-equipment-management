/**
 * Seed Full Data Script
 * Tạo dữ liệu đầy đủ để test toàn bộ chức năng của hệ thống
 * 
 * Usage: node scripts/seed-full-data.js
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const config = require('../src/config/env');

// Import models
const User = require('../src/features/users/models/user.model');
const Category = require('../src/features/categories/models/category.model');
const Supplier = require('../src/features/suppliers/models/supplier.model');
const Device = require('../src/features/devices/models/device.model');
const DeviceUnit = require('../src/features/devices/models/device-unit.model');
const { BorrowTicket, BorrowDetail } = require('../src/features/borrow/models/borrow-ticket.model');
const { AcceptanceMinutes, AcceptanceDetail } = require('../src/features/acceptance/models/acceptance.model');
const DisposalReport = require('../src/features/disposal/models/disposal-report.model');
const { PurchasingPlan } = require('../src/features/purchasing-plans/models/purchasing-plan.model');
const TrainingPlan = require('../src/features/training-plans/models/training-plan.model');
const PeriodicReport = require('../src/features/periodic-reports/models/periodic-report.model');

const authService = require('../src/features/auth/services/auth.service');

// ==========================
// DATA DEFINITIONS
// ==========================

const USERS = [
    // Admin
    {
        maNV: 'ADM001',
        hoTen: 'Nguyễn Văn Admin',
        username: 'admin',
        email: 'admin@school.edu.vn',
        role: 'admin',
        chucVu: 'Quản trị viên hệ thống',
        password: 'Admin@123',
        soDienThoai: '0901234567',
        diaChi: '123 Đường ABC, Quận 1, TP.HCM',
        boMon: 'CNTT',
        trinhDo: 'Thạc sĩ'
    },
    // Quản lý thiết bị
    {
        maNV: 'QLTB001',
        hoTen: 'Trần Thị Quản Lý',
        username: 'qltb01',
        email: 'qltb01@school.edu.vn',
        role: 'ql_thiet_bi',
        chucVu: 'Quản lý thiết bị',
        password: 'Qltb@123',
        soDienThoai: '0901234568',
        diaChi: '456 Đường XYZ, Quận 2, TP.HCM',
        boMon: 'Quản lý',
        trinhDo: 'Đại học'
    },
    {
        maNV: 'QLTB002',
        hoTen: 'Lê Văn Quản',
        username: 'qltb02',
        email: 'qltb02@school.edu.vn',
        role: 'ql_thiet_bi',
        chucVu: 'Phó quản lý thiết bị',
        password: 'Qltb@123',
        soDienThoai: '0901234569',
        diaChi: '789 Đường DEF, Quận 3, TP.HCM'
    },
    // Giáo viên
    {
        maNV: 'GV001',
        hoTen: 'Phạm Thị Giáo',
        username: 'gv01',
        email: 'gv01@school.edu.vn',
        role: 'giao_vien',
        chucVu: 'Giáo viên Vật lý',
        password: 'Teacher@123',
        soDienThoai: '0901234570',
        diaChi: '321 Đường GHI, Quận 4, TP.HCM',
        boMon: 'Vật lý',
        trinhDo: 'Đại học'
    },
    {
        maNV: 'GV002',
        hoTen: 'Hoàng Văn Dạy',
        username: 'gv02',
        email: 'gv02@school.edu.vn',
        role: 'giao_vien',
        chucVu: 'Giáo viên Hóa học',
        password: 'Teacher@123',
        soDienThoai: '0901234571',
        diaChi: '654 Đường JKL, Quận 5, TP.HCM',
        boMon: 'Hóa học',
        trinhDo: 'Đại học'
    },
    {
        maNV: 'GV003',
        hoTen: 'Võ Thị Sinh',
        username: 'gv03',
        email: 'gv03@school.edu.vn',
        role: 'giao_vien',
        chucVu: 'Giáo viên Sinh học',
        password: 'Teacher@123',
        soDienThoai: '0901234572',
        diaChi: '987 Đường MNO, Quận 6, TP.HCM',
        boMon: 'Sinh học',
        trinhDo: 'Đại học'
    },
    // Tổ trưởng
    {
        maNV: 'TT001',
        hoTen: 'Đặng Văn Trưởng',
        username: 'tt01',
        email: 'tt01@school.edu.vn',
        role: 'to_truong',
        chucVu: 'Tổ trưởng Tự nhiên',
        password: 'Head@123',
        soDienThoai: '0901234573',
        diaChi: '147 Đường PQR, Quận 7, TP.HCM',
        boMon: 'Tự nhiên',
        trinhDo: 'Thạc sĩ'
    },
    // Hiệu trưởng
    {
        maNV: 'HT001',
        hoTen: 'Bùi Thị Hiệu',
        username: 'ht01',
        email: 'ht01@school.edu.vn',
        role: 'hieu_truong',
        chucVu: 'Hiệu trưởng',
        password: 'Principal@123',
        soDienThoai: '0901234574',
        diaChi: '258 Đường STU, Quận 8, TP.HCM',
        boMon: 'Quản lý',
        trinhDo: 'Tiến sĩ'
    }
];

const CATEGORIES = [
    { name: 'Máy tính và Thiết bị CNTT', location: 'Phòng máy tính' },
    { name: 'Thiết bị Vật lý', location: 'Phòng thí nghiệm Vật lý' },
    { name: 'Thiết bị Hóa học', location: 'Phòng thí nghiệm Hóa học' },
    { name: 'Thiết bị Sinh học', location: 'Phòng thí nghiệm Sinh học' },
    { name: 'Thiết bị Địa lý', location: 'Phòng Địa lý' },
    { name: 'Thiết bị Thể dục', location: 'Sân thể dục' },
    { name: 'Bàn ghế', location: 'Kho bàn ghế' },
    { name: 'Thiết bị Âm nhạc', location: 'Phòng Âm nhạc' },
    { name: 'Thiết bị Mỹ thuật', location: 'Phòng Mỹ thuật' },
    { name: 'Thiết bị Khác', location: 'Kho chung' }
];

const SUPPLIERS = [
    {
        name: 'Công ty Công nghệ Giáo dục ABC',
        address: '123 Đường Công nghệ, Quận 1, TP.HCM',
        phone: '0281234567',
        email: 'contact@abc-edu.vn',
        type: 'Máy tính và Thiết bị CNTT',
        status: 'Hoạt động',
        contractDate: new Date('2023-01-15')
    },
    {
        name: 'Công ty Thiết bị Thí nghiệm XYZ',
        address: '456 Đường Khoa học, Quận 2, TP.HCM',
        phone: '0282345678',
        email: 'info@xyz-lab.vn',
        type: 'Thiết bị Vật lý, Hóa học, Sinh học',
        status: 'Hoạt động',
        contractDate: new Date('2023-02-20')
    },
    {
        name: 'Công ty Nội thất Giáo dục DEF',
        address: '789 Đường Nội thất, Quận 3, TP.HCM',
        phone: '0283456789',
        email: 'sales@def-furniture.vn',
        type: 'Bàn ghế',
        status: 'Hoạt động',
        contractDate: new Date('2023-03-10')
    },
    {
        name: 'Công ty Thể thao GHI',
        address: '321 Đường Thể thao, Quận 4, TP.HCM',
        phone: '0284567890',
        email: 'contact@ghi-sport.vn',
        type: 'Thiết bị Thể dục',
        status: 'Hoạt động',
        contractDate: new Date('2023-04-05')
    },
    {
        name: 'Công ty Nhạc cụ JKL',
        address: '654 Đường Nghệ thuật, Quận 5, TP.HCM',
        phone: '0285678901',
        email: 'info@jkl-music.vn',
        type: 'Thiết bị Âm nhạc, Mỹ thuật',
        status: 'Hoạt động',
        contractDate: new Date('2023-05-12')
    }
];

// Helper function để tạo devices
function createDevices(categories) {
    const devices = [];
    
    // Máy tính và CNTT
    const itCategory = categories.find(c => c.name.includes('Máy tính'));
    if (itCategory) {
        devices.push({
            tenTB: 'Laptop Dell Latitude 3520',
            nguonGoc: 'Mua mới',
            soLuong: 5,
            giaThanh: 15000000,
            tinhTrangThietBi: 'Tốt',
            viTriLuuTru: 'Phòng máy tính',
            ngayNhap: new Date('2024-01-15'),
            hinhAnh: [],
            huongDanSuDung: 'Sử dụng cho giảng dạy tin học. Khởi động máy, đăng nhập Windows, sử dụng các phần mềm giáo dục.',
            category: itCategory._id,
            maDM: itCategory.id,
            lop: ['6', '7', '8', '9']
        });
        
        devices.push({
            tenTB: 'Máy chiếu Epson EB-X41',
            nguonGoc: 'Mua mới',
            soLuong: 8,
            giaThanh: 8000000,
            tinhTrangThietBi: 'Tốt',
            viTriLuuTru: 'Kho thiết bị',
            ngayNhap: new Date('2024-02-20'),
            hinhAnh: [],
            huongDanSuDung: 'Kết nối với laptop qua cổng VGA hoặc HDMI. Bật nguồn, chờ khởi động, điều chỉnh focus.',
            category: itCategory._id,
            maDM: itCategory.id,
            lop: ['6', '7', '8', '9']
        });
    }
    
    // Thiết bị Vật lý
    const physicsCategory = categories.find(c => c.name.includes('Vật lý'));
    if (physicsCategory) {
        devices.push({
            tenTB: 'Nam châm điện',
            nguonGoc: 'Mua mới',
            soLuong: 10,
            giaThanh: 500000,
            tinhTrangThietBi: 'Tốt',
            viTriLuuTru: 'Phòng thí nghiệm Vật lý',
            ngayNhap: new Date('2024-01-10'),
            hinhAnh: [],
            huongDanSuDung: 'Kết nối với nguồn điện, điều chỉnh dòng điện để thay đổi từ trường. Sử dụng trong thí nghiệm từ học.',
            category: physicsCategory._id,
            maDM: physicsCategory.id,
            lop: ['8', '9']
        });
        
        devices.push({
            tenTB: 'Máy phát điện xoay chiều',
            nguonGoc: 'Mua mới',
            soLuong: 5,
            giaThanh: 2000000,
            tinhTrangThietBi: 'Tốt',
            viTriLuuTru: 'Phòng thí nghiệm Vật lý',
            ngayNhap: new Date('2024-02-15'),
            hinhAnh: [],
            huongDanSuDung: 'Quay tay quay để tạo dòng điện xoay chiều. Kết nối với bóng đèn để quan sát hiện tượng.',
            category: physicsCategory._id,
            maDM: physicsCategory.id,
            lop: ['9']
        });
        
        devices.push({
            tenTB: 'Bộ dụng cụ đo điện',
            nguonGoc: 'Mua mới',
            soLuong: 15,
            giaThanh: 300000,
            tinhTrangThietBi: 'Khá',
            viTriLuuTru: 'Phòng thí nghiệm Vật lý',
            ngayNhap: new Date('2023-12-20'),
            hinhAnh: [],
            huongDanSuDung: 'Bao gồm vôn kế, ampe kế, đồng hồ đa năng. Sử dụng để đo hiệu điện thế và cường độ dòng điện.',
            category: physicsCategory._id,
            maDM: physicsCategory.id,
            lop: ['7', '8', '9']
        });
    }
    
    // Thiết bị Hóa học
    const chemistryCategory = categories.find(c => c.name.includes('Hóa học'));
    if (chemistryCategory) {
        devices.push({
            tenTB: 'Bộ dụng cụ thí nghiệm H2SO4',
            nguonGoc: 'Mua mới',
            soLuong: 12,
            giaThanh: 800000,
            tinhTrangThietBi: 'Tốt',
            viTriLuuTru: 'Phòng thí nghiệm Hóa học',
            ngayNhap: new Date('2024-01-25'),
            hinhAnh: [],
            huongDanSuDung: 'Cẩn thận khi sử dụng axit H2SO4. Đeo găng tay và kính bảo hộ. Pha loãng axit đậm đặc bằng cách đổ từ từ vào nước.',
            category: chemistryCategory._id,
            maDM: chemistryCategory.id,
            lop: ['8', '9']
        });
        
        devices.push({
            tenTB: 'Bình tam giác 250ml',
            nguonGoc: 'Mua mới',
            soLuong: 30,
            giaThanh: 50000,
            tinhTrangThietBi: 'Tốt',
            viTriLuuTru: 'Phòng thí nghiệm Hóa học',
            ngayNhap: new Date('2024-02-10'),
            hinhAnh: [],
            huongDanSuDung: 'Dùng để đựng hóa chất, thực hiện các phản ứng hóa học. Rửa sạch sau khi sử dụng.',
            category: chemistryCategory._id,
            maDM: chemistryCategory.id,
            lop: ['8', '9']
        });
    }
    
    // Thiết bị Sinh học
    const biologyCategory = categories.find(c => c.name.includes('Sinh học'));
    if (biologyCategory) {
        devices.push({
            tenTB: 'Kính hiển vi quang học',
            nguonGoc: 'Mua mới',
            soLuong: 20,
            giaThanh: 2500000,
            tinhTrangThietBi: 'Tốt',
            viTriLuuTru: 'Phòng thí nghiệm Sinh học',
            ngayNhap: new Date('2024-01-20'),
            hinhAnh: [],
            huongDanSuDung: 'Đặt tiêu bản lên bàn kính, điều chỉnh ánh sáng, xoay vật kính để quan sát. Bắt đầu từ độ phóng đại thấp.',
            category: biologyCategory._id,
            maDM: biologyCategory.id,
            lop: ['6', '7', '8', '9']
        });
        
        devices.push({
            tenTB: 'Mô hình cấu tạo tế bào',
            nguonGoc: 'Mua mới',
            soLuong: 8,
            giaThanh: 1200000,
            tinhTrangThietBi: 'Tốt',
            viTriLuuTru: 'Phòng thí nghiệm Sinh học',
            ngayNhap: new Date('2024-02-05'),
            hinhAnh: [],
            huongDanSuDung: 'Mô hình 3D để học sinh quan sát cấu trúc tế bào. Có thể tháo rời các bộ phận để quan sát chi tiết.',
            category: biologyCategory._id,
            maDM: biologyCategory.id,
            lop: ['6', '7']
        });
    }
    
    // Thiết bị Thể dục
    const sportsCategory = categories.find(c => c.name.includes('Thể dục'));
    if (sportsCategory) {
        devices.push({
            tenTB: 'Bóng đá size 5',
            nguonGoc: 'Mua mới',
            soLuong: 20,
            giaThanh: 300000,
            tinhTrangThietBi: 'Tốt',
            viTriLuuTru: 'Kho thể dục',
            ngayNhap: new Date('2024-01-30'),
            hinhAnh: [],
            huongDanSuDung: 'Sử dụng cho môn bóng đá. Kiểm tra áp suất bóng trước khi sử dụng.',
            category: sportsCategory._id,
            maDM: sportsCategory.id,
            lop: ['6', '7', '8', '9']
        });
        
        devices.push({
            tenTB: 'Bóng rổ size 7',
            nguonGoc: 'Mua mới',
            soLuong: 15,
            giaThanh: 400000,
            tinhTrangThietBi: 'Tốt',
            viTriLuuTru: 'Kho thể dục',
            ngayNhap: new Date('2024-02-12'),
            hinhAnh: [],
            huongDanSuDung: 'Sử dụng cho môn bóng rổ. Phù hợp cho học sinh THCS.',
            category: sportsCategory._id,
            maDM: sportsCategory.id,
            lop: ['6', '7', '8', '9']
        });
    }
    
    return devices;
}

// ==========================
// SEED FUNCTIONS
// ==========================

async function seedUsers() {
    console.log('🌱 Seeding users...');
    let created = 0;
    let skipped = 0;
    
    for (const userData of USERS) {
        const existing = await User.findOne({ username: userData.username });
        if (existing) {
            console.log(`  ⚠️  User ${userData.username} already exists`);
            skipped++;
            continue;
        }
        
        const matKhauHash = await authService.hashPassword(userData.password);
        const user = new User({
            ...userData,
            matKhauHash,
            trangThai: 'active',
            isActive: true,
            firstLogin: false
        });
        
        await user.save();
        console.log(`  ✅ Created ${userData.role}: ${userData.username} (${userData.hoTen})`);
        created++;
    }
    
    console.log(`  📊 Users: ${created} created, ${skipped} skipped\n`);
    return await User.find();
}

async function seedCategories() {
    console.log('🌱 Seeding categories...');
    
    // Xóa index cũ maDM_1 nếu có (từ schema cũ)
    try {
        const db = mongoose.connection.db;
        const collection = db.collection('categories');
        const indexes = await collection.indexes();
        const maDMIndex = indexes.find(idx => idx.name === 'maDM_1');
        if (maDMIndex) {
            await collection.dropIndex('maDM_1');
            console.log('  🗑️  Dropped old index: maDM_1');
        }
    } catch (err) {
        // Index không tồn tại hoặc đã bị xóa, không sao
        if (err.code !== 27) { // 27 = IndexNotFound
            console.log(`  ⚠️  Warning: ${err.message}`);
        }
    }
    
    let created = 0;
    let skipped = 0;
    
    for (const catData of CATEGORIES) {
        const existing = await Category.findOne({ name: catData.name });
        if (existing) {
            console.log(`   Category "${catData.name}" already exists`);
            skipped++;
            continue;
        }
        
        const category = new Category(catData);
        await category.save();
        console.log(`   Created category: ${catData.name}`);
        created++;
    }
    
    console.log(`  📊 Categories: ${created} created, ${skipped} skipped\n`);
    return await Category.find();
}

async function seedSuppliers() {
    console.log('🌱 Seeding suppliers...');
    let created = 0;
    let skipped = 0;
    
    for (const supData of SUPPLIERS) {
        const existing = await Supplier.findOne({ name: supData.name });
        if (existing) {
            console.log(`  ⚠️  Supplier "${supData.name}" already exists`);
            skipped++;
            continue;
        }
        
        const supplier = new Supplier(supData);
        await supplier.save();
        console.log(`  ✅ Created supplier: ${supData.name}`);
        created++;
    }
    
    console.log(`  📊 Suppliers: ${created} created, ${skipped} skipped\n`);
    return await Supplier.find();
}

async function seedDevices(categories) {
    console.log('🌱 Seeding devices...');
    const devicesData = createDevices(categories);
    let created = 0;
    let skipped = 0;
    
    for (const deviceData of devicesData) {
        const existing = await Device.findOne({ tenTB: deviceData.tenTB });
        if (existing) {
            console.log(`    Device "${deviceData.tenTB}" already exists`);
            skipped++;
            continue;
        }
        
        const device = new Device(deviceData);
        await device.save();
        console.log(`   Created device: ${deviceData.tenTB} (${device.maTB})`);
        
        // Tạo DeviceUnits cho mỗi device
        const units = [];
        for (let i = 1; i <= deviceData.soLuong; i++) {
            const soThuTu = i;
            const maDonVi = `${device.maTB}-${String(soThuTu).padStart(3, '0')}`;
            
            // Phân bổ tình trạng: 70% Tốt, 20% Khá, 8% Trung bình, 2% Hỏng
            let tinhTrang = 'Tốt';
            const rand = Math.random();
            if (rand > 0.98) tinhTrang = 'Hỏng';
            else if (rand > 0.90) tinhTrang = 'Trung bình';
            else if (rand > 0.70) tinhTrang = 'Khá';
            
            units.push({
                maDonVi,
                maTB: device.maTB,
                deviceId: device._id,
                soThuTu,
                tinhTrang,
                trangThai: tinhTrang === 'Hỏng' ? 'thanh_ly' : 'san_sang',
                viTriLuuTru: deviceData.viTriLuuTru,
                lichSu: [{
                    maPhieu: '',
                    loai: 'muon',
                    ngay: deviceData.ngayNhap,
                    ghiChu: `Nhập kho ban đầu từ thiết bị ${device.maTB}`
                }]
            });
        }
        
        if (units.length > 0) {
            await DeviceUnit.insertMany(units);
            console.log(`    📦 Created ${units.length} device units`);
        }
        
        created++;
    }
    
    console.log(`   Devices: ${created} created, ${skipped} skipped\n`);
    return await Device.find().populate('category');
}

async function seedBorrowTickets(users, devices) {
    console.log(' Seeding borrow tickets...');
    const teachers = users.filter(u => u.role === 'giao_vien');
    const availableDevices = devices.filter(d => d.soLuong > 0);
    
    if (teachers.length === 0 || availableDevices.length === 0) {
        console.log('    No teachers or devices available for borrow tickets\n');
        return [];
    }
    
    let created = 0;
    const borrowTickets = [];
    
    // Tạo một số phiếu mượn
    for (let i = 0; i < Math.min(5, teachers.length); i++) {
        const teacher = teachers[i];
        const device = availableDevices[Math.floor(Math.random() * availableDevices.length)];
        
        // Lấy một số device units sẵn sàng
        const availableUnits = await DeviceUnit.find({
            maTB: device.maTB,
            trangThai: 'san_sang',
            tinhTrang: { $ne: 'Hỏng' }
        }).limit(2);
        
        if (availableUnits.length === 0) continue;
        
        const ngayMuon = new Date();
        ngayMuon.setDate(ngayMuon.getDate() - Math.floor(Math.random() * 30)); // Trong 30 ngày qua
        
        const ngayTra = new Date(ngayMuon);
        ngayTra.setDate(ngayTra.getDate() + 7); // Mượn 7 ngày
        
        const ticket = new BorrowTicket({
            maPhieu: `PM${String(created + 1).padStart(4, '0')}`,
            nguoiLapPhieuId: teacher._id,
            ngayMuon,
            ngayDuKienTra: ngayTra,
            caMuon: 'sang',
            caTra: 'sang',
            lyDo: `Mượn thiết bị để giảng dạy môn ${device.category?.name || 'chuyên môn'}`,
            trangThai: Math.random() > 0.3 ? 'approved' : 'cho_duyet',
            ghiChu: `Mượn ${availableUnits.length} thiết bị ${device.tenTB}`
        });
        
        await ticket.save();
        
        // Tạo BorrowDetail cho mỗi device
        for (const unit of availableUnits) {
            const detail = new BorrowDetail({
                maPhieu: ticket.maPhieu,
                maTB: device.maTB,
                soLuongMuon: 1,
                ngayTraDuKien: ngayTra,
                tinhTrangLucMuon: unit.tinhTrang,
                soLuongDaTra: 0,
                trangThai: 'dang_muon',
                danhSachDonVi: [unit.maDonVi],
                ghiChu: `Mượn đơn vị ${unit.maDonVi}`
            });
            await detail.save();
            
            // Cập nhật trạng thái device unit
            unit.trangThai = 'dang_muon';
            unit.maPhieuMuonHienTai = ticket.maPhieu;
            unit.lichSu.push({
                maPhieu: ticket.maPhieu,
                loai: 'muon',
                ngay: ngayMuon,
                nguoiThucHien: teacher._id,
                ghiChu: `Mượn thiết bị - ${ticket.lyDo}`
            });
            await unit.save();
        }
        
        borrowTickets.push(ticket);
        console.log(`   Created borrow ticket: ${ticket.maPhieu} by ${teacher.hoTen}`);
        created++;
    }
    
    console.log(`   Borrow tickets: ${created} created\n`);
    return borrowTickets;
}

async function seedAcceptance(users, suppliers, devices) {
    console.log(' Seeding acceptance records...');
    const managers = users.filter(u => u.role === 'ql_thiet_bi');
    
    if (managers.length === 0 || suppliers.length === 0 || devices.length === 0) {
        console.log('    No managers, suppliers or devices available\n');
        return [];
    }
    
    let created = 0;
    
    for (let i = 0; i < Math.min(3, suppliers.length); i++) {
        const supplier = suppliers[i];
        const device = devices[Math.floor(Math.random() * devices.length)];
        
        const acceptance = new AcceptanceMinutes({
            namHoc: '2023-2024',
            trangThaiNghiemThu: 'Đã nghiệm thu',
            ngayLap: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Trong 90 ngày qua
            tenBienBan: `Biên bản nghiệm thu thiết bị từ ${supplier.name}`,
            duongDanFile: ''
        });
        
        await acceptance.save();
        
        // Tạo chi tiết nghiệm thu
        const detail = new AcceptanceDetail({
            maBienBan: acceptance.maBienBan,
            maTB: device.maTB,
            soLuongThucTe: Math.min(5, device.soLuong),
            chatLuong: 'Tốt',
            lyDo: `Nghiệm thu thiết bị ${device.tenTB} từ ${supplier.name}`
        });
        await detail.save();
        
        console.log(`   Created acceptance: ${acceptance.maBienBan}`);
        created++;
    }
    
    console.log(`   Acceptance records: ${created} created\n`);
    return [];
}

async function seedPurchasingPlans(users) {
    console.log(' Seeding purchasing plans...');
    const managers = users.filter(u => u.role === 'ql_thiet_bi');
    
    if (managers.length === 0) {
        console.log('    No managers available\n');
        return [];
    }
    
    let created = 0;
    
    const plans = [
        {
            tenKH: 'Kế hoạch mua sắm thiết bị CNTT 2024',
            namHoc: '2024-2025',
            nganSach: 50000000,
            trangThai: 'da_duyet',
            ghiChu: 'Mua sắm thiết bị CNTT phục vụ giảng dạy'
        },
        {
            tenKH: 'Kế hoạch mua sắm thiết bị thí nghiệm 2024',
            namHoc: '2024-2025',
            nganSach: 30000000,
            trangThai: 'cho_duyet',
            ghiChu: 'Mua sắm thiết bị thí nghiệm các môn Tự nhiên'
        }
    ];
    
    for (const planData of plans) {
        const existing = await PurchasingPlan.findOne({ tenKH: planData.tenKH });
        if (existing) {
            console.log(`    Plan "${planData.tenKH}" already exists`);
            continue;
        }
        
        const plan = new PurchasingPlan({
            maKeHoachMuaSam: `KH${String(created + 1).padStart(3, '0')}`,
            ...planData
        });
        
        await plan.save();
        console.log(`   Created purchasing plan: ${planData.tenKH}`);
        created++;
    }
    
    console.log(`   Purchasing plans: ${created} created\n`);
    return [];
}

async function seedTrainingPlans(users) {
    console.log('🌱 Seeding training plans...');
    const principal = users.find(u => u.role === 'hieu_truong');
    
    if (!principal) {
        console.log('    No principal available\n');
        return [];
    }
    
    let created = 0;
    
    const plans = [
        {
            tenKH: 'Kế hoạch đào tạo sử dụng thiết bị CNTT 2024',
            namHoc: '2024-2025',
            soLuongGV: 20,
            trangThai: 'da_duyet',
            ghiChu: 'Đào tạo giáo viên sử dụng thiết bị CNTT mới'
        }
    ];
    
    for (const planData of plans) {
        const existing = await TrainingPlan.findOne({ tenKH: planData.tenKH });
        if (existing) {
            console.log(`  ⚠️  Plan "${planData.tenKH}" already exists`);
            continue;
        }
        
        const plan = new TrainingPlan({
            ...planData,
            ngayLap: new Date()
        });
        
        await plan.save();
        console.log(`  ✅ Created training plan: ${planData.tenKH}`);
        created++;
    }
    
    console.log(`  📊 Training plans: ${created} created\n`);
    return [];
}

async function seedPeriodicReports(users) {
    console.log('🌱 Seeding periodic reports...');
    const managers = users.filter(u => u.role === 'ql_thiet_bi');
    
    if (managers.length === 0) {
        console.log('  ⚠️  No managers available\n');
        return [];
    }
    
    let created = 0;
    
    const reports = [
        {
            maBaoCao: 'BC001',
            kyBaoCao: 'Học kỳ 1',
            namHoc: '2023-2024',
            trangThaiBaoCao: 'completed',
            tenFile: 'BaoCao_HK1_2023-2024.pdf',
            duongDanFile: '/uploads/reports/BaoCao_HK1_2023-2024.pdf'
        },
        {
            maBaoCao: 'BC002',
            kyBaoCao: 'Học kỳ 2',
            namHoc: '2023-2024',
            trangThaiBaoCao: 'pending',
            tenFile: 'BaoCao_HK2_2023-2024.pdf',
            duongDanFile: ''
        }
    ];
    
    for (const reportData of reports) {
        const existing = await PeriodicReport.findOne({
            maBaoCao: reportData.maBaoCao
        });
        if (existing) {
            console.log(`  ⚠️  Report "${reportData.maBaoCao}" already exists`);
            continue;
        }
        
        const report = new PeriodicReport({
            ...reportData,
            ngayLap: new Date()
        });
        
        await report.save();
        console.log(`  ✅ Created periodic report: ${reportData.maBaoCao} - ${reportData.kyBaoCao}`);
        created++;
    }
    
    console.log(`  📊 Periodic reports: ${created} created\n`);
    return [];
}

// ==========================
// MAIN SEED FUNCTION
// ==========================

async function seedFullData() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(config.mongodb.uri);
        console.log('✅ Connected to MongoDB\n');
        
        console.log('═══════════════════════════════════════════════════════════');
        console.log('  SEEDING FULL DATA FOR TESTING');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        // Seed in order (respecting dependencies)
        const users = await seedUsers();
        const categories = await seedCategories();
        const suppliers = await seedSuppliers();
        const devices = await seedDevices(categories);
        const borrowTickets = await seedBorrowTickets(users, devices);
        await seedAcceptance(users, suppliers, devices);
        await seedPurchasingPlans(users);
        await seedTrainingPlans(users);
        await seedPeriodicReports(users);
        
        console.log('═══════════════════════════════════════════════════════════');
        console.log('  ✅ SEEDING COMPLETED SUCCESSFULLY');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        console.log('📋 LOGIN CREDENTIALS:');
        console.log('');
        USERS.forEach(user => {
            console.log(`  ${user.role.toUpperCase()}: ${user.username} / ${user.password}`);
        });
        console.log('');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
}

seedFullData();

