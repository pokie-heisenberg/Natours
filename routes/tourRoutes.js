const express = require('express');
const tourControllers = require('./../controllers/tourControllers');
const router = express.Router();
const authController = require('./../controllers/authController');
// const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./../routes/reviewRoutes');
// router.param('id', tourControllers.checkID); // param middleware act on parameter id ;
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictedTo('user'),
//     reviewController.createReviews
//   );
router.use('/:tourId/reviews', reviewRouter);
router
  .route('/top-5-bestAndCheap')
  .get(tourControllers.aliasingTopTours, tourControllers.getAllTours);
router.route('/tourStats').get(tourControllers.getAllToursStats);
router
  .route('/montly-Plan/:year')
  .get(
    authController.protect,
    authController.restrictedTo('admin', 'lead-guide'),
    tourControllers.getMonthlyPlan
  );
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourControllers.getToursWithin);
router
  .route('/')
  .get(tourControllers.getAllTours)
  .post(
    authController.protect,
    authController.restrictedTo('admin', 'lead-guide'),
    tourControllers.createTour
  );
router.route('/distances/:latlng/unit/:unit').get(tourControllers.getDistances);
router
  .route('/:id')
  .get(tourControllers.getTour)
  .patch(
    authController.protect,
    authController.restrictedTo('admin', 'lead-guide'),
    tourControllers.uploadTourImages,
    tourControllers.resizeTourimages,
    tourControllers.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictedTo('admin', 'lead-guide'),
    tourControllers.deleteTour
  );

module.exports = router;
