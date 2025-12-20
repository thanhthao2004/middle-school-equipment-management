const PurchasingService = require('../services/purchasing.service');
const PurchasingRepository = require('../repositories/purchasing.repo');
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
     * Lấy danh sách tất cả kế hoạch
     */
    async listPlans(req, res) {
        try {
            const plans = await PurchasingRepository.getAllPlans();
            // Extract unique years from plans
            const years = [...new Set(plans.map(p => p.namHoc).filter(y => y))];
            
            res.render('purchasing-plans/views/list', {
                title: 'Quản lý kế hoạch mua sắm',
                plans,
                years,
                user: req.user || { role: 'to_truong' }
            });
        } catch (error) {
            console.error('Error fetching plans:', error);
            res.status(500).send(`<h1>Lỗi</h1><p>${error.message}</p>`);
        }
    }

    /**
     * Lấy chi tiết kế hoạch
     */
    async getPlanDetail(req, res) {
        try {
            const { code } = req.params;
            const planData = await PurchasingRepository.getPlanByCode(code);

            if (!planData) {
                return res.status(404).send('Kế hoạch không tồn tại');
            }

            res.render('purchasing-plans/views/detail', {
                title: `Chi tiết kế hoạch ${code}`,
                plan: planData,
                user: req.user || { role: 'to_truong' }
            });
        } catch (error) {
            console.error('Error fetching plan detail:', error);
            res.status(500).send(`<h1>Lỗi</h1><p>${error.message}</p>`);
        }
    }

    /**
     * Get edit page
     */
    async getEditPage(req, res) {
        try {
            const { id } = req.params;
            const planData = await PurchasingRepository.getPlanById(id);

            if (!planData) {
                return res.status(404).send('Kế hoạch không tồn tại');
            }

            res.render('purchasing-plans/views/edit', {
                title: 'Sửa kế hoạch mua sắm',
                plan: planData,
                user: req.user || { role: 'to_truong' }
            });
        } catch (error) {
            console.error('Error fetching plan for edit:', error);
            res.status(500).send(`<h1>Lỗi</h1><p>${error.message}</p>`);
        }
    }

    /**
     * API: Lấy chi tiết kế hoạch dạng JSON
     */
    async getPlanDetailJson(req, res) {
        try {
            const { code } = req.params;
            const planData = await PurchasingRepository.getPlanByCode(code);

            if (!planData) {
                return res.status(404).json({
                    success: false,
                    message: 'Kế hoạch không tồn tại'
                });
            }

            res.json({
                success: true,
                data: planData
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy chi tiết kế hoạch',
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

    /**
     * Create new purchasing plan
     */
    async createPlan(req, res) {
        try {
            const { code, namHoc, items } = req.body;
            
            const plan = await PurchasingRepository.createPlan({
                code,
                namHoc,
                trangThai: 'cho_phe_duyet',
                items: items || []
            });

            const userRole = req.user?.role || 'to_truong';
            if (userRole === 'hieu_truong') {
                return res.redirect('/principal/purchasing-plans');
            }
            return res.redirect('/teacher/purchasing-plans');
        } catch (error) {
            console.error('Error creating plan:', error);
            res.status(500).send(`<h1>Lỗi</h1><p>${error.message}</p>`);
        }
    }

    /**
     * Update purchasing plan
     */
    async updatePlan(req, res) {
        try {
            const { id } = req.params;
            const { namHoc, items, trangThai } = req.body;

            await PurchasingRepository.updatePlan(id, {
                namHoc,
                trangThai,
                items
            });

            const userRole = req.user?.role || 'to_truong';
            if (userRole === 'hieu_truong') {
                return res.redirect('/principal/purchasing-plans');
            }
            return res.redirect('/teacher/purchasing-plans');
        } catch (error) {
            console.error('Error updating plan:', error);
            res.status(500).send(`<h1>Lỗi</h1><p>${error.message}</p>`);
        }
    }

    /**
     * Delete purchasing plan
     */
    async deletePlan(req, res) {
        try {
            const { id } = req.params;

            await PurchasingRepository.deletePlan(id);

            const userRole = req.user?.role || 'to_truong';
            if (userRole === 'hieu_truong') {
                return res.redirect('/principal/purchasing-plans');
            }
            return res.redirect('/teacher/purchasing-plans');
        } catch (error) {
            console.error('Error deleting plan:', error);
            res.status(500).send(`<h1>Lỗi</h1><p>${error.message}</p>`);
        }
    }
}

module.exports = new PurchasingController();
