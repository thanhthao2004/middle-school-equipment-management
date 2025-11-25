// Devices Routes
const express = require('express');
const router = express.Router();
const devicesController = require('../controllers/devices.controller');
const { authenticate } = require('../../../core/middlewares/auth.middleware');
const { validate } = require('../../../core/middlewares/validation.middleware');
const devicesValidators = require('../validators/devices.validators');
const methodOverride = require('method-override');

// Use method-override for PUT/DELETE requests
router.use(methodOverride('_method'));

// Apply auth middleware to all routes
router.use(authenticate);

// GET Routes - Pages
router.get('/', devicesController.getListPage);
router.get('/create', devicesController.getCreatePage);
router.get('/search', devicesController.searchDevices);
router.get('/:id/edit', devicesController.getEditPage);

// POST Routes - Actions
router.post('/',
    devicesController.upload,
    validate(devicesValidators.createDevice),
    devicesController.createDevice
);

// PUT Routes - Update
router.put('/:id',
    devicesController.upload,
    validate(devicesValidators.updateDevice),
    devicesController.updateDevice
);

// DELETE Routes
router.delete('/:id',
    validate(devicesValidators.deleteDevice),
    devicesController.deleteDevice
);

module.exports = router;

