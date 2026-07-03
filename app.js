const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.set('trust proxy', 1);
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const appError = require('./utils/appError');
const rateLimiter = require('express-rate-limit');
const cookiePraser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const globalErrorHandler = require('./controllers/errorController');
const viewRouter = require('./routes/viewRoutes');
const compression = require('compression');
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// middleware

//1.set security headers
// app.use(helmet());
app.use(express.json()); // important The issue is that express-mongo-sanitize needs to work with already-parsed JSON data, but it's being applied before the request body is parsed from the raw buffer. This means the sanitization middleware has nothing to sanitize yet.
//2.data sanitization
app.use(mongoSanitize());
app.use(cookiePraser());
app.use(xss());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//prevent parameter pollution,
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
app.use(compression());
//rate limiter
const limiter = rateLimiter({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many requests,Try again after 1hour',
});
app.use('/api', limiter);
app.use((req, res, next) => {
  next();
});
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
  req.reqTime = new Date().toISOString();
  // Prevent browser from caching stale HTML to fix back button photo bug
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);
// unhandled routes
app.all('*', (req, res, next) => {
  next(new appError(`can't find ${req.originalUrl}`, 404));
});
//error handler
app.use(globalErrorHandler);
module.exports = app;
