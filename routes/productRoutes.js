const express = require('express');
const router = express.Router();
const productCtrl = require('../controllers/productController');

router.get('/', productCtrl.getAllProducts);
router.get('/:id', productCtrl.getProductById);

module.exports = router;
