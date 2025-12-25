const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');

// Index - redirect to damaged summary
router.get('/', (req, res) => {
    return res.redirect('/teacher/reports/damaged-summary');
});

// Main damaged equipment report page
router.get('/damaged-summary', reportsController.getDamagedEquipmentReport);

// Alias for backward compatibility
router.get('/device-stats', reportsController.getDamagedEquipmentReport);

// Export damaged report as JSON
router.get('/damaged-summary/export', reportsController.exportDamagedReport);

module.exports = router;
