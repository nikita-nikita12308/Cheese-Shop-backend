const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');
//const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

router.get('/checkout-session/:tourId',
    authController.protect,
    bookingController.getCheckOutSession);

module.exports = router;