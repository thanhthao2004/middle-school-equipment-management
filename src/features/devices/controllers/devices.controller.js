const devicesService = require('../services/devices.service');
const path = require('path');

// Devices Controller
class DevicesController {
    // GET /devices - Danh sách thiết bị
    async getListPage(req, res) {
        try {
            const filters = {
                search: req.query.search || '',
                categoryId: req.query.category || '',
                tinhTrangThietBi: req.query.status || '',
                viTriLuuTru: req.query.location || '',
                nguonGoc: req.query.origin || ''
            };

            const [devices, categories, filterOptions] = await Promise.all([
                devicesService.getDevices(filters),
                devicesService.getCategories(),
                devicesService.getFilterOptions()
            ]);

            res.render('devices/views/list', {
                title: 'Quản lý thiết bị',
                currentPage: 'devices',
                sidebarType: 'qltb-sidebar',
                devices,
                categories,
                filterOptions,
                filters,
                user: req.user || { role: 'ql_thiet_bi' },
                messages: {
                    success: req.session?.flash?.success || null,
                    error: req.session?.flash?.error || null
                }
            });
        } catch (error) {
            console.error('Error rendering devices list page:', error);
            res.status(500).send(`<h1>Lỗi</h1><p>${error.message}</p>`);
        }
    }

    // GET /devices/create - Trang tạo thiết bị mới
    async getCreatePage(req, res) {
        try {
            const categories = await devicesService.getCategories();
            res.render('devices/views/create', {
                title: 'Thêm thiết bị mới',
                currentPage: 'devices',
                sidebarType: 'qltb-sidebar',
                categories,
                user: req.user || { role: 'ql_thiet_bi' },
                messages: {
                    success: req.session?.flash?.success || null,
                    error: req.session?.flash?.error || null
                }
            });
        } catch (error) {
            console.error('Error rendering create device page:', error);
            res.status(500).send(`<h1>Lỗi</h1><p>${error.message}</p>`);
        }
    }

    // POST /devices/create - Tạo thiết bị mới
    async createDevice(req, res) {
        try {
            const deviceData = req.body;
            
            // Convert empty strings to null/undefined for optional fields
            if (deviceData.ngayNhap === '') delete deviceData.ngayNhap;
            if (deviceData.category === '') delete deviceData.category;
            if (deviceData.soLuong === '') deviceData.soLuong = 0;
            else deviceData.soLuong = parseInt(deviceData.soLuong) || 0;

            const device = await devicesService.createDevice(deviceData);
            if (!req.session.flash) req.session.flash = {};
            req.session.flash.success = 'Thêm thiết bị thành công';
            res.redirect(`/manager/devices`);
        } catch (error) {
            console.error('Error creating device:', error);
            if (!req.session.flash) req.session.flash = {};
            req.session.flash.error = error.message;
            res.redirect('/manager/devices/create');
        }
    }

    // GET /devices/detail/:id - Xem chi tiết thiết bị
    async getDetailPage(req, res) {
        try {
            const deviceId = req.params.id;
            const device = await devicesService.getDeviceById(deviceId);
            
            res.render('devices/views/detail', {
                title: `Chi tiết thiết bị - ${device.maTB}`,
                currentPage: 'devices',
                sidebarType: 'qltb-sidebar',
                device,
                user: req.user || { role: 'ql_thiet_bi' },
                messages: {
                    success: req.session?.flash?.success || null,
                    error: req.session?.flash?.error || null
                }
            });
        } catch (error) {
            console.error('Error rendering device detail page:', error);
            if (!req.session.flash) req.session.flash = {};
            req.session.flash.error = error.message;
            res.redirect('/manager/devices');
        }
    }

    // GET /devices/edit/:id - Trang sửa thiết bị
    async getEditPage(req, res) {
        try {
            const deviceId = req.params.id;
            const [device, categories] = await Promise.all([
                devicesService.getDeviceById(deviceId),
                devicesService.getCategories()
            ]);

            res.render('devices/views/edit', {
                title: 'Sửa thiết bị',
                currentPage: 'devices',
                sidebarType: 'qltb-sidebar',
                device,
                categories,
                user: req.user || { role: 'ql_thiet_bi' },
                messages: {
                    success: req.session?.flash?.success || null,
                    error: req.session?.flash?.error || null
                }
            });
        } catch (error) {
            console.error('Error rendering edit device page:', error);
            if (!req.session.flash) req.session.flash = {};
            req.session.flash.error = error.message;
            res.redirect('/manager/devices');
        }
    }

    // POST /devices/update/:id - Cập nhật thiết bị
    async updateDevice(req, res) {
        try {
            const deviceId = req.params.id;
            const deviceData = req.body;

            // Convert empty strings to null/undefined for optional fields
            if (deviceData.ngayNhap === '') delete deviceData.ngayNhap;
            if (deviceData.category === '') delete deviceData.category;
            if (deviceData.soLuong === '') deviceData.soLuong = 0;
            else deviceData.soLuong = parseInt(deviceData.soLuong) || 0;

            await devicesService.updateDevice(deviceId, deviceData);
            if (!req.session.flash) req.session.flash = {};
            req.session.flash.success = 'Cập nhật thiết bị thành công';
            res.redirect(`/manager/devices/detail/${deviceId}`);
        } catch (error) {
            console.error('Error updating device:', error);
            if (!req.session.flash) req.session.flash = {};
            req.session.flash.error = error.message;
            res.redirect(`/manager/devices/edit/${req.params.id}`);
        }
    }

    // GET /devices/delete/:id - Trang xác nhận xóa
    async getDeletePage(req, res) {
        try {
            const deviceId = req.params.id;
            const device = await devicesService.getDeviceById(deviceId);
            
            res.render('devices/views/confirm-delete', {
                title: 'Xác nhận xóa thiết bị',
                currentPage: 'devices',
                sidebarType: 'qltb-sidebar',
                device,
                user: req.user || { role: 'ql_thiet_bi' },
                messages: {
                    success: req.session?.flash?.success || null,
                    error: req.session?.flash?.error || null
                }
            });
        } catch (error) {
            console.error('Error rendering delete device page:', error);
            if (!req.session.flash) req.session.flash = {};
            req.session.flash.error = error.message;
            res.redirect('/manager/devices');
        }
    }

    // POST /devices/delete/:id - Xóa thiết bị
    async deleteDevice(req, res) {
        try {
            const deviceId = req.params.id;
            await devicesService.deleteDevice(deviceId);
            if (!req.session.flash) req.session.flash = {};
            req.session.flash.success = 'Xóa thiết bị thành công';
            res.redirect('/manager/devices');
        } catch (error) {
            console.error('Error deleting device:', error);
            if (!req.session.flash) req.session.flash = {};
            req.session.flash.error = error.message;
            res.redirect(`/manager/devices/delete/${req.params.id}`);
        }
    }
}

module.exports = new DevicesController();

