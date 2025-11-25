// Devices Validators
const { body, param, query } = require('express-validator');

const createDevice = [
    body('tenTB')
        .trim()
        .notEmpty()
        .withMessage('Vui lòng nhập tên thiết bị.')
        .isLength({ min: 1, max: 200 })
        .withMessage('Tên thiết bị phải từ 1-200 ký tự'),
    
    body('category')
        .notEmpty()
        .withMessage('Vui lòng chọn danh mục thiết bị.'),
    
    body('soLuong')
        .notEmpty()
        .withMessage('Số lượng tồn là bắt buộc.')
        .isInt({ min: 0 })
        .withMessage('Số lượng tồn phải là số nguyên không âm.'),
    
    body('viTriLuuTru')
        .notEmpty()
        .withMessage('Vui lòng chọn vị trí lưu trữ thiết bị.'),
    
    body('supplier')
        .notEmpty()
        .withMessage('Vui lòng chọn nhà cung cấp.'),
    
    body('ngayNhap')
        .notEmpty()
        .withMessage('Vui lòng chọn ngày nhập.')
        .isISO8601()
        .withMessage('Ngày nhập không hợp lệ.')
        .custom((value) => {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            
            if (selectedDate > today) {
                throw new Error('Ngày nhập không hợp lệ.');
            }
            return true;
        }),
    
    body('hinhAnh')
        .custom((value, { req }) => {
            // Check if file is uploaded
            if (!req.file) {
                throw new Error('Vui lòng chọn hình ảnh thiết bị.');
            }
            return true;
        })
];

const updateDevice = [
    param('id')
        .notEmpty()
        .withMessage('ID thiết bị là bắt buộc'),
    
    body('tenTB')
        .trim()
        .notEmpty()
        .withMessage('Vui lòng nhập tên thiết bị.')
        .isLength({ min: 1, max: 200 })
        .withMessage('Tên thiết bị phải từ 1-200 ký tự'),
    
    body('category')
        .notEmpty()
        .withMessage('Vui lòng chọn danh mục thiết bị.'),
    
    body('soLuong')
        .notEmpty()
        .withMessage('Số lượng tồn là bắt buộc.')
        .isInt({ min: 0 })
        .withMessage('Số lượng tồn phải là số nguyên không âm.'),
    
    body('viTriLuuTru')
        .notEmpty()
        .withMessage('Vui lòng chọn vị trí lưu trữ thiết bị.'),
    
    body('supplier')
        .notEmpty()
        .withMessage('Vui lòng chọn nhà cung cấp.'),
    
    body('ngayNhap')
        .notEmpty()
        .withMessage('Vui lòng chọn ngày nhập.')
        .isISO8601()
        .withMessage('Ngày nhập không hợp lệ.')
        .custom((value) => {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            
            if (selectedDate > today) {
                throw new Error('Ngày nhập không hợp lệ.');
            }
            return true;
        }),
    
    body('hinhAnh')
        .optional()
        .custom((value, { req }) => {
            // If file is uploaded, validate it
            if (req.file && !req.file.mimetype.startsWith('image/')) {
                throw new Error('Vui lòng chọn file hình ảnh hợp lệ.');
            }
            return true;
        })
];

const deleteDevice = [
    param('id')
        .notEmpty()
        .withMessage('ID thiết bị là bắt buộc')
];

const getDevices = [
    query('search')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Từ khóa tìm kiếm không hợp lệ'),
    
    query('category')
        .optional()
        .isString()
        .withMessage('Danh mục không hợp lệ'),
    
    query('condition')
        .optional()
        .isIn(['Tốt', 'Hỏng', 'Đang sửa chữa', 'Bảo trì'])
        .withMessage('Tình trạng không hợp lệ'),
    
    query('location')
        .optional()
        .isString()
        .withMessage('Vị trí không hợp lệ'),
    
    query('supplier')
        .optional()
        .isString()
        .withMessage('Nhà cung cấp không hợp lệ'),
    
    query('dateFrom')
        .optional()
        .isISO8601()
        .withMessage('Ngày bắt đầu không hợp lệ'),
    
    query('dateTo')
        .optional()
        .isISO8601()
        .withMessage('Ngày kết thúc không hợp lệ')
];

module.exports = {
    createDevice,
    updateDevice,
    deleteDevice,
    getDevices
};

