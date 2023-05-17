const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
//const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

//router.param('id', tourController.checkID)


router.use('/:tourId/reviews', reviewRouter);

router
  .route('/tour-stats')
  .get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(authController.protect,
      authController.restrictTo('admin', 'guide'),
      tourController.getMonthlyPlan);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(authController.protect,
      authController.restrictTo('admin', 'guide'),
      tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour,
      authController.protect,
      authController.restrictTo('admin'),)
  .delete(authController.protect,
      authController.restrictTo('admin'),
      tourController.deleteTour);


module.exports = router;