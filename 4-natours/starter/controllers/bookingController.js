const stripe = require('stripe')(process.env.STRIPE_SECRET);
const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.getCheckOutSession = catchAsync( async (req, res, next) => {
    // 1) get booked product
    const tour = await Tour.findById(req.params.tourId);
    // 2) create checkout session
    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: 'usd',
                    unit_amount: tour.price * 100,
                    product_data: {
                        name: `${tour.name} Cheese`,
                        description: tour.summary,
                        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
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
    const {tour, user, price} = req.query;
    if(!tour && !user && !price) return next();

    await Booking.create({tour, user, price});

    res.redirect(req.originalUrl.split('?')[0])

});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);