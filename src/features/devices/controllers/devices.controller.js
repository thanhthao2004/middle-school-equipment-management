const devicesService = require('../services/devices.service');
const path = require('path');
const fs = require('fs');
const { deleteOldFile, deleteMultipleFiles } = require('../../../config/upload');

/**
 * Helper: Lọc và làm sạch danh sách ảnh (loại bỏ duplicate, null, empty)
 * @param {Array} imagePaths - Mảng các đường dẫn ảnh
 * @returns {Array} - Mảng ảnh đã được lọc
 */
function cleanImagePaths(imagePaths) {
    if (!imagePaths) return [];
    
    // Normalize to array
    let images = Array.isArray(imagePaths) ? imagePaths : (imagePaths ? [imagePaths] : []);
    
    // Loại bỏ duplicate và giá trị rỗng
    const seen = new Set();
    return images.filter(imgPath => {
        if (!imgPath || typeof imgPath !== 'string' || !imgPath.trim()) {
            return false;
        }
        const normalized = imgPath.trim();
        if (seen.has(normalized)) {
            return false; // Duplicate
        }
        seen.add(normalized);
        return true;
    });
}

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
            const filterOptions = await devicesService.getFilterOptions();

            // Lấy formData từ session nếu có (sau validation fail)
            const formData = req.session?.flash?.formData || {};

            res.render('devices/views/create', {
                title: 'Thêm thiết bị mới',
                currentPage: 'devices',
                sidebarType: 'qltb-sidebar',
                categories,
                filterOptions,
                formData, // Truyền dữ liệu form cũ
                user: req.user || { role: 'ql_thiet_bi' },
                messages: {
                    success: req.session?.flash?.success || null,
                    error: req.session?.flash?.error || null,
                    validationErrors: req.session?.flash?.validationErrors || null
                }
            });

            // Clear flash data sau khi đã dùng
            if (req.session?.flash) {
                delete req.session.flash.formData;
            }
        } catch (error) {
            console.error('Error rendering create device page:', error);
            res.status(500).send(`<h1>Lỗi</h1><p>${error.message}</p>`);
        }
    }

    // POST /devices/create - Tạo thiết bị mới
    async createDevice(req, res) {
        try {
            const deviceData = req.body;

            // Validate image uploads (max 5 files, check type and size)
            if (req.files && req.files.length > 0) {
                console.log('[UPLOAD] Received files:', req.files.length);
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                const maxSize = 5 * 1024 * 1024; // 5MB

                // Check max 5 images
                if (req.files.length > 5) {
                    // Delete uploaded files
                    req.files.forEach(file => deleteOldFile(`/uploads/devices/${file.filename}`));
                    throw new Error('Chỉ được upload tối đa 5 ảnh');
                }

                // Validate each file
                for (const file of req.files) {
                    console.log('[UPLOAD] File:', file.filename, 'Path:', file.path, 'Size:', file.size);
                    if (!allowedTypes.includes(file.mimetype)) {
                        req.files.forEach(f => deleteOldFile(`/uploads/devices/${f.filename}`));
                        throw new Error(`File "${file.originalname}" không phải định dạng ảnh hợp lệ (JPG/PNG/GIF/WEBP)`);
                    }
                    if (file.size > maxSize) {
                        req.files.forEach(f => deleteOldFile(`/uploads/devices/${f.filename}`));
                        throw new Error(`File "${file.originalname}" vượt quá 5MB`);
                    }
                }

                deviceData.hinhAnh = req.files.map(file => `/uploads/devices/${file.filename}`);
                console.log('[UPLOAD] Saved image paths:', deviceData.hinhAnh);
            }

            // Convert empty strings to null/undefined for optional fields
            if (deviceData.ngayNhap === '') delete deviceData.ngayNhap;
            if (deviceData.category === '') delete deviceData.category;
            if (deviceData.soLuong === '') deviceData.soLuong = 0;
            else deviceData.soLuong = parseInt(deviceData.soLuong) || 0;

            const device = await devicesService.createDevice(deviceData);
            if (!req.session.flash) req.session.flash = {};
            req.session.flash.success = 'Thêm thiết bị thành công';

            // Clear formData sau khi thành công để không bị lưu lại
            delete req.session.flash.formData;
            delete req.session.flash.validationErrors;

            res.redirect(`/manager/devices`);
        } catch (error) {
            console.error('Error creating device:', error);
            // Xóa TẤT CẢ file đã upload nếu tạo device thất bại
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    deleteOldFile(`/uploads/devices/${file.filename}`);
                });
            }
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

            // Lọc ảnh trùng lặp trước khi hiển thị
            if (device.hinhAnh) {
                device.hinhAnh = cleanImagePaths(device.hinhAnh);
            }

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
            const [device, categories, filterOptions] = await Promise.all([
                devicesService.getDeviceById(deviceId),
                devicesService.getCategories(),
                devicesService.getFilterOptions()
            ]);

            // Lọc ảnh trùng lặp trước khi hiển thị
            if (device.hinhAnh) {
                device.hinhAnh = cleanImagePaths(device.hinhAnh);
            }

            // Lấy formData từ session nếu có (sau validation fail)
            const formData = req.session?.flash?.formData || {};

            // Lấy danh sách kỳ báo cáo cho filter (nếu có)
            let periods = [];
            try {
                const PeriodicReport = require('../../periodic-reports/models/periodic-report.model');
                periods = await PeriodicReport.distinct('kyBaoCao');
                if (!Array.isArray(periods)) {
                    periods = [];
                }
            } catch (err) {
                // Nếu không lấy được, để mảng rỗng
                console.warn('Could not load periods for filter:', err.message);
                periods = [];
            }

            res.render('devices/views/edit', {
                title: 'Sửa thiết bị',
                currentPage: 'devices',
                sidebarType: 'qltb-sidebar',
                device,
                categories,
                filterOptions,
                formData,
                periods: periods || [],
                user: req.user || { role: 'ql_thiet_bi' },
                messages: {
                    success: req.session?.flash?.success || null,
                    error: req.session?.flash?.error || null,
                    validationErrors: req.session?.flash?.validationErrors || null
                }
            });

            // Clear flash data sau khi đã dùng
            if (req.session?.flash) {
                delete req.session.flash.formData;
            }
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

            // Lấy device cũ để xử lý ảnh
            const oldDevice = await devicesService.getDeviceById(deviceId);
            // Lọc ảnh trùng lặp trước khi xử lý
            let oldImagePaths = cleanImagePaths(oldDevice.hinhAnh);

            // KIỂM TRA VÀ LOẠI BỎ ẢNH KHÔNG TỒN TẠI TRÊN DISK
            // Điều này xử lý trường hợp ảnh đã bị xóa khỏi disk nhưng vẫn còn trong database
            const originalImageCount = oldImagePaths.length;
            oldImagePaths = oldImagePaths.filter(imgPath => {
                if (!imgPath) return false;
                // Chỉ kiểm tra file trong thư mục uploads
                if (imgPath.startsWith('/uploads/')) {
                    const fullPath = path.join(__dirname, '../../../public', imgPath);
                    const exists = fs.existsSync(fullPath);
                    if (!exists) {
                        console.log(`[UPDATE] Image file not found on disk, removing from list: ${imgPath}`);
                    }
                    return exists;
                }
                return true; // Giữ lại nếu không phải đường dẫn uploads
            });

            // Nếu có ảnh bị loại bỏ do không tồn tại, log để theo dõi
            if (oldImagePaths.length < originalImageCount) {
                console.log(`[UPDATE] Removed ${originalImageCount - oldImagePaths.length} missing image(s) from database`);
            }
            console.log('[UPDATE] Valid images after checking disk:', oldImagePaths);

            // XỬ LÝ XÓA ảnh (nếu user click nút X)
            let imagesToDelete = [];
            if (deviceData.deletedImages) {
                console.log('[UPDATE] Raw deletedImages:', deviceData.deletedImages);
                try {
                    imagesToDelete = JSON.parse(deviceData.deletedImages);
                    console.log('[UPDATE] Parsed deletedImages:', imagesToDelete);
                    // Loại bỏ các ảnh bị xóa khỏi array
                    oldImagePaths = oldImagePaths.filter(img => !imagesToDelete.includes(img));
                    console.log('[UPDATE] Remaining images after filter:', oldImagePaths);
                } catch (e) {
                    console.error('[UPDATE] Error parsing deletedImages:', e);
                }
                delete deviceData.deletedImages; // Không lưu vào DB
            }

            // Xử lý upload ảnh mới (nếu có)
            if (req.files && req.files.length > 0) {
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                const maxSize = 5 * 1024 * 1024; // 5MB

                // Validate total image count (existing + new <= 5)
                if (oldImagePaths.length + req.files.length > 5) {
                    // Delete newly uploaded files
                    req.files.forEach(file => deleteOldFile(`/uploads/devices/${file.filename}`));
                    throw new Error(`Tổng số ảnh không được vượt quá 5. Hiện có ${oldImagePaths.length} ảnh, bạn đang thêm ${req.files.length} ảnh.`);
                }

                // Validate each new file
                for (const file of req.files) {
                    if (!allowedTypes.includes(file.mimetype)) {
                        req.files.forEach(f => deleteOldFile(`/uploads/devices/${f.filename}`));
                        throw new Error(`File "${file.originalname}" không phải định dạng ảnh hợp lệ (JPG/PNG/GIF/WEBP)`);
                    }
                    if (file.size > maxSize) {
                        req.files.forEach(f => deleteOldFile(`/uploads/devices/${f.filename}`));
                        throw new Error(`File "${file.originalname}" vượt quá 5MB`);
                    }
                }

                const newImagePaths = req.files.map(file => `/uploads/devices/${file.filename}`);
                // GỘP ảnh CÒN LẠI + ảnh mới (tối đa 5 ảnh)
                deviceData.hinhAnh = [...oldImagePaths, ...newImagePaths].slice(0, 5);
            } else {
                // Không upload mới → giữ ảnh còn lại sau khi xóa
                deviceData.hinhAnh = oldImagePaths;
            }

            // Convert empty strings to null/undefined for optional fields
            if (deviceData.ngayNhap === '') delete deviceData.ngayNhap;
            if (deviceData.category === '') delete deviceData.category;
            if (deviceData.soLuong === '') deviceData.soLuong = 0;
            else deviceData.soLuong = parseInt(deviceData.soLuong) || 0;

            // Xử lý trường lop (multi-select)
            if (deviceData.lop) {
                // Nếu là array (từ multi-select), giữ nguyên
                // Nếu là string (từ single select), chuyển thành array
                if (typeof deviceData.lop === 'string') {
                    deviceData.lop = deviceData.lop ? [deviceData.lop] : [];
                } else if (!Array.isArray(deviceData.lop)) {
                    deviceData.lop = [];
                }
            } else {
                deviceData.lop = [];
            }

            await devicesService.updateDevice(deviceId, deviceData);

            // XÓA các file ảnh đã bị remove khỏi disk
            if (imagesToDelete.length > 0) {
                deleteMultipleFiles(imagesToDelete);
            }

            if (!req.session.flash) req.session.flash = {};
            req.session.flash.success = 'Cập nhật thiết bị thành công';

            // Clear formData để không bị persist sang page khác
            delete req.session.flash.formData;
            delete req.session.flash.validationErrors;

            res.redirect(`/manager/devices/detail/${deviceId}`);
        } catch (error) {
            console.error('Error updating device:', error);
            // Xóa CÁC file mới upload nếu update thất bại
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    deleteOldFile(`/uploads/devices/${file.filename}`);
                });
            }
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

            // Lấy thông tin device để xóa TẤT CẢ ảnh
            const device = await devicesService.getDeviceById(deviceId);
            const imagePaths = device.hinhAnh; // Array of image paths

            await devicesService.deleteDevice(deviceId);

            // Xóa TẤT CẢ ảnh sau khi xóa device thành công
            if (imagePaths && imagePaths.length > 0) {
                deleteMultipleFiles(imagePaths);
            }

            if (!req.session.flash) req.session.flash = {};
            req.session.flash.success = 'Xóa thiết bị thành công';

            // Clear formData
            delete req.session.flash.formData;
            delete req.session.flash.validationErrors;

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