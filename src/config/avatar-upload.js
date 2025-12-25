/**
 * Avatar Upload Configuration
 * Xử lý upload avatar cho profile
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads/avatars nếu chưa tồn tại
const uploadDir = path.join(__dirname, '../../public/uploads/avatars');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình storage cho avatar
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Đảm bảo folder tồn tại
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Tên file: user-{userId}-timestamp.ext
        const userId = req.user?.id || 'unknown';
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const filename = `avatar-${userId}-${timestamp}${ext}`;
        cb(null, filename);
    }
});

// File filter - chỉ chấp nhận ảnh
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, webp)'));
    }
};

// Upload middleware cho avatar
const uploadAvatar = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: fileFilter
});

// Helper function: Xóa file avatar cũ
const deleteOldAvatar = (filePath) => {
    if (!filePath) return;

    // Chỉ xóa file trong thư mục avatars
    if (filePath.startsWith('/uploads/avatars/')) {
        const fullPath = path.join(__dirname, '../../public', filePath);
        if (fs.existsSync(fullPath)) {
            try {
                fs.unlinkSync(fullPath);
                console.log(`Deleted old avatar: ${filePath}`);
            } catch (error) {
                console.error(`Error deleting avatar ${filePath}:`, error);
            }
        }
    }
};

module.exports = { uploadAvatar, deleteOldAvatar };
