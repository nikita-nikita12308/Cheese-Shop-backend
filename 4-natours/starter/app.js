const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globbalErrorHandler = require('./controllers/errorController');
//const tourRouter = require('./routes/tourRoutes');
const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
app.use(express.static(path.join(__dirname, 'public')));
app.use(
	helmet({
		crossOriginEmbedderPolicy: false,
	})
);
// Set security HTTP headers
const scriptSrcUrls = [
	'https://checkout.stripe.com/',
	'https://unpkg.com/',
	'https://tile.openstreetmap.org',
	'https://*.mapbox.com',
	'https://js.stripe.com',
	'https://m.stripe.network',
	'https://*.cloudflare.com',
	'https://api.tiles.mapbox.com/',
	'https://api.mapbox.com/',
	'https://checkout.stripe.com'
];
const styleSrcUrls = [
	'https://unpkg.com/',
	'https://tile.openstreetmap.org',
	'https://fonts.googleapis.com/',
	'https://checkout.stripe.com'
];
const connectSrcUrls = [
	'https://unpkg.com',
	'https://*.mapbox.com',
	'https://*.stripe.com',
	'https://bundle.js:*',
	'ws://127.0.0.1:*/',
	'https://m.stripe.com',
];

const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
			baseUri: ["'self'"],
			fontSrc: ["'self'", ...fontSrcUrls],
			scriptSrc: ["'self'", 'https:', 'http:', 'blob:', ...scriptSrcUrls],
			frameSrc: ["'self'", 'https://js.stripe.com'],
			objectSrc: ["'none'"],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", 'blob:', 'https://m.stripe.network'],
			childSrc: ["'self'", 'blob:'],
			imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
			formAction: ["'self'"],
			connectSrc: ["'self'", 'data:', 'blob:', 'https://checkout.stripe.com', 'https://js.stripe.com/v3/', ...connectSrcUrls],
			upgradeInsecureRequests: []
		}
	})
);
app.use(
	cors({
		origin: ['http://127.0.0.1:8000','https://checkout.stripe.com'],
		credentials: true,
	})
);

// Development logging
console.log(process.env.NODE_ENV);
if(process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// Limit requests from  same API
const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000,
	message: 'Too many request from this IP, please try again in an hour!'
});
app.use('/api', limiter);


// Body parser, reading data from body into req.body
app.use(express.json({	limit: '10kb'}));
app.use(cookieParser());
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
	hpp({
		whitelist: [
			'duration',
			'ratingsQuantity',
			'ratingsAverage',
			'maxGroupSize',
			'difficulty',
			'price'
		]
	})
);

// Serving static files
app.use(express.json());
app.use(express.static(`${__dirname}/public`));


// Test middleware
app.use((req, res, next) => {
	req.requestTime = new Date().toISOString();
	next();
});

// 3) ROUTES
app.use('/', viewRouter);
//app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

app.all('*', (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globbalErrorHandler);

module.exports = app;
