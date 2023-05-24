const Tours = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync( async (req, res, next) => {
    const tours = await Tours.find();

    res.status(200).render('overview', {
        title: 'All products',
        tours
    })
});

exports.getTour = (req, res) => {
    res.status(200).render('tour', {
        title: 'Сир Сулугуні'
    })
};