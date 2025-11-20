const express = require('express');
const router = express.Router();

// NOTE: controllers are not implemented yet in this project. To keep
// behavior consistent with the previous temporary routes in `app.js`
// we return sample data and render the existing views under
// `purchasing-plans/views`.

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

// List purchasing plans
router.get('/', (req, res) => {
    const plans = samplePlans();
    const years = sampleYears();
    res.render('purchasing-plans/views/list', { title: 'Quản lý kế hoạch mua sắm', plans, years });
});

// Render create form
router.get('/create', (req, res) => {
    res.render('purchasing-plans/views/create', { title: 'Lập kế hoạch mua sắm', plan: {} });
});

// Create action (temporary: redirect back to list)
router.post('/', (req, res) => {
    // TODO: persist new plan using controller/repository
    return res.redirect('/purchasing-plans');
});

// View a single plan (render edit view in read-only mode)
router.get('/:id', (req, res) => {
    const plans = samplePlans();
    const plan = plans.find(p => String(p.id) === String(req.params.id)) || null;
    if (!plan) return res.status(404).send('Kế hoạch không tồn tại');
    // reuse edit view for display with a flag
    res.render('purchasing-plans/views/edit', { title: 'Xem kế hoạch', plan, readOnly: true });
});

// Render edit form
router.get('/:id/edit', (req, res) => {
    const plans = samplePlans();
    const plan = plans.find(p => String(p.id) === String(req.params.id)) || null;
    if (!plan) return res.status(404).send('Kế hoạch không tồn tại');
    res.render('purchasing-plans/views/edit', { title: 'Sửa kế hoạch', plan, readOnly: false });
});

// Update action (temporary)
router.put('/:id', (req, res) => {
    // TODO: update plan
    return res.redirect('/purchasing-plans');
});

// Delete action (temporary)
router.delete('/:id', (req, res) => {
    // TODO: delete plan
    return res.redirect('/purchasing-plans');
});

// Approve page
router.get('/:id/approve', (req, res) => {
    const plans = samplePlans();
    const plan = plans.find(p => String(p.id) === String(req.params.id)) || null;
    if (!plan) return res.status(404).send('Kế hoạch không tồn tại');
    res.render('purchasing-plans/views/approve', { title: 'Duyệt kế hoạch', plan });
});

// Approve action (temporary)
router.post('/:id/approve', (req, res) => {
    // TODO: perform approve
    return res.redirect('/purchasing-plans');
});

module.exports = router;
