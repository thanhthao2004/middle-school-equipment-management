const express = require('express');
const router = express.Router();
const productController = require('../../controllers/product/productController');

router.get('/', productController.index);
router.get('/create', productController.createForm);
router.post('/create', productController.create);

module.exports = router;