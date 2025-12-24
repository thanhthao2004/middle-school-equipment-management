const Device = require('../../devices/models/device.model');
const Category = require('../../categories/models/category.model');

class PurchasingService {
    /**
     * Get all categories for filter dropdown
     */
    async getAllCategories() {
        try {
            const categories = await Category.find({}).select('_id id name').sort({ name: 1 }).lean();
            return categories;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all devices for selection
     */
    async getAllDevices() {
        try {
            const devices = await Device.find({}).select('maTB tenTB giaThanh donViTinh huongDanSuDung nguonGoc category').lean();
            return devices;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get device by ID
     */
    async getDeviceById(id) {
        try {
            const device = await Device.findById(id).lean();
            return device;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get devices by category
     */
    async getDevicesByCategory(categoryId) {
        try {
            const devices = await Device.find({ category: categoryId })
                .select('maTB tenTB giaThanh donViTinh huongDanSuDung nguonGoc category')
                .lean();
            return devices;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Format device for display
     */
    formatDevice(device) {
        return {
            id: device._id,
            code: device.maTB,
            name: device.tenTB,
            price: device.giaThanh || 0,
            uom: device.donViTinh || 'Cái',
            description: device.huongDanSuDung || '',
            source: device.nguonGoc || '',
            category: device.category
        };
    }
}

module.exports = new PurchasingService();