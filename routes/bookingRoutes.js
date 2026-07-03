const express = require('express');
const bookingController = require('./../controllers/bookingControllers');
const router = express.Router();
const authController = require('./../controllers/authController');
router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession
);

router.use(authController.protect);
router.use(authController.restrictedTo('admin'));
router
  .route('/')
  .get(bookingController.getAllBooking)
  .post(bookingController.createBooking);
router
  .route('/:id')
  .get(bookingController.getOneBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);
module.exports = router;
