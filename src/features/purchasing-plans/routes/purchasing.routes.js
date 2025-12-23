const express = require('express');
const router = express.Router();
const PurchasingController = require('../controllers/purchasing.controller');

// List purchasing plans
router.get('/', PurchasingController.listPlans);

// Render create form
router.get('/create', (req, res) => {
    res.render('purchasing-plans/views/create', {
        title: 'Lập kế hoạch mua sắm',
        plan: {},
        user: req.user || { role: 'to_truong' }
    });
});

// API: Get next plan code
router.get('/api/next-code', PurchasingController.getNextPlanCode);

// IMPORTANT: Define specific device APIs BEFORE dynamic `/api/:code` to avoid conflicts
// API: Get all categories for filter dropdown
router.get('/api/categories', PurchasingController.getCategories);

// API: Get all devices for selection modal
router.get('/api/devices', PurchasingController.getDevices);

// API: Get devices by category
router.get('/api/devices/category/:categoryId', PurchasingController.getDevicesByCategory);

// API: Get plan detail (must be after device APIs)
router.get('/api/:code', PurchasingController.getPlanDetailJson);

// View plan detail (by code)
router.get('/:code/detail', PurchasingController.getPlanDetail);

// Render edit form (by id)
router.get('/:id/edit', PurchasingController.getEditPage);

// Create action
router.post('/', PurchasingController.createPlan);

// Update action
router.put('/:id', PurchasingController.updatePlan);

// Delete action
router.delete('/:id', PurchasingController.deletePlan);

module.exports = router;
