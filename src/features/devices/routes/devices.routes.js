// Devices Routes - Quản lý thiết bị (QLTB)
const express = require('express');
const router = express.Router();
const devicesController = require('../controllers/devices.controller');
const { authenticate, requireRole } = require('../../../core/middlewares/auth.middleware');
const { validate } = require('../../../core/middlewares/validation.middleware');
const { validateCreateDevice, validateUpdateDevice } = require('../validators/devices.validators');
const { upload } = require('../../../config/upload');

// Apply auth middleware to all routes
router.use(authenticate);
router.use(requireRole('ql_thiet_bi'));

// GET Routes - Pages
router.get('/', devicesController.getListPage);
router.get('/create', devicesController.getCreatePage);
router.get('/detail/:id', devicesController.getDetailPage);
router.get('/edit/:id', devicesController.getEditPage);
router.get('/delete/:id', devicesController.getDeletePage);

// POST Routes - Actions (Multiple image upload - max 5 images)
router.post('/create', upload.array('hinhAnh', 5), validate(validateCreateDevice), devicesController.createDevice);
router.post('/update/:id', upload.array('hinhAnh', 5), validate(validateUpdateDevice), devicesController.updateDevice);
router.post('/delete/:id', devicesController.deleteDevice);

module.exports = router;

