const PurchasingService = require('../services/purchasing.service');
const { getNextCode } = require('../../../core/libs/sequence');

class PurchasingController {
    /**
     * Get next plan code (KH001, KH002, ...)
     */
    async getNextPlanCode(req, res) {
        try {
            const nextCode = await getNextCode('KH', 3);
            res.json({
                success: true,
                data: { code: nextCode }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi tạo mã kế hoạch',
                error: error.message
            });
        }
    }

    /**
     * Get all devices for selection modal
     */
    async getDevices(req, res) {
        try {
            const devices = await PurchasingService.getAllDevices();
            const formattedDevices = devices.map(device =>
                PurchasingService.formatDevice(device)
            );
            res.json({
                success: true,
                data: formattedDevices
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy danh sách thiết bị',
                error: error.message
            });
        }
    }

    /**
     * Get devices by category
     */
    async getDevicesByCategory(req, res) {
        try {
            const { categoryId } = req.params;
            const devices = await PurchasingService.getDevicesByCategory(categoryId);
            const formattedDevices = devices.map(device =>
                PurchasingService.formatDevice(device)
            );
            res.json({
                success: true,
                data: formattedDevices
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy danh sách thiết bị theo danh mục',
                error: error.message
            });
        }
    }
}

module.exports = new PurchasingController();
