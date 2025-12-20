const express = require('express');
const path = require('path');
const multer = require('multer');

const router = express.Router();
const controller = require('../controllers/periodic.controller');

// cấu hình upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(
      null,
      path.join(__dirname, '../../../../public/uploads/devices')
    );
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, safeName + ext);
  }
});


const upload = multer({ storage });

// LIST
router.get('/', controller.getReportListPage);

// CREATE
router.get('/create', controller.getCreateReportPage);
router.post('/', upload.single('file'), controller.createReport);

// EXPORT đặt trước /:id
router.get('/export', controller.exportReport);

// DETAIL
router.get('/:id', controller.getReportDetailPage);

// UPDATE
router.post('/:id', controller.updateReport);

// DELETE
router.post('/:id/delete', controller.deleteReport);

// DOWNLOAD
router.get('/:id/download', controller.downloadReportFile);

// PLACEHOLDER
router.post('/:id/item/:itemId/status', controller.updateItemStatus);

module.exports = router;
