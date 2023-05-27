const express = require('express');
const bookingController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
//const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

router.get('/checkout-session/:tourID', authController.protect, bookingController.getCheckOutSession);

module.exports = router;