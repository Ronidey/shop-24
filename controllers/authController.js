const { promisify } = require('util');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

async function sendResWithToken(res, statusCode, user) {
  const token = await promisify(jwt.sign)(
    { id: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES
    }
  );

  res.cookie('jwt', token, {
    maxAge: 1000 * 60 * 60 * 24, // cookie expires 1d
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict'
  });

  res.status(statusCode).json({
    status: 'success',
    token
  });
}

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  });

  if (!user) return next(new AppError('Invalid inputs!', 400));

  sendResWithToken(res, 201, user);
});

exports.login = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).select(
    '+password'
  );

  if (!user)
    return next(
      new AppError("Email address doesn't exist!!! please Sign up.", 400)
    );

  const isMatch = await bcryptjs.compare(req.body.password, user.password);

  if (!isMatch) return next(new AppError('Invalid Email and Password!!.', 400));

  sendResWithToken(res, 200, user);
});

exports.logout = (req, res) => {
  res.cookie('jwt', '', {
    maxAge: 1000 * 2,
    httpOnly: true
  });

  res.status(200).json({
    status: 'success'
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  if (!req.cookies.jwt)
    return next(new AppError('You are not authenticated! please login.', 401));

  const decoded = await promisify(jwt.verify)(
    req.cookies.jwt,
    process.env.JWT_SECRET
  );

  const user = await User.findById(decoded.id);

  if (!user) return next(new AppError('Invalid token!! Please login.', 401));

  req.currentUser = user;
  res.locals.currentUser = user;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  if (!req.cookies.jwt) return next();

  try {
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user) return next();

    req.currentUser = user;
    res.locals.currentUser = user;
    next();
  } catch (err) {
    next();
  }
};
