const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const Product = require('./../models/productModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');


// Multer Options Set
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

exports.uploadProductImages = upload.fields([
	{name: 'imageCover', maxCount: 1},
	{name: 'images', maxCount: 3}
]);

exports.resizeProductImages = catchAsync(async (req, res, next) => {
	console.log(req.files);

	if(!req.files.imageCover || !req.files.images) return next();

	req.body.imageCover = `product-${req.params.id}-${Date.now()}-cover.jpeg`;
	await sharp(req.files.imageCover[0].buffer)
		.resize(2000, 1333)
		.toFormat('jpeg')
		.jpeg({ quality: 90 })
		.toFile(`public/img/products/${req.body.imageCover}`);

	req.body.images = [];
	await Promise.all(req.files.images.map(async (file, i) => {
		const filename = `product-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
		await sharp(file.buffer)
			.resize(2000, 1333)
			.toFormat('jpeg')
			.jpeg({ quality: 90 })
			.toFile(`public/img/products/${filename}`);
		req.body.images.push(filename)
	}));

	next();
});

exports.aliasTopProducts = async (req, res, next) => {
	req.query.limit = '5';
	req.query.sort = '-ratingsAvarage, price';
	req.query.fields = 'name,price,ratingsAverage,summary,calories';
	next(); 
};

exports.getAllProducts = factory.getAll(Product);
exports.getProduct = factory.getOne(Product, { path: 'reviews' });
exports.createProduct = factory.createOne(Product);
exports.updateProduct = factory.updateOne(Product);
exports.deleteProduct = factory.deleteOne(Product);


exports.getProductStats =catchAsync(async (req, res, next) => {
	const stats = await Product.aggregate([
		{
			$match: { ratingsAverage: { $gte: 4.5 }}
		},
		{
			$group: {
				_id: { $toUpper: '$calories'},
				numProducts: { $sum: 1},
				numRatings: { $sum: '$ratingsQuantity'},
				avgRating: { $avg: '$ratingsAverage'},
				avgPrice: { $avg: '$price'},
				minPrice: { $min: '$price'},
				maxPrice: { $max: '$price'},
			}
		},
		{
			$sort: { avgPrice: 1}
		},
		//{
		//	$match: { _id: { $ne: 'EASY'} }
		//}
	]);
	res.status(200).json({
		status: "success",
		data: stats
	})
});

exports.getMonthlyPlan = catchAsync(async (req,res) => {
	const year = req.params.year * 1; // 2021
	const plan = await Product.aggregate([
			{
				$unwind: '$createdAt'
			},
			{
				$match: { 
					startDates : { 
						$gte: new Date(`${year}-01-01`),
						$lte: new Date(`${year}-12-31`)  
					}
				}
			},
			{
				$group: {
					_id: { $month: '$createdAt'},
					numTourStarts: { $sum: 1},
					tours: { $push: '$name'}
				}
			},
			{
				$addFields: { month: '$_id'}
			},
			{
				$project: {
					_id: 0
				}
			},
			{
				$sort: {
					numProductStarts: -1
				}
			},
			{
				$limit: 12
			}
		]);
	res.status(200).json({
		status: "success",
		data: { plan }
	})
});

exports.getProductWithin = catchAsync(async (req, res, next) => {
	const { distance , latlng, unit } = req.params;
	const [ lat , lng ] = latlng.split(',');

	const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

	if( !lat || !lng ) {
		next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400));
	}

	const products = await Product.find({ mainStoreLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }});

	res.status(200).json({
		status: "success",
		results: products.length,
		data: {
			data: products
		}
	});
});

exports.getDistances = catchAsync(async (req, res, next) => {
	const { latlng, unit } = req.params;
	const [ lat , lng ] = latlng.split(',');

	if( !lat || !lng ) {
		next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400));
	}

	const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

	const distances = await Product.aggregate([
		{
			// $geoNear always need to be first
			$geoNear: {
				near: {
					type: 'Point',
					coordinates: [lng * 1, lat * 1]
				},
				distanceField: 'distance',
				distanceMultiplier: multiplier
			}
		},
		{
			$project: {
				distance: 1,
				name: 1
			}
		}
	]);

	res.status(200).json({
		status: "success",
		data: {
			data: distances
		}
	});
});