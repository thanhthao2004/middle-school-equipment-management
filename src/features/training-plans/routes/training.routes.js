const express = require('express');
const router = express.Router();

// Temporary sample data for training plans
function sampleTrainingPlans() {
    return [
        { id: 1, code: 'KHDT001', schoolYear: '2019-2020', createdAt: '2019-08-07' },
        { id: 2, code: 'KHDT002', schoolYear: '2020-2021', createdAt: '2020-08-07' },
        { id: 3, code: 'KHDT003', schoolYear: '2021-2022', createdAt: '2021-08-07' },
        { id: 4, code: 'KHDT004', schoolYear: '2022-2023', createdAt: '2022-08-07' },
        { id: 5, code: 'KHDT005', schoolYear: '2023-2024', createdAt: '2023-08-07' },
        { id: 6, code: 'KHDT006', schoolYear: '2024-2025', createdAt: '2024-08-07' },
        { id: 7, code: 'KHDT007', schoolYear: '2025-2026', createdAt: '2025-08-07' }
    ];
}

function sampleYears() {
    return ['2019-2020', '2020-2021', '2021-2022', '2022-2023', '2023-2024', '2024-2025', '2025-2026'];
}

function getPlanById(id) {
    const plans = sampleTrainingPlans();
    return plans.find(p => String(p.id) === String(id)) || null;
}

// List training plans
router.get('/', (req, res) => {
    const trainingPlans = sampleTrainingPlans();
    const years = sampleYears();
    const queryYear = req.query.year || '';
    // Simple filter by year if provided
    const filtered = queryYear ? trainingPlans.filter(p => p.schoolYear === queryYear) : trainingPlans;
    
    // Xác định role từ URL path để hiển thị sidebar đúng
    const isPrincipal = req.path.includes('/principal/');
    const userRole = isPrincipal ? 'hieu_truong' : 'to_truong';
    
    res.render('training-plans/views/list', { 
        title: 'Xem kế hoạch đào tạo', 
        trainingPlans: filtered, 
        years, 
        queryYear,
        currentPage: 'trainingPlans',
        user: req.user || { role: userRole }
    });
});

// GET /training-plans/report - Xem báo cáo kế hoạch đào tạo (Tổ trưởng)
router.get('/report', (req, res) => {
    const trainingPlans = sampleTrainingPlans();
    const years = sampleYears();
    res.render('training-plans/views/report', { 
        title: 'Báo cáo kế hoạch đào tạo', 
        trainingPlans, 
        years,
        user: req.user || { role: 'to_truong' }
    });
});

// View single plan (use edit view in read-only mode)
router.get('/:id', (req, res) => {
    const plan = getPlanById(req.params.id);
    if (!plan) return res.status(404).send('Kế hoạch không tồn tại');
    
    // Xác định role từ URL path
    const isPrincipal = req.path.includes('/principal/');
    const userRole = isPrincipal ? 'hieu_truong' : 'to_truong';
    
    res.render('training-plans/views/edit', { 
        title: 'Xem kế hoạch', 
        plan,
        readOnly: true,
        currentPage: 'trainingPlans',
        user: req.user || { role: userRole }
    });
});

module.exports = router;
