const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = id => {
	return jwt.sign({ id }, process.env.JWT_SECRET, { 
		expiresIn: process.env.JWT_EXPIRES_IN
	});
}

exports.signup = catchAsync(async (req, res, next) => {
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm
	});

	const token = signToken(newUser._id);

	res.status(201).json({
		status: 'success',
		token,
		data: {
			user:newUser
		}
	})
})

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

	const token = signToken(user._id);

	res.status(200).json({
		status: 'success',
		token
	})
});


exports.protect = catchAsync(async (req, res, next) => {
	// 1) Getting token and check of it's there
	let token;
	if( req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1];
	}
	console.log(token);

	if(!token){
		return next(new AppError('Your are not logged in! Please in to get access.', 401))
	}
	// 2) Validate token

	// 3) Check if user still exists

	// 4) Check if user change password after token was issued

	next()
})