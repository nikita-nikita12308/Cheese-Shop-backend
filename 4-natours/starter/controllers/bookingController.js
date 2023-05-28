const stripe = require('stripe')(process.env.STRIPE_SECRET);
//const Tour = require('./../models/tourModel');
const Product = require('./../models/productModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.getCheckOutSession = catchAsync( async (req, res, next) => {
    // 1) get booked product
    const product = await Product.findById(req.params.productId);
    // 2) create checkout session
    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?product=${req.params.productId}&user=${req.user.id}&price=${product.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/product/${product.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.productId,
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: 'uah',
                    unit_amount: product.price * 100,
                    product_data: {
                        name: `${product.name} Cheese`,
                        description: product.summary,
                        images: [`https://www.natours.dev/img/tours/${product.imageCover}`],
                    },
                },
            },
        ],
    });
    // 3) send to client
    res.status(200).json({
        url: session.url,
    });
});

exports.createBookingCheckOut = catchAsync(async (req, res, next) => {
    // Temporary , NOT secure
    const {product, user, price} = req.query;
    if(!product && !user && !price) return next();

    await Booking.create({product, user, price});

    res.redirect(req.originalUrl.split('?')[0])

});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);