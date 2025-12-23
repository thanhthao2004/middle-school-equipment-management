// Borrow Validators with Strict Time Slot Validation
const { body, param, query } = require('express-validator');

/**
 * Helper: Get current shift based on EXACT school schedule
 * Morning (sang): 07:00 - 11:00
 * Lunch Break: 11:01 - 12:59 (treat as "between shifts")
 * Afternoon (chieu): 13:00 - 16:30
 * After Hours: After 16:30 (treat as "after afternoon")
 * 
 * @returns {string} - 'sang', 'chieu', 'lunch', or 'after_hours'
 */
function getCurrentShift() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const timeInMinutes = hour * 60 + minute;

    const MORNING_START = 7 * 60;      // 07:00 = 420 minutes
    const MORNING_END = 11 * 60;       // 11:00 = 660 minutes
    const AFTERNOON_START = 13 * 60;    // 13:00 = 780 minutes
    const AFTERNOON_END = 16 * 60 + 30; // 16:30 = 990 minutes

    if (timeInMinutes >= MORNING_START && timeInMinutes <= MORNING_END) {
        return 'sang';
    } else if (timeInMinutes >= AFTERNOON_START && timeInMinutes <= AFTERNOON_END) {
        return 'chieu';
    } else if (timeInMinutes > MORNING_END && timeInMinutes < AFTERNOON_START) {
        return 'lunch'; // Lunch break
    } else {
        return 'after_hours'; // Before 07:00 or after 16:30
    }
}

/**
 * Helper: Convert shift to numeric index for comparison
 */
function getShiftIndex(shift) {
    const shiftMap = { 'sang': 1, 'chieu': 2 };
    return shiftMap[shift] || 0;
}

const createBorrowRequest = [
    body('devices')
        .isArray({ min: 1 })
        .withMessage('Vui lòng chọn ít nhất một thiết bị'),

    body('devices.*.deviceId')
        .notEmpty()
        .withMessage('Mã thiết bị không hợp lệ'),

    body('devices.*.quantity')
        .isInt({ min: 1 })
        .withMessage('Số lượng mượn phải lớn hơn 0'),

    body('borrowDate')
        .isISO8601()
        .withMessage('Ngày mượn không hợp lệ')
        .custom((value) => {
            // Basic validation: borrow date must be today or future
            const borrowDate = new Date(value);
            borrowDate.setHours(0, 0, 0, 0);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (borrowDate < today) {
                throw new Error('Ngày mượn phải là hôm nay hoặc tương lai');
            }
            return true;
        }),

    body('returnDate')
        .isISO8601()
        .withMessage('Ngày trả không hợp lệ')
        .custom((value, { req }) => {
            const returnDate = new Date(value);
            returnDate.setHours(0, 0, 0, 0);

            const borrowDate = new Date(req.body.borrowDate);
            borrowDate.setHours(0, 0, 0, 0);

            if (returnDate < borrowDate) {
                throw new Error('Ngày trả phải sau hoặc bằng ngày mượn');
            }
            return true;
        }),

    body('sessionTime')
        .isIn(['sang', 'chieu'])
        .withMessage('Ca mượn không hợp lệ (phải là "sang" hoặc "chieu")')
        .custom((sessionTime, { req }) => {
            // CRITICAL: Same-day booking validation with EXACT shift times
            const borrowDate = new Date(req.body.borrowDate);
            borrowDate.setHours(0, 0, 0, 0);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // If booking for TODAY, apply strict shift rules
            if (borrowDate.getTime() === today.getTime()) {
                const currentShift = getCurrentShift();
                const requestedShiftIndex = getShiftIndex(sessionTime);

                // Rule Matrix:
                // Current Shift        | Can Book Today?
                // ---------------------|----------------------------------
                // sang (07:00-11:00)   | ✅ chieu (afternoon today)
                // chieu (13:00-16:30)  | ❌ None (must book tomorrow+)
                // lunch (11:01-12:59)  | ❌ None (must book tomorrow+)
                // after_hours (other)  | ❌ None (must book tomorrow+)

                if (currentShift === 'sang') {
                    // During morning shift: Can only book afternoon today
                    if (sessionTime !== 'chieu') {
                        throw new Error(
                            'Hiện tại đang trong ca Sáng (07:00-11:00). ' +
                            'Chỉ có thể đăng ký ca Chiều hôm nay hoặc các ca từ ngày mai.'
                        );
                    }
                } else if (currentShift === 'chieu') {
                    // During afternoon shift: Cannot book any shift today
                    throw new Error(
                        'Hiện tại đang trong ca Chiều (13:00-16:30). ' +
                        'Không thể đăng ký cho hôm nay. Vui lòng chọn từ ngày mai trở đi.'
                    );
                } else if (currentShift === 'lunch') {
                    // During lunch break: Cannot book any shift today
                    throw new Error(
                        'Hiện tại đang trong giờ nghỉ trưa (11:01-12:59). ' +
                        'Không thể đăng ký cho hôm nay. Vui lòng chọn từ ngày mai trở đi.'
                    );
                } else {
                    // After hours or before morning: Cannot book today
                    throw new Error(
                        'Ngoài giờ học chính (trước 07:00 hoặc sau 16:30). ' +
                        'Không thể đăng ký cho hôm nay. Vui lòng chọn từ ngày mai trở đi.'
                    );
                }
            }
            return true;
        }),

    body('sessionTimeReturn')
        .optional()
        .isIn(['sang', 'chieu'])
        .withMessage('Ca trả không hợp lệ (phải là "sang" hoặc "chieu")')
        .custom((sessionTimeReturn, { req }) => {
            if (!sessionTimeReturn) return true; // Optional field

            const borrowDate = new Date(req.body.borrowDate);
            borrowDate.setHours(0, 0, 0, 0);

            const returnDate = new Date(req.body.returnDate);
            returnDate.setHours(0, 0, 0, 0);

            const sessionTime = req.body.sessionTime;

            // If same day return, shift must be AFTER borrow shift
            if (borrowDate.getTime() === returnDate.getTime()) {
                const borrowShiftIndex = getShiftIndex(sessionTime);
                const returnShiftIndex = getShiftIndex(sessionTimeReturn);

                if (returnShiftIndex <= borrowShiftIndex) {
                    throw new Error(
                        'Ca trả phải sau ca mượn khi trả trong cùng ngày. ' +
                        '(Ví dụ: Mượn ca Sáng → Trả ca Chiều)'
                    );
                }
            }
            return true;
        }),

    body('content')
        .trim()
        .isLength({ min: 3, max: 500 })
        .withMessage('Nội dung dạy học phải từ 3-500 ký tự')
];

const getBorrowSlip = [
    param('id')
        .matches(/^PM\d{4,}$/)
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
    getDevices,
    // Export helpers for testing
    getCurrentShift,
    getShiftIndex
};
