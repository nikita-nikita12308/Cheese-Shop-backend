const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

// Multer Options Set
//const multerStorage = multer.diskStorage({
// 	destination: (req, file, callback) => {
// 		callback(null, 'public/img/users');
// 	},
// 	filename: (req, file, callback) => {
// 		// user-asd1edf1f1f4h4-1234567.jpeg
// 		const extension = file.mimetype.split('/')[1];
// 		callback(null, `user-${req.user.id}-${Date.now()}.${extension}`)
// 	}
// });
const multerStorage = multer.memoryStorage();

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
exports.resizeUserPhoto = async (req, res, next) => {
	if(!req.file) return next();

	req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

	await sharp(req.file.buffer)
		.resize(500, 500)
		.toFormat('jpeg')
		.jpeg({ quality: 90 })
		.toFile(`public/img/users/${req.file.filename}`);

	next();
};

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

	// 1) Create Error if user POSTs password data
	if(req.body.password || req.body.passwordConfirm) {
		return next(new AppError('This route is not for password updates. Please use /updateMyPassword.'), 400);
	}

	// 2) Filtered out filed names that are now allowed to be updated
	const filteredBody = filterObj(req.body, 'name', 'email');
	if(req.file) filteredBody.photo = req.file.filename;

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
