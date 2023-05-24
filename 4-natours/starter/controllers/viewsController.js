const Tours = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync( async (req, res, next) => {
    const tours = await Tours.find();

    res.status(200).render('overview', {
        title: 'All products',
        tours
    })
});

exports.getTour = catchAsync( async (req, res, next) => {
    //1) Get data for the req tour (including reviews and tour guides)
    //2) Template
    //3) Render template using the data from step
    const tour = await Tours.findOne({ slug: req.params.tourName}).populate({
        path: 'reviews',
        fields: 'review rating user'
    });
    console.log(tour.name);
    res.status(200).render('tour', {
        title: tour.name,
        tour
    })
});