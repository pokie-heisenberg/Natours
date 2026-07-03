const express = require('express');
const reviewController = require('./../controllers/reviewController');
const router = express.Router({ mergeParams: true });
const authController = require('./../controllers/authController');
router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictedTo('user'),
    reviewController.setUserId,
    reviewController.isBooked,
    reviewController.createReviews
  );
router
  .route('/:id')
  .get(reviewController.getOneReview)
  .patch(authController.restrictedTo('user'), reviewController.updateReview)
  .delete(authController.restrictedTo('user'), reviewController.deleteReview);
module.exports = router;
