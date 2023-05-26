const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');

// Multer Options Set
const multerStorage = multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, 'public/img/users');
	},
	filename: (req, file, callback) => {
		// user-asd1edf1f1f4h4-1234567.jpeg
		const extension = file.mimetype.split('/')[1];
		callback(null, `user-${req.user.id}-${Date.now()}.${extension}`)
	}
});

const multerFilter = (req, file, callback) => {
	if(file.mimetype.startsWith('image')){
		callback(null, true)
	}else{
		callback(new AppError('Not an image! Upload only images', 400), false)
	}
};

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

const filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	Object.keys(obj).forEach(el => {
		if(allowedFields.includes(el)) newObj[el] = obj[el];
	});
	return newObj;
};

exports.getMe = (req, res, next) => {
	req.params.id = req.user.id;
	next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
	console.log(req.file);
	console.log(req.body);
	// 1) Create Error if user POSTs password data
	if(req.body.password || req.body.passwordConfirm) {
		return next(new AppError('This route is not for password updates. Please use /updateMyPassword.'), 400);
	}

	// 2) Filtered out filed names that are now allowed to be updated
	const filteredBody = filterObj(req.body, 'name', 'email');

	// 3) Update user document
	const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
		new: true,
		runValidators: true
	});

	res.status(200).json({
		status: 'success',
		data: {
			user: updatedUser
		}
	});
});

exports.deleteMe = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user.id, { active: false });

	res.status(204).json({
		status: 'success',
		data: null
	})
});

exports.createUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: "This route in not yet defined! Pleas use /signup instead."
	})
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
