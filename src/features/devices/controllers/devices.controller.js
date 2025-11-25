// Devices Controller
const devicesService = require('../services/devices.service');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../../public/uploads/devices');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'device-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file hình ảnh'));
        }
    }
});

class DevicesController {
    // GET /devices - Danh sách thiết bị
    async getListPage(req, res) {
        try {
            const filters = {
                search: req.query.search,
                category: req.query.category,
                maDM: req.query.maDM,
                tinhTrangThietBi: req.query.condition,
                viTriLuuTru: req.query.location,
                nguonGoc: req.query.supplier,
                ngayNhapFrom: req.query.dateFrom,
                ngayNhapTo: req.query.dateTo
            };
            
            const devices = await devicesService.getDevices(filters);
            const formData = await devicesService.getFormData();
            
            res.render('devices/views/list', {
                title: 'Quản lý thiết bị',
                currentPage: 'devices',
                devices: devices,
                categories: formData.categories,
                suppliers: formData.suppliers
            });
        } catch (error) {
            console.error('Error rendering devices list page:', error);
            res.status(500).send(error.message);
        }
    }
    
    // GET /devices/create - Form thêm thiết bị
    async getCreatePage(req, res) {
        try {
            const formData = await devicesService.getFormData();
            
            res.render('devices/views/create', {
                title: 'Thêm thiết bị mới',
                currentPage: 'devices',
                categories: formData.categories,
                suppliers: formData.suppliers
            });
        } catch (error) {
            console.error('Error rendering create device page:', error);
            res.status(500).send(error.message);
        }
    }
    
    // POST /devices - Tạo thiết bị mới
    async createDevice(req, res) {
        try {
            const deviceData = {
                tenTB: req.body.tenTB,
                category: req.body.category,
                maDM: req.body.maDM,
                unit: req.body.unit,
                classes: req.body.classes,
                soLuong: req.body.soLuong,
                status: req.body.status || 'Có sẵn',
                tinhTrangThietBi: req.body.tinhTrang || req.body.tinhTrangThietBi,
                viTriLuuTru: req.body.viTriLuuTru,
                supplier: req.body.supplier,
                nguonGoc: req.body.supplier,
                ngayNhap: req.body.ngayNhap,
                hinhAnh: req.file ? `/public/uploads/devices/${req.file.filename}` : '',
                huongDanSuDung: req.body.huongDanSuDung || ''
            };
            
            const device = await devicesService.createDevice(deviceData);
            
            res.json({
                success: true,
                message: 'Thêm thiết bị thành công.',
                data: device
            });
        } catch (error) {
            console.error('Error creating device:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Có lỗi xảy ra khi thêm thiết bị'
            });
        }
    }
    
    // GET /devices/:id/edit - Form sửa thiết bị
    async getEditPage(req, res) {
        try {
            const deviceId = req.params.id;
            const device = await devicesService.getDeviceById(deviceId);
            const formData = await devicesService.getFormData();
            
            res.render('devices/views/edit', {
                title: 'Sửa thiết bị',
                currentPage: 'devices',
                device: device,
                categories: formData.categories,
                suppliers: formData.suppliers
            });
        } catch (error) {
            console.error('Error rendering edit device page:', error);
            res.status(404).send(error.message || 'Thiết bị không tồn tại');
        }
    }
    
    // PUT /devices/:id - Cập nhật thiết bị
    async updateDevice(req, res) {
        try {
            const deviceId = req.params.id;
            const updateData = {
                tenTB: req.body.tenTB,
                category: req.body.category,
                maDM: req.body.maDM,
                unit: req.body.unit,
                classes: req.body.classes,
                soLuong: req.body.soLuong,
                status: req.body.status,
                tinhTrang: req.body.tinhTrang,
                tinhTrangThietBi: req.body.tinhTrang || req.body.tinhTrangThietBi,
                viTriLuuTru: req.body.viTriLuuTru,
                supplier: req.body.supplier,
                nguonGoc: req.body.supplier,
                ngayNhap: req.body.ngayNhap,
                huongDanSuDung: req.body.huongDanSuDung || ''
            };
            
            // Handle image upload if new file is provided
            if (req.file) {
                updateData.hinhAnh = `/public/uploads/devices/${req.file.filename}`;
            }
            
            const device = await devicesService.updateDevice(deviceId, updateData);
            
            res.json({
                success: true,
                message: 'Sửa thiết bị thành công!',
                data: device
            });
        } catch (error) {
            console.error('Error updating device:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Có lỗi xảy ra khi sửa thiết bị'
            });
        }
    }
    
    // DELETE /devices/:id - Xóa thiết bị
    async deleteDevice(req, res) {
        try {
            const deviceId = req.params.id;
            await devicesService.deleteDevice(deviceId);
            
            res.json({
                success: true,
                message: 'Xóa thiết bị thành công!'
            });
        } catch (error) {
            console.error('Error deleting device:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Có lỗi xảy ra khi xóa thiết bị'
            });
        }
    }
    
    // GET /devices/search - Tìm kiếm thiết bị
    async searchDevices(req, res) {
        try {
            const filters = {
                search: req.query.q || req.query.search,
                category: req.query.category,
                maDM: req.query.maDM,
                tinhTrangThietBi: req.query.condition,
                viTriLuuTru: req.query.location,
                nguonGoc: req.query.supplier,
                ngayNhapFrom: req.query.dateFrom,
                ngayNhapTo: req.query.dateTo
            };
            
            const devices = await devicesService.getDevices(filters);
            const formData = await devicesService.getFormData();
            
            res.render('devices/views/search', {
                title: 'Tìm kiếm thiết bị',
                currentPage: 'devices',
                devices: devices,
                categories: formData.categories,
                suppliers: formData.suppliers,
                filters: filters
            });
        } catch (error) {
            console.error('Error searching devices:', error);
            res.status(500).send(error.message);
        }
    }
}

// Export controller instance and upload middleware
module.exports = new DevicesController();
module.exports.upload = upload.single('hinhAnh');

