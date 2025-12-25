const express = require('express');
const router = express.Router();
const trainingRepo = require('../repositories/training.repo');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình upload riêng cho Training Plans
const uploadDir = path.join(process.cwd(), 'public/uploads/reports');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
        cb(null, `${name}-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    // limits: { fileSize: ... }, // Đã gỡ bỏ giới hạn dung lượng theo yêu cầu
    fileFilter: (req, file, cb) => {
        const isPdf = path.extname(file.originalname).toLowerCase() === '.pdf' &&
            file.mimetype === 'application/pdf';
        if (isPdf) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file định dạng PDF'), false);
        }
    }
});

function sampleYears() {
    return ['2019-2020', '2020-2021', '2021-2022', '2022-2023', '2023-2024', '2024-2025', '2025-2026'];
}

// List training plans
router.get('/', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            console.warn('GET /training-plans: DB not connected');
        }

        const queryYear = req.query.year || '';
        const filter = queryYear ? { namHoc: queryYear } : {};
        const trainingPlans = await trainingRepo.findAll(filter);
        const years = sampleYears();

        const isPrincipal = req.baseUrl.includes('/principal');
        const userRole = isPrincipal ? 'hieu_truong' : 'to_truong';

        res.render('training-plans/views/list', {
            title: 'Xem kế hoạch đào tạo',
            trainingPlans,
            years,
            queryYear,
            currentPage: 'trainingPlans',
            user: req.user || { role: userRole }
        });
    } catch (error) {
        console.error('Error fetching training plans:', error);
        res.status(500).send('Lỗi máy chủ khi tải danh sách kế hoạch');
    }
});

// GET /training-plans/report - Xem báo cáo kế hoạch đào tạo
router.get('/report', async (req, res) => {
    try {
        const trainingPlans = await trainingRepo.findAll();
        const years = sampleYears();
        res.render('training-plans/views/report', {
            title: 'Báo cáo kế hoạch đào tạo',
            trainingPlans,
            years,
            user: req.user || { role: 'to_truong' }
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).send('Lỗi máy chủ khi tải báo cáo');
    }
});

// GET /create - Tạo kế hoạch đào tạo mới
router.get('/create', (req, res) => {
    const years = sampleYears();
    res.render('training-plans/views/create', {
        title: 'Tạo kế hoạch đào tạo',
        years,
        currentPage: 'trainingPlans',
        user: req.user || { role: 'hieu_truong' }
    });
});

// POST /create - Xử lý tạo kế hoạch đào tạo
router.post('/create', (req, res, next) => {
    upload.single('planFile')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).send(`Lỗi upload: ${err.message}`);
        } else if (err) {
            return res.status(400).send(err.message);
        }
        next();
    });
}, async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Cơ sở dữ liệu đang mất kết nối. Vui lòng thử lại sau.');
        }

        const { schoolYear, displayName } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).send('Vui lòng tải lên file PDF kế hoạch.');
        }

        const newPlan = {
            namHoc: schoolYear,
            tenHienThi: displayName,
            ngayLap: new Date(),
            tenFile: file.originalname,
            duongDanFile: `/uploads/reports/${file.filename}`
        };

        await trainingRepo.create(newPlan);

        const isAdminOrPrincipal = req.baseUrl.includes('/principal');
        const redirectPath = isAdminOrPrincipal ? '/principal/training-plans' : '/teacher/training-plans';

        res.redirect(redirectPath);
    } catch (error) {
        console.error('SERVER ERROR in POST /create:', error);
        res.status(500).send(`Lỗi máy chủ khi tạo kế hoạch: ${error.message}`);
    }
});

// View single plan
router.get('/:id', async (req, res) => {
    try {
        const plan = await trainingRepo.findById(req.params.id);
        if (!plan) return res.status(404).send('Kế hoạch không tồn tại');

        const isPrincipal = req.baseUrl.includes('/principal');
        const userRole = isPrincipal ? 'hieu_truong' : 'to_truong';

        res.render('training-plans/views/edit', {
            title: 'Xem kế hoạch',
            plan,
            readOnly: true,
            currentPage: 'trainingPlans',
            user: req.user || { role: userRole }
        });
    } catch (error) {
        console.error('Error fetching training plan details:', error);
        res.status(500).send('Lỗi máy chủ khi tải chi tiết kế hoạch');
    }
});

// DELETE plan
router.delete('/:id', async (req, res) => {
    try {
        const result = await trainingRepo.delete(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: 'Kế hoạch không tồn tại' });
        res.json({ success: true, message: 'Xóa kế hoạch thành công' });
    } catch (error) {
        console.error('Error deleting training plan:', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xóa kế hoạch' });
    }
});

module.exports = router;
