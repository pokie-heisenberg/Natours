const Tour = require('./../models/tourModels');
const catchAsyncError = require('./../utils/catchAsyncError');
const appError = require('./../utils/appError');
const Booking = require('../models/bookingModels');
exports.getOverview = catchAsyncError(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    tours,
  });
});
exports.getTour = catchAsyncError(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user createdAt',
    options: { sort: { createdAt: -1 } },
  });
  if (!tour) {
    return next(new appError('tour not found!', 404));
  }
  res.status(200).render('tours', {
    title: tour.name,
    tour,
  });
});
exports.getLoginForm = catchAsyncError(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'log in to your account',
  });
});
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};
exports.getSignForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Create new account!',
  });
};
exports.getForgotPasswordPage = (req, res) => {
  res.status(200).render('forgotPassword', {
    title: 'Forgot Password ?',
  });
};
exports.getResetPasswordPage = (req, res) => {
  res.status(200).render('resetPassword', {
    title: 'Reset Your Password',
    token: req.params.token,
  });
};
exports.getMyTours = catchAsyncError(async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id });
  const tourIds = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });
  res.status(200).render('overview', {
    title: 'My Bookings',
    tours,
  });
});
