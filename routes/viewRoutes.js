const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const viewCtrl = require('../controllers/viewController');
const OrderCtrl = require('../controllers/orderController');

router.get('/signup', viewCtrl.renderSignup);
router.get('/login', viewCtrl.renderLogin);

const redirectToLogin = (req, res, next) => {
  if (!req.currentUser) {
    return res
      .status(401)
      .redirect(`/login?error=${encodeURI('Please login first')}`);
  }
  next();
};

router.use(authCtrl.isLoggedIn);

router.get('/', viewCtrl.renderHomepage);
router.get('/products/:id', viewCtrl.renderProductPage);
router.get('/profile', redirectToLogin, viewCtrl.renderProfile);
router.get('/my-cart', viewCtrl.renderCart);
router.get(
  '/checkout-success',
  // OrderCtrl.createOrderCheckout,
  viewCtrl.renderCheckoutSuccess
);

module.exports = router;
