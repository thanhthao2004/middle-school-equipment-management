const PurchasingService = require('../services/purchasing.service');
const PurchasingRepository = require('../repositories/purchasing.repo');
const { peekNextCode } = require('../../../core/libs/sequence');
const Device = require('../../devices/models/device.model');
const Category = require('../../categories/models/category.model');
const NotificationService = require('../../notifications/services/notification.service');

class PurchasingController {
    /**
     * Get next plan code preview (KH001, KH002, ...)
     * CHỈ để xem trước - KHÔNG tăng counter
     */
    async getNextPlanCode(req, res) {
        try {
            const nextCode = await peekNextCode('KH', 3);
            res.json({
                success: true,
                data: { code: nextCode }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy mã kế hoạch',
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

            // Bổ sung dữ liệu thiếu cho các bản ghi cũ (tenTB, tenDanhMuc, donGia, nguonGoc)
            const details = planData.details || [];
            const codesNeedingEnrich = details
                .filter(d => (
                    !d ||
                    !d.maTB ||
                    !(d.tenTB && d.tenTB.trim()) ||
                    typeof d.donGia !== 'number' ||
                    !(d.nguonGoc && d.nguonGoc.trim()) ||
                    !(d.tenDanhMuc && d.tenDanhMuc.trim())
                ))
                .map(d => d.maTB)
                .filter((v, idx, arr) => v && arr.indexOf(v) === idx);

            let deviceMap = {};
            let categoryMap = {};

            if (codesNeedingEnrich.length > 0) {
                const devices = await Device.find({ maTB: { $in: codesNeedingEnrich } }).lean();
                deviceMap = devices.reduce((acc, cur) => {
                    acc[cur.maTB] = cur;
                    return acc;
                }, {});

                const categoryIds = devices
                    .map(d => d.category)
                    .filter(Boolean)
                    .map(id => id.toString())
                    .filter((v, idx, arr) => arr.indexOf(v) === idx);

                if (categoryIds.length > 0) {
                    const categories = await Category.find({ _id: { $in: categoryIds } }).lean();
                    categoryMap = categories.reduce((acc, cur) => {
                        acc[cur._id.toString()] = cur.name;
                        return acc;
                    }, {});
                }
            }

            const enrichedDetails = details.map(detail => {
                const device = deviceMap[detail.maTB];
                const categoryName = detail.tenDanhMuc || (device && device.category ? categoryMap[device.category?.toString()] : '') || '';
                const tenTB = detail.tenTB || device?.tenTB || '';
                const nguonGoc = detail.nguonGoc || device?.nguonGoc || '';
                const donGia = typeof detail.donGia === 'number' ? detail.donGia : (device?.giaThanh || 0);

                return {
                    ...detail,
                    tenDanhMuc: categoryName,
                    tenTB,
                    nguonGoc,
                    donGia,
                };
            });

            res.render('purchasing-plans/views/detail', {
                title: `Chi tiết kế hoạch ${code}`,
                plan: { ...planData, details: enrichedDetails },
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

            // Bổ sung dữ liệu thiếu cho các bản ghi cũ (tenTB, tenDanhMuc, donGia, nguonGoc)
            const details = planData.details || [];
            const codesNeedingEnrich = details
                .filter(d => (
                    !d ||
                    !d.maTB ||
                    !(d.tenTB && d.tenTB.trim()) ||
                    typeof d.donGia !== 'number' ||
                    !(d.nguonGoc && d.nguonGoc.trim()) ||
                    !(d.tenDanhMuc && d.tenDanhMuc.trim())
                ))
                .map(d => d.maTB)
                .filter((v, idx, arr) => v && arr.indexOf(v) === idx);

            let deviceMap = {};
            let categoryMap = {};

            if (codesNeedingEnrich.length > 0) {
                const devices = await Device.find({ maTB: { $in: codesNeedingEnrich } }).lean();
                deviceMap = devices.reduce((acc, cur) => {
                    acc[cur.maTB] = cur;
                    return acc;
                }, {});

                const categoryIds = devices
                    .map(d => d.category)
                    .filter(Boolean)
                    .map(id => id.toString())
                    .filter((v, idx, arr) => arr.indexOf(v) === idx);

                if (categoryIds.length > 0) {
                    const categories = await Category.find({ _id: { $in: categoryIds } }).lean();
                    categoryMap = categories.reduce((acc, cur) => {
                        acc[cur._id.toString()] = cur.name;
                        return acc;
                    }, {});
                }
            }

            const enrichedDetails = details.map(detail => {
                const device = deviceMap[detail.maTB];
                const categoryName = detail.tenDanhMuc || (device && device.category ? categoryMap[device.category?.toString()] : '') || '';
                const tenTB = detail.tenTB || device?.tenTB || '';
                const nguonGoc = detail.nguonGoc || device?.nguonGoc || '';
                const donGia = typeof detail.donGia === 'number' ? detail.donGia : (device?.giaThanh || 0);

                return {
                    ...detail,
                    tenDanhMuc: categoryName,
                    tenTB,
                    nguonGoc,
                    donGia,
                };
            });

            res.render('purchasing-plans/views/edit', {
                title: 'Sửa kế hoạch mua sắm',
                plan: { ...planData, details: enrichedDetails },
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
     * Get all categories for filter dropdown
     */
    async getCategories(req, res) {
        try {
            const categories = await PurchasingService.getAllCategories();
            res.json({
                success: true,
                data: categories
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy danh sách danh mục',
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
            const { namHoc, items } = req.body;

            // Mã kế hoạch sẽ tự động tạo trong repository - không cần truyền từ client
            const plan = await PurchasingRepository.createPlan({
                namHoc,
                trangThai: 'cho_phe_duyet',
                items: items || []
            });

            // Gửi thông báo đến principal khi tạo kế hoạch
            const teacherName = req.user?.hoTen || 'Giáo viên';
            await NotificationService.notifyPrincipalNewPlan(plan, teacherName);

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

            console.log('=== UPDATE PLAN DEBUG ===');
            console.log('ID:', id);
            console.log('namHoc:', namHoc);
            console.log('trangThai:', trangThai);
            console.log('items:', JSON.stringify(items, null, 2));
            console.log('========================');

            const updatedPlan = await PurchasingRepository.updatePlan(id, {
                namHoc,
                trangThai,
                items
            });

            // Gửi thông báo đến principal khi status là 'cho_phe_duyet'
            if (trangThai === 'cho_phe_duyet' && updatedPlan) {
                const teacherName = req.user?.hoTen || 'Giáo viên';
                await NotificationService.notifyPrincipalNewPlan(updatedPlan, teacherName);
            }

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
    /**
     * Hiển thị trang duyệt kế hoạch (Dành cho Hiệu trưởng)
     */
    async getApprovePage(req, res) {
        try {
            // Lấy các kế hoạch đang chờ phê duyệt
            const plans = await PurchasingRepository.getPlansByStatus('cho_phe_duyet');
            const years = [...new Set(plans.map(p => p.namHoc).filter(y => y))];

            res.render('purchasing-plans/views/approve', {
                title: 'Duyệt kế hoạch mua sắm',
                plans,
                years,
                user: req.user || { role: 'hieu_truong' }
            });
        } catch (error) {
            console.error('Error fetching plans for approval:', error);
            res.status(500).send(`<h1>Lỗi</h1><p>${error.message}</p>`);
        }
    }

    /**
     * Phê duyệt kế hoạch
     */
    async approvePlan(req, res) {
        try {
            const { id } = req.params;
            await PurchasingRepository.updateStatus(id, 'da_duyet');

            // Thông báo thành công và chuyển hướng về trang danh sách chính
            res.redirect('/principal/purchasing-plans?status=approved');
        } catch (error) {
            console.error('Error approving plan:', error);
            res.status(500).send(`<h1>Lỗi</h1><p>${error.message}</p>`);
        }
    }

    /**
     * Từ chối kế hoạch
     */
    async rejectPlan(req, res) {
        try {
            const { id } = req.params;
            await PurchasingRepository.updateStatus(id, 'tu_choi');

            res.redirect('/principal/purchasing-plans?status=rejected');
        } catch (error) {
            console.error('Error rejecting plan:', error);
            res.status(500).send(`<h1>Lỗi</h1><p>${error.message}</p>`);
        }
    }
}

module.exports = new PurchasingController();
