const Product = require('../models/productModel');
const ApiFeature = require('../utils/apiFeature');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const feature = new ApiFeature(Product.find(), req.query)
    .filter()
    .sort()
    .select()
    .pagination();

  const products = await feature.query;
  const totalResults = await Product.countDocuments();

  res.status(200).json({
    status: 'success',
    totalResults,
    results: products.length,
    products
  });
});

exports.getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product)
    return next(new AppError('No product found with the given ID', 404));

  res.status(200).json({
    status: 'success',
    product
  });
});
