const Device = require('../models/device.model');
const Category = require('../../categories/models/category.model');

class DevicesRepository {
    /**
     * Lấy danh sách thiết bị với filters
     */
    async findAll(filters = {}) {
        const query = {};

        // Tìm kiếm theo tên hoặc mã thiết bị
        if (filters.search) {
            query.$or = [
                { tenTB: { $regex: filters.search, $options: 'i' } },
                { maTB: { $regex: filters.search, $options: 'i' } }
            ];
        }

        // Lọc theo danh mục
        if (filters.categoryId) {
            query.category = filters.categoryId;
        }

        // Lọc theo trạng thái thiết bị
        if (filters.tinhTrangThietBi) {
            query.tinhTrangThietBi = filters.tinhTrangThietBi;
        }

        // Lọc theo vị trí lưu trữ
        if (filters.viTriLuuTru) {
            query.viTriLuuTru = { $regex: filters.viTriLuuTru, $options: 'i' };
        }

        // Lọc theo nguồn gốc
        if (filters.nguonGoc) {
            query.nguonGoc = { $regex: filters.nguonGoc, $options: 'i' };
        }

        const devices = await Device.find(query)
            .populate('category', 'tenDM maDM')
            .sort({ createdAt: -1 })
            .lean();

        return devices;
    }

    /**
     * Lấy thiết bị theo ID
     */
    async findById(id) {
        const device = await Device.findById(id)
            .populate('category', 'tenDM maDM')
            .lean();
        return device;
    }

    /**
     * Lấy thiết bị theo mã thiết bị
     */
    async findByMaTB(maTB) {
        const device = await Device.findOne({ maTB })
            .populate('category', 'tenDM maDM')
            .lean();
        return device;
    }

    /**
     * Tạo thiết bị mới
     */
    async create(deviceData) {
        const device = new Device(deviceData);
        await device.save();
        return device.toObject();
    }

    /**
     * Cập nhật thiết bị
     */
    async update(id, deviceData) {
        const device = await Device.findByIdAndUpdate(
            id,
            { $set: deviceData },
            { new: true, runValidators: true }
        )
            .populate('category', 'tenDM maDM')
            .lean();
        return device;
    }

    /**
     * Xóa thiết bị
     */
    async delete(id) {
        const result = await Device.findByIdAndDelete(id);
        return result;
    }

    /**
     * Đếm số lượng thiết bị
     */
    async count(filters = {}) {
        const query = {};

        if (filters.search) {
            query.$or = [
                { tenTB: { $regex: filters.search, $options: 'i' } },
                { maTB: { $regex: filters.search, $options: 'i' } }
            ];
        }

        if (filters.categoryId) {
            query.category = filters.categoryId;
        }

        if (filters.tinhTrangThietBi) {
            query.tinhTrangThietBi = filters.tinhTrangThietBi;
        }

        return await Device.countDocuments(query);
    }
}

module.exports = new DevicesRepository();

