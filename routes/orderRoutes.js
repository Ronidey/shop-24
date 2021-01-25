const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/orderController');
const authCtrl = require('../controllers/authController');

router.use(authCtrl.protect);

router.route('/').get(orderCtrl.getAllMyOrders);
router.delete('/:id', orderCtrl.deleteMyOrder);
router.post('/checkout', orderCtrl.getStripeSession);

module.exports = router;
