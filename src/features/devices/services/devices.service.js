// Devices Service
const devicesRepo = require('../repositories/devices.repo');
const Category = require('../../categories/models/category.model');
const Supplier = require('../../suppliers/models/supplier.model');

class DevicesService {
    // Lấy danh sách thiết bị với filters
    async getDevices(filters = {}) {
        try {
            const devices = await devicesRepo.findAll(filters);
            
            // Map devices để format cho frontend
            return devices.map(device => ({
                _id: device._id,
                id: device._id.toString(),
                maTB: device.maTB,
                tenTB: device.tenTB,
                name: device.tenTB,
                category: device.category?._id || device.category,
                categoryName: device.category?.tenDM || device.maDM || 'N/A',
                maDM: device.maDM,
                nguonGoc: device.nguonGoc,
                supplier: device.nguonGoc,
                soLuong: device.soLuong,
                quantity: device.soLuong,
                tinhTrangThietBi: device.tinhTrangThietBi,
                condition: device.tinhTrangThietBi,
                viTriLuuTru: device.viTriLuuTru,
                location: device.viTriLuuTru,
                ngayNhap: device.ngayNhap,
                hinhAnh: device.hinhAnh,
                huongDanSuDung: device.huongDanSuDung,
                description: device.huongDanSuDung,
                status: device.soLuong > 0 ? 'Có sẵn' : 'Đã mượn',
                unit: 'cái', // Default, có thể thêm vào model sau
                classes: '', // Có thể thêm vào model sau
                createdAt: device.createdAt,
                updatedAt: device.updatedAt
            }));
        } catch (error) {
            console.error('Error in getDevices service:', error);
            throw error;
        }
    }
    
    // Lấy thiết bị theo ID
    async getDeviceById(id) {
        try {
            const device = await devicesRepo.findById(id);
            
            if (!device) {
                throw new Error('Thiết bị không tồn tại');
            }
            
            // Format device
            return {
                _id: device._id,
                id: device._id.toString(),
                maTB: device.maTB,
                tenTB: device.tenTB,
                name: device.tenTB,
                category: device.category?._id || device.category,
                categoryName: device.category?.tenDM || device.maDM || 'N/A',
                maDM: device.maDM,
                nguonGoc: device.nguonGoc,
                supplier: device.nguonGoc,
                soLuong: device.soLuong,
                quantity: device.soLuong,
                tinhTrangThietBi: device.tinhTrangThietBi,
                condition: device.tinhTrangThietBi,
                viTriLuuTru: device.viTriLuuTru,
                location: device.viTriLuuTru,
                ngayNhap: device.ngayNhap,
                hinhAnh: device.hinhAnh,
                huongDanSuDung: device.huongDanSuDung,
                description: device.huongDanSuDung,
                status: device.soLuong > 0 ? 'Có sẵn' : 'Đã mượn',
                unit: 'cái',
                classes: '',
                createdAt: device.createdAt,
                updatedAt: device.updatedAt
            };
        } catch (error) {
            console.error('Error in getDeviceById service:', error);
            throw error;
        }
    }
    
    // Tạo thiết bị mới
    async createDevice(deviceData) {
        try {
            // Validate required fields
            if (!deviceData.tenTB) {
                throw new Error('Tên thiết bị là bắt buộc');
            }
            
            if (!deviceData.category && !deviceData.maDM) {
                throw new Error('Danh mục là bắt buộc');
            }
            
            // Handle category - convert to ObjectId if needed
            if (deviceData.category && typeof deviceData.category === 'string') {
                const mongoose = require('mongoose');
                if (mongoose.Types.ObjectId.isValid(deviceData.category)) {
                    deviceData.category = new mongoose.Types.ObjectId(deviceData.category);
                } else {
                    // Find category by name
                    const category = await Category.findOne({ tenDM: deviceData.category });
                    if (category) {
                        deviceData.category = category._id;
                        deviceData.maDM = category.maDM;
                    }
                }
            }
            
            // Handle supplier - convert to ObjectId if needed
            if (deviceData.supplier && typeof deviceData.supplier === 'string') {
                const mongoose = require('mongoose');
                if (mongoose.Types.ObjectId.isValid(deviceData.supplier)) {
                    // It's already an ObjectId string
                    deviceData.nguonGoc = deviceData.supplier;
                } else {
                    // Find supplier by name
                    const supplier = await Supplier.findOne({ tenNCC: deviceData.supplier });
                    if (supplier) {
                        deviceData.nguonGoc = supplier.tenNCC;
                    } else {
                        deviceData.nguonGoc = deviceData.supplier;
                    }
                }
            }
            
            // Convert soLuong to number
            if (deviceData.soLuong) {
                deviceData.soLuong = parseInt(deviceData.soLuong, 10);
            }
            
            // Handle image upload (if file path provided)
            if (deviceData.hinhAnh && typeof deviceData.hinhAnh === 'object') {
                // If it's a file object, save the path
                deviceData.hinhAnh = deviceData.hinhAnh.path || deviceData.hinhAnh.filename;
            }
            
            const device = await devicesRepo.create(deviceData);
            
            return this.getDeviceById(device._id.toString());
        } catch (error) {
            console.error('Error in createDevice service:', error);
            throw error;
        }
    }
    
    // Cập nhật thiết bị
    async updateDevice(id, updateData) {
        try {
            // Handle category
            if (updateData.category && typeof updateData.category === 'string') {
                const mongoose = require('mongoose');
                if (mongoose.Types.ObjectId.isValid(updateData.category)) {
                    updateData.category = new mongoose.Types.ObjectId(updateData.category);
                } else {
                    const category = await Category.findOne({ tenDM: updateData.category });
                    if (category) {
                        updateData.category = category._id;
                        updateData.maDM = category.maDM;
                    }
                }
            }
            
            // Handle supplier
            if (updateData.supplier && typeof updateData.supplier === 'string') {
                const mongoose = require('mongoose');
                if (mongoose.Types.ObjectId.isValid(updateData.supplier)) {
                    updateData.nguonGoc = updateData.supplier;
                } else {
                    const supplier = await Supplier.findOne({ tenNCC: updateData.supplier });
                    if (supplier) {
                        updateData.nguonGoc = supplier.tenNCC;
                    } else {
                        updateData.nguonGoc = updateData.supplier;
                    }
                }
            }
            
            // Convert soLuong to number
            if (updateData.soLuong) {
                updateData.soLuong = parseInt(updateData.soLuong, 10);
            }
            
            // Handle image upload
            if (updateData.hinhAnh) {
                if (typeof updateData.hinhAnh === 'object') {
                    updateData.hinhAnh = updateData.hinhAnh.path || updateData.hinhAnh.filename;
                }
                // If it's a string, keep it as is (existing image path)
            }
            
            // Map tinhTrang field if provided
            if (updateData.tinhTrang) {
                updateData.tinhTrangThietBi = updateData.tinhTrang;
            }
            
            const device = await devicesRepo.update(id, updateData);
            
            return this.getDeviceById(device._id.toString());
        } catch (error) {
            console.error('Error in updateDevice service:', error);
            throw error;
        }
    }
    
    // Xóa thiết bị
    async deleteDevice(id) {
        try {
            const device = await devicesRepo.delete(id);
            return device;
        } catch (error) {
            console.error('Error in deleteDevice service:', error);
            throw error;
        }
    }
    
    // Lấy danh sách categories và suppliers cho form
    async getFormData() {
        try {
            const [categories, suppliers] = await Promise.all([
                Category.find({}).sort({ tenDM: 1 }).lean(),
                Supplier.find({}).sort({ tenNCC: 1 }).lean()
            ]);
            
            return {
                categories,
                suppliers
            };
        } catch (error) {
            console.error('Error in getFormData service:', error);
            throw error;
        }
    }
}

module.exports = new DevicesService();

