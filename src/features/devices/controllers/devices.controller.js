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
                messages: {
                    success: req.flash('success')[0],
                    error: req.flash('error')[0]
                }
            });
        } catch (error) {
            console.error('Error rendering devices list page:', error);
            res.status(500).render('error', {
                title: 'Lỗi',
                message: error.message
            });
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
                messages: {
                    success: req.flash('success')[0],
                    error: req.flash('error')[0]
                }
            });
        } catch (error) {
            console.error('Error rendering create device page:', error);
            res.status(500).render('error', {
                title: 'Lỗi',
                message: error.message
            });
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
            req.flash('success', 'Thêm thiết bị thành công');
            res.redirect(`/devices`);
        } catch (error) {
            console.error('Error creating device:', error);
            req.flash('error', error.message);
            res.redirect('/devices/create');
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
                messages: {
                    success: req.flash('success')[0],
                    error: req.flash('error')[0]
                }
            });
        } catch (error) {
            console.error('Error rendering device detail page:', error);
            req.flash('error', error.message);
            res.redirect('/devices');
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
                messages: {
                    success: req.flash('success')[0],
                    error: req.flash('error')[0]
                }
            });
        } catch (error) {
            console.error('Error rendering edit device page:', error);
            req.flash('error', error.message);
            res.redirect('/devices');
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
            req.flash('success', 'Cập nhật thiết bị thành công');
            res.redirect(`/devices/detail/${deviceId}`);
        } catch (error) {
            console.error('Error updating device:', error);
            req.flash('error', error.message);
            res.redirect(`/devices/edit/${req.params.id}`);
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
                messages: {
                    success: req.flash('success')[0],
                    error: req.flash('error')[0]
                }
            });
        } catch (error) {
            console.error('Error rendering delete device page:', error);
            req.flash('error', error.message);
            res.redirect('/devices');
        }
    }

    // POST /devices/delete/:id - Xóa thiết bị
    async deleteDevice(req, res) {
        try {
            const deviceId = req.params.id;
            await devicesService.deleteDevice(deviceId);
            req.flash('success', 'Xóa thiết bị thành công');
            res.redirect('/devices');
        } catch (error) {
            console.error('Error deleting device:', error);
            req.flash('error', error.message);
            res.redirect(`/devices/delete/${req.params.id}`);
        }
    }
}

module.exports = new DevicesController();

