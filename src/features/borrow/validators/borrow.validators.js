// Borrow Validators
const { body, param, query } = require('express-validator');

const createBorrowRequest = [
    body('devices')
        .isArray({ min: 1 })
        .withMessage('Vui lòng chọn ít nhất một thiết bị'),
    
    body('devices.*.deviceId')
        .isInt({ min: 1 })
        .withMessage('Mã thiết bị không hợp lệ'),
    
    body('devices.*.quantity')
        .isInt({ min: 1 })
        .withMessage('Số lượng mượn phải lớn hơn 0'),
    
    body('borrowDate')
        .isISO8601()
        .withMessage('Ngày mượn không hợp lệ')
        .custom((value) => {
            // Reset time về 00:00:00 để chỉ so sánh ngày
            const borrowDate = new Date(value);
            borrowDate.setHours(0, 0, 0, 0);
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            // Phải đăng ký ít nhất 1 ngày trước (tức là >= tomorrow)
            if (borrowDate < tomorrow) {
                throw new Error('Cần đăng ký sớm hơn (≥1 ngày) trước buổi dạy');
            }
            return true;
        }),
    
    body('returnDate')
        .isISO8601()
        .withMessage('Ngày trả không hợp lệ')
        .custom((value, { req }) => {
            const returnDate = new Date(value);
            const borrowDate = new Date(req.body.borrowDate);
            
            if (returnDate < borrowDate) {
                throw new Error('Ngày trả phải sau hoặc bằng ngày mượn');
            }
            return true;
        }),
    
    body('sessionTime')
        .isIn(['sang', 'chieu'])
        .withMessage('Ca dạy không hợp lệ'),
    
    body('content')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Nội dung dạy học phải từ 10-500 ký tự')
];

const getBorrowSlip = [
    param('id')
        .matches(/^PM\d{6}$/)
        .withMessage('Mã phiếu mượn không hợp lệ')
];

const getDevices = [
    query('category')
        .optional()
        .isIn(['chemistry', 'it', 'literature', 'physics'])
        .withMessage('Danh mục không hợp lệ'),
    
    query('class')
        .optional()
        .isIn(['6', '7', '8', '9'])
        .withMessage('Lớp không hợp lệ'),
    
    query('status')
        .optional()
        .isIn(['available', 'borrowed'])
        .withMessage('Trạng thái không hợp lệ'),
    
    query('condition')
        .optional()
        .isIn(['good', 'damaged'])
        .withMessage('Tình trạng không hợp lệ'),
    
    query('search')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Từ khóa tìm kiếm không hợp lệ')
];

module.exports = {
    createBorrowRequest,
    getBorrowSlip,
    getDevices
};
