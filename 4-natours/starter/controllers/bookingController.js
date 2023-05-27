const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.getCheckOutSession = catchAsync( async (req, res, next) => {
    // 1) get booked product
    const tour = await Tour.findById(req.params.tourID);
    // 2) create checkout session

    // 3) send to client
});