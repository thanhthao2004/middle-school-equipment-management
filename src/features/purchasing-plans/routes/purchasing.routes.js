const express = require('express');
const router = express.Router();

// Temporary routes for purchasing plans (using in-memory sample data)

function samplePlans() {
    return [
        { id: 1, code: 'KH001', schoolYear: '2019-2020', status: 'approved' },
        { id: 2, code: 'KH002', schoolYear: '2020-2021', status: 'approved' },
        { id: 3, code: 'KH003', schoolYear: '2021-2022', status: 'approved' },
        { id: 4, code: 'KH004', schoolYear: '2022-2023', status: 'approved' },
        { id: 5, code: 'KH005', schoolYear: '2023-2024', status: 'approved' },
        { id: 6, code: 'KH006', schoolYear: '2024-2025', status: 'approved' },
        { id: 7, code: 'KH007', schoolYear: '2025-2026', status: 'pending' }
    ];
}

function sampleYears() {
    return ['2019-2020', '2020-2021', '2021-2022', '2022-2023', '2023-2024', '2024-2025', '2025-2026'];
}

function getPlanById(id) {
    const plans = samplePlans();
    return plans.find(p => String(p.id) === String(id)) || null;
}

// List purchasing plans
router.get('/', (req, res) => {
    const plans = samplePlans();
    const years = sampleYears();
    res.render('purchasing-plans/views/list', { 
        title: 'Quản lý kế hoạch mua sắm', 
        plans, 
        years,
        user: req.user || { role: 'to_truong' }
    });
});

// Render create form
router.get('/create', (req, res) => {
    res.render('purchasing-plans/views/create', { 
        title: 'Lập kế hoạch mua sắm', 
        plan: {},
        user: req.user || { role: 'to_truong' }
    });
});

// Create action (temporary: redirect back to list)
router.post('/', (req, res) => {
    // TODO: persist new plan using controller/repository
    // Check if user is principal, redirect to principal route, else teacher route
    const userRole = req.user?.role || 'to_truong';
    if (userRole === 'hieu_truong') {
        return res.redirect('/principal/purchasing-plans');
    }
    return res.redirect('/teacher/purchasing-plans');
});

// View a single plan (render edit view in read-only mode)
router.get('/:id', (req, res) => {
    const plan = getPlanById(req.params.id);
    if (!plan) return res.status(404).send('Kế hoạch không tồn tại');
    res.render('purchasing-plans/views/edit', { title: 'Xem kế hoạch', plan, readOnly: true });
});

// Render edit form
router.get('/:id/edit', (req, res) => {
    const plan = getPlanById(req.params.id);
    if (!plan) return res.status(404).send('Kế hoạch không tồn tại');
    res.render('purchasing-plans/views/edit', { title: 'Sửa kế hoạch', plan, readOnly: false });
});



// Update action (temporary)
router.put('/:id', (req, res) => {
    // TODO: update plan
    const userRole = req.user?.role || 'to_truong';
    if (userRole === 'hieu_truong') {
        return res.redirect('/principal/purchasing-plans');
    }
    return res.redirect('/teacher/purchasing-plans');
});

// Delete action (temporary)
router.delete('/:id', (req, res) => {
    // TODO: delete plan
    const userRole = req.user?.role || 'to_truong';
    if (userRole === 'hieu_truong') {
        return res.redirect('/principal/purchasing-plans');
    }
    return res.redirect('/teacher/purchasing-plans');
});

// =============================================
// PRINCIPAL ROUTES (Hiệu trưởng - Duyệt mua sắm)
// =============================================
// GET /purchasing-plans/approve - Danh sách kế hoạch cần duyệt
router.get('/approve', (req, res) => {
    const plans = samplePlans().filter(p => p.status === 'pending');
    res.render('purchasing-plans/views/list', { 
        title: 'Duyệt kế hoạch mua sắm', 
        plans,
        years: sampleYears(),
        currentPage: 'purchasing-approve',
        user: req.user || { role: 'hieu_truong' }
    });
});

// Approve page for specific plan
router.get('/:id/approve', (req, res) => {
    const plan = getPlanById(req.params.id);
    if (!plan) return res.status(404).send('Kế hoạch không tồn tại');
    res.render('purchasing-plans/views/edit', { 
        title: 'Duyệt kế hoạch', 
        plan,
        currentPage: 'purchasing-approve',
        user: req.user || { role: 'hieu_truong' }
    });
});

// Approve action (temporary)
router.post('/:id/approve', (req, res) => {
    // TODO: perform approve
    const userRole = req.user?.role || 'hieu_truong';
    if (userRole === 'hieu_truong') {
        return res.redirect('/principal/purchasing-plans/approve');
    }
    return res.redirect('/teacher/purchasing-plans');
});

module.exports = router;
