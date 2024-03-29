const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const signToken = id => {
	return jwt.sign({ id }, process.env.JWT_SECRET, { 
		expiresIn: process.env.JWT_EXPIRES_IN
	});
};

const createSendToken = (user, statusCode, res) => {
	const token = signToken(user._id);
	const cookieOptions = {
		expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
		httpOnly: true
	};

	if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
	res.cookie('jwt', token, cookieOptions);

	// Remove password from output
	user.password = undefined;

	res.status(statusCode).json({
		status: 'success',
		token,
		data: {
			user: user
		}
	})
};

exports.signup = catchAsync(async (req, res, next) => {
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm,
		passwordChangedAt: req.body.passwordChangedAt
	});
	const url = `${req.protocol}://${req.get('host')}/login`;
	console.log(url);
	await new Email(newUser, url).sendWelcome();
	createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	// 1) check if password and email exist

	if(!email || !password) {
		return next(new AppError('Provide email and password!', 400))
	}

	// 2) check if the user exist && password is correct

	const user = await User.findOne({ email }).select('+password');

	if (!user || !(await user.correctPassword(password, user.password))) {
    	return next(new AppError('Incorrect email or password', 401));
  	}

	// 3) if everything is ok , send token to client

	createSendToken(user, 200, res);
});


exports.protect = catchAsync(async (req, res, next) => {
	// 1) Getting token and check of it's there
	let token;
	if( req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1];
	}else if(req.cookies.jwt){
		token = req.cookies.jwt;
	}

	if(!token){
		return next(new AppError('Your are not logged in! Please in to get access.', 401))
	}

	// 2) Validate token
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	// 3) Check if user still exists
	const freshUser = await User.findById(decoded.id);
	if(!freshUser) {
		return next(new AppError('The user belonging to the token does no longer exist.', 401))
	}

	// 4) Check if user change password after token was issued
	if(freshUser.changedPasswordAfter(decoded.iat)) {
		return next(new AppError('User recently changed password! Please log in again', 401))
	}
	// GRANT ACCESS TO PROTECTED ROUTE
	req.user = freshUser;
	res.locals.user = freshUser;
	next()
});

exports.logout = (req, res) => {
	res.clearCookie('jwt').status(200).json({ status: 'success' });
};

// Render pages middleware with no errors
exports.isLoggedIn = catchAsync(async (req, res, next) => {
	if(req.cookies.jwt){
		token = req.cookies.jwt;

		// 1) verify token
		const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

		// 2) Check if user still exists
		const freshUser = await User.findById(decoded.id);
		if(!freshUser) {
			return next();
		}

		// 3) Check if user change password after token was issued
		if(freshUser.changedPasswordAfter(decoded.iat)) {
			return next();
		}
		// Logged in User
		res.locals.user = freshUser;
	}
	next();
});


exports.restrictTo = (...roles) => {
	return(req, res, next) => {
		//roles ['admin','lead-guide']. role='user'
		if(!roles.includes(req.user.role)){
			return next(new AppError('You do not have permission to perform this action', 403))
		}
		next();
	}
};

exports.forgotPassword = catchAsync( async(req, res, next) => {
	// 1) GET user based on the POSTed email
	const user = await User.findOne({ email: req.body.email });
	if(!user) {
		return next(new AppError('There is no user with email address.', 404))
	}
	// 2) Generate random token
	const resetToken = user.createPasswordResetToken();
	await user.save({ validateBeforeSave: false });
	// 3) Send it to users email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    try{
		await new Email(user, resetURL).sendPasswordReset();
		res.status(200).json({
			status: 'success',
			message: 'Token sent to email!'
		})
	}catch(err){
			user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save({ validateBeforeSave: false });

		return next(new AppError('There was an error sending email. Try again later!'), 500)
	}

});

exports.resetPassword = catchAsync(async (req, res, next) => {
	// 1) get user based on the token
	const hashedToken = crypto.createHash('sha256')
		.update(req.params.token)
		.digest('hex');

	const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires:  {$gt :Date.now() } });

	// 2) if token has not expired, and there is user , set the new password
	if(!user) return next(new AppError('Token is invalid or have expired', 400));
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;
	await user.save();

	// 3) Update the changePasswordAt property for the user
	// 4) Log the user in , send JWT
	createSendToken(user, 200, res);
});


exports.updatePassword = catchAsync( async (req, res, next) => {
	// 1) get user from collection
	const user = await User.findById(req.user.id).select('+password');

	// 2) Check if POSTed password is correct
	if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
		return next(new AppError('Your current password is wrong', 401));
	}

	// 3) if password is correct, update the password
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	await user.save();

	// 4) Log user in, send JWT
	createSendToken(user, 200, res);

});

exports.belongTo = catchAsync( async (req, res, next) => {
	//userId , productId
	const query = {
		user: req.body.user,
		product: req.body.product
	};
	const userBookings = await Booking.findOne(query);
	if(!userBookings) {
		next(new AppError('Only user-owned products can have reviews', 400))
	}
	next();
});