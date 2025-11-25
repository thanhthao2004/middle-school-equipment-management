// Devices Repository
const Device = require('../models/device.model');
const Category = require('../../categories/models/category.model');
const Supplier = require('../../suppliers/models/supplier.model');

class DevicesRepository {
    // Lấy tất cả thiết bị với filters
    async findAll(filters = {}) {
        try {
            const query = {};
            
            // Filter by category
            if (filters.category) {
                if (typeof filters.category === 'string') {
                    // Check if it's ObjectId or category name
                    const mongoose = require('mongoose');
                    if (mongoose.Types.ObjectId.isValid(filters.category)) {
                        query.category = filters.category;
                    } else {
                        // Find category by name
                        const category = await Category.findOne({ tenDM: filters.category });
                        if (category) {
                            query.category = category._id;
                        }
                    }
                } else {
                    query.category = filters.category;
                }
            }
            
            // Filter by maDM
            if (filters.maDM) {
                query.maDM = filters.maDM;
            }
            
            // Filter by search term (tên thiết bị hoặc mã thiết bị)
            if (filters.search) {
                query.$or = [
                    { tenTB: { $regex: filters.search, $options: 'i' } },
                    { maTB: { $regex: filters.search, $options: 'i' } }
                ];
            }
            
            // Filter by tình trạng
            if (filters.tinhTrangThietBi) {
                query.tinhTrangThietBi = filters.tinhTrangThietBi;
            }
            
            // Filter by vị trí lưu trữ
            if (filters.viTriLuuTru) {
                query.viTriLuuTru = filters.viTriLuuTru;
            }
            
            // Filter by nguồn gốc/nhà cung cấp
            if (filters.nguonGoc) {
                query.nguonGoc = filters.nguonGoc;
            }
            
            // Filter by ngày nhập
            if (filters.ngayNhapFrom || filters.ngayNhapTo) {
                query.ngayNhap = {};
                if (filters.ngayNhapFrom) {
                    query.ngayNhap.$gte = new Date(filters.ngayNhapFrom);
                }
                if (filters.ngayNhapTo) {
                    const toDate = new Date(filters.ngayNhapTo);
                    toDate.setHours(23, 59, 59, 999);
                    query.ngayNhap.$lte = toDate;
                }
            }
            
            const devices = await Device.find(query)
                .populate('category', 'tenDM maDM')
                .sort({ createdAt: -1 })
                .lean();
            
            return devices;
        } catch (error) {
            console.error('Error in findAll devices:', error);
            throw error;
        }
    }
    
    // Lấy thiết bị theo ID
    async findById(id) {
        try {
            const mongoose = require('mongoose');
            let device;
            
            // Try to find by _id first
            if (mongoose.Types.ObjectId.isValid(id)) {
                device = await Device.findById(id)
                    .populate('category', 'tenDM maDM')
                    .lean();
            }
            
            // If not found, try by maTB
            if (!device) {
                device = await Device.findOne({ maTB: id })
                    .populate('category', 'tenDM maDM')
                    .lean();
            }
            
            return device;
        } catch (error) {
            console.error('Error in findById device:', error);
            throw error;
        }
    }
    
    // Tạo thiết bị mới
    async create(deviceData) {
        try {
            const device = new Device(deviceData);
            await device.save();
            
            // Populate category before returning
            await device.populate('category', 'tenDM maDM');
            
            return device.toObject();
        } catch (error) {
            console.error('Error in create device:', error);
            throw error;
        }
    }
    
    // Cập nhật thiết bị
    async update(id, updateData) {
        try {
            const mongoose = require('mongoose');
            let device;
            
            // Try to find by _id first
            if (mongoose.Types.ObjectId.isValid(id)) {
                device = await Device.findByIdAndUpdate(
                    id,
                    { $set: updateData },
                    { new: true, runValidators: true }
                ).populate('category', 'tenDM maDM');
            } else {
                // Try by maTB
                device = await Device.findOneAndUpdate(
                    { maTB: id },
                    { $set: updateData },
                    { new: true, runValidators: true }
                ).populate('category', 'tenDM maDM');
            }
            
            if (!device) {
                throw new Error('Thiết bị không tồn tại');
            }
            
            return device.toObject();
        } catch (error) {
            console.error('Error in update device:', error);
            throw error;
        }
    }
    
    // Xóa thiết bị
    async delete(id) {
        try {
            const mongoose = require('mongoose');
            let device;
            
            // Try to find by _id first
            if (mongoose.Types.ObjectId.isValid(id)) {
                device = await Device.findByIdAndDelete(id);
            } else {
                // Try by maTB
                device = await Device.findOneAndDelete({ maTB: id });
            }
            
            if (!device) {
                throw new Error('Thiết bị không tồn tại');
            }
            
            return device.toObject();
        } catch (error) {
            console.error('Error in delete device:', error);
            throw error;
        }
    }
    
    // Đếm số lượng thiết bị
    async count(filters = {}) {
        try {
            const query = {};
            
            if (filters.category) {
                query.category = filters.category;
            }
            
            if (filters.search) {
                query.$or = [
                    { tenTB: { $regex: filters.search, $options: 'i' } },
                    { maTB: { $regex: filters.search, $options: 'i' } }
                ];
            }
            
            return await Device.countDocuments(query);
        } catch (error) {
            console.error('Error in count devices:', error);
            throw error;
        }
    }
}

module.exports = new DevicesRepository();

