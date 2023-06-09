const axios = require('axios');

//const Tours = require('../models/tourModel');
const Products = require('../models/productModel');
const Bookings = require('../models/bookingModel');
const Reviews = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');



exports.getOverview = catchAsync( async (req, res, next) => {
    const products = await Products.find();

    res.status(200).render('overview', {
        title: 'All products',
        products
    })
});

exports.getProduct = catchAsync( async (req, res, next) => {
    const product = await Products.findOne({ slug: req.params.productName}).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if(!product) {
        return next(new AppError('There is no product with that name.', 404));
    }

    res.status(200).render('product', {
        title: product.name,
        product
    })
});

exports.getMyOrders = catchAsync(async (req, res, next) => {
    // 1) find Bookings
    const orders = await Bookings.find({user: req.user.id});
    // 2) find products with returned ids
    const productIDs = orders.map(el => el.product);
    const products = await Products.find({ _id: {$in: productIDs}});

    res.status(200).render('overview', {
        title: 'My Orders',
        products
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

exports.getMyReviews = async (req, res) => {
    const reviews = await Reviews.find({user: req.user.id}).populate({
        path: 'product',
        fields: 'name'
    });
    res.status(200).render('myReviews', {
        title: 'My Reviews',
        reviews
    })
};

exports.getMyBilling = async (req, res) => {
    const orders = await Bookings.find({user: req.user.id});
    res.status(200).render('paymentsHistory', {
        title: 'Платежі',
        orders
    })
};

exports.getChangeMyReviews = async (req, res) => {
    const review = await Reviews.find({_id: req.params.reviewId}).populate({
        path: 'product',
        fields: 'name'
    });
    res.status(200).render('changeMyReview', {
        title: 'Змінити Відгук',
        review
    })
};

exports.getManageProduct = catchAsync( async (req, res, next) => {
    const response = await axios.get(`http://${process.env.IP}:${process.env.PORT}/api/v1/products/product-stats`);
    const stats = response.data.data;
    console.log(stats)
    const products = await Products.find();
    res.status(200).render('manageProduct', {
        title: 'Manage Products',
        products,
        stats
    })
});