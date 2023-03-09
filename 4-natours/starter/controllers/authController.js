const User = require('./../models/userModel');
const mongoose = require('mongoose');
const catchAsync = require('./../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
	console.log('signup')
	const newUser = await User.create(req.body);
	res.status(201).json({
		status: 'success',
		data: {
			user:newUser
		}
	})
})