const devicesRepo = require('../repositories/devices.repo');
const Category = require('../../categories/models/category.model');
const Device = require('../models/device.model');
const DeviceUnit = require('../models/device-unit.model');

class DevicesService {
    /**
     * Lấy danh sách thiết bị với filters
     */
    async getDevices(filters = {}) {
        try {
            const devices = await devicesRepo.findAll(filters);
            return devices;
        } catch (error) {
            throw new Error(`Lỗi khi lấy danh sách thiết bị: ${error.message}`);
        }
    }

    /**
     * Lấy thiết bị theo ID
     */
    async getDeviceById(id) {
        try {
            const device = await devicesRepo.findById(id);
            if (!device) {
                throw new Error('Không tìm thấy thiết bị');
            }
            return device;
        } catch (error) {
            throw new Error(`Lỗi khi lấy thông tin thiết bị: ${error.message}`);
        }
    }

    /**
     * Tạo thiết bị mới
     * Tự động tạo DeviceUnit dựa trên số lượng
     */
    async createDevice(deviceData) {
        try {
            // Kiểm tra mã thiết bị đã tồn tại chưa
            if (deviceData.maTB) {
                const existing = await devicesRepo.findByMaTB(deviceData.maTB);
                if (existing) {
                    throw new Error('Mã thiết bị đã tồn tại');
                }
            }

            // Validate category nếu có
            if (deviceData.category) {
                const category = await Category.findById(deviceData.category);
                if (!category) {
                    throw new Error('Danh mục không tồn tại');
                }
                deviceData.maDM = category.maDM;
            }

            // Xử lý trường lop (nếu là string thì chuyển thành array)
            if (deviceData.lop) {
                if (typeof deviceData.lop === 'string') {
                    deviceData.lop = [deviceData.lop];
                } else if (Array.isArray(deviceData.lop)) {
                    // Loại bỏ giá trị rỗng
                    deviceData.lop = deviceData.lop.filter(l => l && l.trim() !== '');
                }
            } else {
                deviceData.lop = [];
            }

            // Tạo Device
            const device = await devicesRepo.create(deviceData);

            // Tự động tạo DeviceUnit dựa trên số lượng
            const soLuong = parseInt(deviceData.soLuong) || 0;
            if (soLuong > 0) {
                const tinhTrangMacDinh = deviceData.tinhTrangThietBi || 'Tốt';
                const deviceUnits = [];

                // Đếm số lượng DeviceUnit hiện có cho thiết bị này
                const existingCount = await DeviceUnit.countDocuments({ maTB: device.maTB });

                for (let i = 0; i < soLuong; i++) {
                    const soThuTu = existingCount + i + 1;
                    // Tự động tạo maDonVi: TB001-001, TB001-002, ...
                    const maDonVi = `${device.maTB}-${String(soThuTu).padStart(3, '0')}`;

                    const deviceUnit = new DeviceUnit({
                        maDonVi: maDonVi, // Tự động tạo mã đơn vị
                        maTB: device.maTB,
                        deviceId: device._id,
                        soThuTu: soThuTu,
                        tinhTrang: tinhTrangMacDinh,
                        trangThai: 'san_sang',
                        viTriLuuTru: deviceData.viTriLuuTru || '',
                        lichSu: [{
                            maPhieu: '',
                            loai: 'muon', // Mặc định là muon, nhưng đây là nhập kho nên có thể để trống hoặc tạo loại riêng
                            ngay: new Date(),
                            ghiChu: `Nhập kho ban đầu từ thiết bị ${device.maTB}`
                        }]
                    });
                    deviceUnits.push(deviceUnit);
                }

                // Lưu tất cả DeviceUnit
                if (deviceUnits.length > 0) {
                    await DeviceUnit.insertMany(deviceUnits);
                }
            }

            return device;
        } catch (error) {
            throw new Error(`Lỗi khi tạo thiết bị: ${error.message}`);
        }
    }

    /**
     * Cập nhật thiết bị
     */
    async updateDevice(id, deviceData) {
        try {
            // Kiểm tra thiết bị có tồn tại không
            const existing = await devicesRepo.findById(id);
            if (!existing) {
                throw new Error('Không tìm thấy thiết bị');
            }

            // Kiểm tra mã thiết bị nếu thay đổi
            if (deviceData.maTB && deviceData.maTB !== existing.maTB) {
                const duplicate = await devicesRepo.findByMaTB(deviceData.maTB);
                if (duplicate) {
                    throw new Error('Mã thiết bị đã tồn tại');
                }
            }

            // Validate category nếu có
            if (deviceData.category) {
                const category = await Category.findById(deviceData.category);
                if (!category) {
                    throw new Error('Danh mục không tồn tại');
                }
                deviceData.maDM = category.maDM;
            }

            // Xử lý trường lop (nếu là string thì chuyển thành array)
            if (deviceData.lop) {
                if (typeof deviceData.lop === 'string') {
                    deviceData.lop = [deviceData.lop];
                } else if (Array.isArray(deviceData.lop)) {
                    // Loại bỏ giá trị rỗng
                    deviceData.lop = deviceData.lop.filter(l => l && l.trim() !== '');
                }
            } else {
                deviceData.lop = [];
            }

            const device = await devicesRepo.update(id, deviceData);
            return device;
        } catch (error) {
            throw new Error(`Lỗi khi cập nhật thiết bị: ${error.message}`);
        }
    }

    /**
     * Xóa thiết bị
     */
    async deleteDevice(id) {
        try {
            const device = await devicesRepo.findById(id);
            if (!device) {
                throw new Error('Không tìm thấy thiết bị');
            }

            await devicesRepo.delete(id);
            return true;
        } catch (error) {
            throw new Error(`Lỗi khi xóa thiết bị: ${error.message}`);
        }
    }

    /**
     * Lấy danh sách categories cho dropdown
     */
    async getCategories() {
        try {
            const categories = await Category.find({})
                .sort({ tenDM: 1 })
                .lean();
            return categories;
        } catch (error) {
            throw new Error(`Lỗi khi lấy danh sách danh mục: ${error.message}`);
        }
    }

    /**
     * Lấy các giá trị unique cho filters
     * Bao gồm cả dữ liệu từ categories (vị trí) và devices
     */
    async getFilterOptions() {
        try {
            const [statuses, deviceLocations, categoryLocations, origins] = await Promise.all([
                Device.distinct('tinhTrangThietBi'),
                Device.distinct('viTriLuuTru'),
                Category.distinct('location'), // Lấy vị trí từ categories
                Device.distinct('nguonGoc')
            ]);

            // Merge locations từ cả devices và categories
            const allLocations = new Set([
                ...deviceLocations.filter(l => l && l.trim() !== ''),
                ...categoryLocations.filter(l => l && l.trim() !== '')
            ]);

            return {
                statuses: statuses.filter(s => s && s.trim() !== ''),
                locations: Array.from(allLocations).sort(),
                origins: origins.filter(o => o && o.trim() !== '')
            };
        } catch (error) {
            console.error('Error getting filter options:', error);
            return { statuses: [], locations: [], origins: [] };
        }
    }
}

module.exports = new DevicesService();

