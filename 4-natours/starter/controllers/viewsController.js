const Tours = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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

    if(!tour) {
        return next(new AppError('There is no product with that name.', 404));
    }

    res.status(200).render('tour', {
        title: tour.name,
        tour
    })
});



exports.getLoginUserForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Login'
    })
};

exports.getRegisterUserForm = (req, res) => {
    res.status(200).render('register', {
        title: 'Register'
    })
};

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Мій кабінет'
    })
};

exports.getAdminBoard = (req, res) => {
    res.status(200).render('adminboard', {
        title: 'Адмін панель'
    })
};