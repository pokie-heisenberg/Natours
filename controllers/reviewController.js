const Booking = require('../models/bookingModels');
const appError = require('../utils/appError');
const catchAsyncError = require('../utils/catchAsyncError');
const Review = require('./../models/reviewModels');
const factoryFunction = require('./factoryFunction');
exports.setUserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.isBooked = catchAsyncError(async (req, res, next) => {
  const booking = await Booking.findOne({
    user: req.body.user,
    tour: req.body.tour,
  });
  if (!booking)
    return next(new appError('Please book the tour before reviewing it!', 400));
  next();
});
exports.getAllReviews = factoryFunction.getAll(Review);
exports.getOneReview = factoryFunction.getOne(Review);
exports.createReviews = factoryFunction.createOne(Review);
exports.deleteReview = factoryFunction.deleteOne(Review);
exports.updateReview = factoryFunction.updateOne(Review);
