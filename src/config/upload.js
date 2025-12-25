/**
 * Multer Upload Configuration
 * Xử lý upload file cho ứng dụng
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa tồn tại
const uploadDir = path.join(__dirname, '../../public/uploads/devices');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Đảm bảo folder tồn tại
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        console.log('[UPLOAD] Saving to:', uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Tạo tên file unique: timestamp-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `${sanitizedName}-${uniqueSuffix}${ext}`;
        console.log('[UPLOAD] Generated filename:', filename);
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

// Upload middleware
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: fileFilter
});

// Helper function: Xóa file cũ
const deleteOldFile = (filePath) => {
    if (!filePath) return;

    // Chỉ xóa file trong thư mục uploads
    if (filePath.startsWith('/uploads/')) {
        const fullPath = path.join(__dirname, '../../public', filePath);
        if (fs.existsSync(fullPath)) {
            try {
                fs.unlinkSync(fullPath);
                console.log(`Deleted old file: ${filePath}`);
            } catch (error) {
                console.error(`Error deleting file ${filePath}:`, error);
            }
        }
    }
};

/**
 * Helper to delete multiple old files
 * @param {Array<string>} filePaths - Array of file paths to delete
 */
function deleteMultipleFiles(filePaths) {
    if (!Array.isArray(filePaths) || filePaths.length === 0) {
        console.log('[DELETE] No files to delete');
        return;
    }

    console.log(`[DELETE] Deleting ${filePaths.length} files:`, filePaths);
    filePaths.forEach(filePath => {
        deleteOldFile(filePath);
    });
}

module.exports = { upload, deleteOldFile, deleteMultipleFiles };
