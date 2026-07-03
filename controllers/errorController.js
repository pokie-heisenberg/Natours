const appError = require('../utils/appError');

const handleCastError = (err) => {
  const message = `Invalid ${err.path}:${err.value}.`;
  return new appError(message, 400);
};
const handleDuplicateFields = (err) => {
  // const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field}: ${value} already exits.try different name `;
  return new appError(message, 400);
};
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid data type: ${errors.join('. ')}`;
  return new appError(message, 400);
};
const handleJWTError = () =>
  new appError('Invalid Jsonwbetoke,Please log in again!', 401);
const handleTokenExpireError = () =>
  new appError('token has been expired,Please Login again', 401);
const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      console.error('error', err);
      res.status(500).json({
        status: 'error',
        message: 'something went wrong',
      });
    }
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).render('error', {
        title: 'something went wrong!',
        msg: err.message,
      });
    } else {
      console.error('error', err);
      res.status(err.statusCode).render('error', {
        title: 'something went wrong!',
        msg: 'try again later',
      });
    }
  }
};
const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      error: err,
      stack: err.stack,
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something Went Wrong!',
      msg: err.message,
    });
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = err;
  if (error.name === 'CastError') error = handleCastError(err);
  if (error.code === 11000) error = handleDuplicateFields(err);
  if (error.name === 'ValidationError') error = handleValidationError(err);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleTokenExpireError();
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProd(error, req, res);
  }
};
