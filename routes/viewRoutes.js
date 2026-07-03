const express = require('express');
const router = express.Router();
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingControllers');
router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewController.getSignForm);
router.get(
  '/forgot-password',
  authController.isLoggedIn,
  viewController.getForgotPasswordPage
);
router.get(
  '/resetPassword/:token',
  authController.isLoggedIn,
  viewController.getResetPasswordPage
);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);
// router.get('/')
module.exports = router;
