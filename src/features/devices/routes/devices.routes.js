// Devices Routes - Quản lý thiết bị (QLTB)
const express = require('express');
const router = express.Router();
const devicesController = require('../controllers/devices.controller');
const { authenticate, requireRole } = require('../../../core/middlewares/auth.middleware');
const { validate } = require('../../../core/middlewares/validation.middleware');
const { validateCreateDevice, validateUpdateDevice } = require('../validators/devices.validators');

// Apply auth middleware to all routes
router.use(authenticate);
router.use(requireRole('ql_thiet_bi'));

// GET Routes - Pages
router.get('/', devicesController.getListPage);
router.get('/create', devicesController.getCreatePage);
router.get('/detail/:id', devicesController.getDetailPage);
router.get('/edit/:id', devicesController.getEditPage);
router.get('/delete/:id', devicesController.getDeletePage);

// POST Routes - Actions
router.post('/create', validate(validateCreateDevice), devicesController.createDevice);
router.post('/update/:id', validate(validateUpdateDevice), devicesController.updateDevice);
router.post('/delete/:id', devicesController.deleteDevice);

module.exports = router;

