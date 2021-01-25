const AppError = require('../utils/appError');

const handleCastError = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleDuplicateError = (err) => {
  if (err.message.includes('email'))
    return new AppError(
      'Email already exists!!!, please login or singup with a New email.',
      400
    );
  else return new AppError(err.message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors)
    .map((err) => err.message)
    .join(', ');
  return new AppError(errors, 400);
};

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err
    });
  }

  res.render('error', {
    title: err.message,
    message: err.message
  });
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  res.render('error', {
    title: err.message,
    message: err.message,
    statusCode: err.statusCode
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // if (process.env.NODE_ENV === 'development') {
  //   return sendErrorDev(err, req, res);
  // }

  let error = { ...err };
  error.message = err.message;

  if (err.code === 11000) error = handleDuplicateError(err);
  if (err.name === 'ValidationError') error = handleValidationError(err);
  if (err.name === 'CastError') error = handleCastError(err);

  sendErrorProd(error, req, res);
};
