const Product = require('../models/productModel');
const ApiFeature = require('../utils/apiFeature');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Order = require('../models/orderModel');

exports.renderHomepage = catchAsync(async (req, res, next) => {
  req.query.fields = 'title,price,imagePath';
  req.query.limit = 6;

  const feature = new ApiFeature(Product.find(), req.query)
    .filter()
    .sort()
    .select()
    .pagination();

  const products = await feature.query;

  const searchQuery = req.query.search
    ? { title: new RegExp(req.query.search, 'i') }
    : {};
  const totalResults = await Product.countDocuments(searchQuery);

  res.render('index', {
    metadata: {
      totalResults,
      results: products.length,
      limit: 6
    },
    title: 'Welcome',
    products
  });
});

exports.renderProductPage = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product)
    return next(new AppError('No result found with the given id', 404));

  res.render('product', {
    title: product.title,
    product
  });
});

exports.renderSignup = (req, res) => {
  res.render('signup', {
    title: 'Join Now'
  });
};

exports.renderLogin = (req, res) => {
  res.render('login', {
    title: 'Login'
  });
};

exports.renderProfile = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.currentUser._id }).sort(
    '-createdAt'
  );

  res.render('profile', {
    title: 'Profile',
    user: req.currentUser,
    orders
  });
});

exports.renderCart = (req, res) => {
  res.render('cart', {
    title: 'My Cart'
  });
};

exports.renderCheckoutPage = (req, res) => {
  res.render('checkout', {
    title: 'Checkout'
  });
};

exports.renderCheckoutSuccess = catchAsync(async (req, res, next) => {
  res.render('checkoutSuccess', {
    title: 'Hurray!!!'
  });
});
