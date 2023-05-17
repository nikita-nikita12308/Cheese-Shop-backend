const fs = require('fs');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.aliasTopTours = async (req, res, next) => {
	req.query.limit = '5';
	req.query.sort = '-ratingsAvarage, price';
	req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
	next(); 
};

exports.getAllTours = catchAsync(async (req, res, next) => {
	// BUILD QUERY
	const features = new APIFeatures(Tour.find(), req.query)
	  .filter()
	  .sort()
	  .limitFields()
	  .paginate(); 
	
	// EXECUTE QUERY
	
	const tours = await features.query
	// SEND RESPONSE
	res.status(200).json({
		status: 'success',
		result: tours.length,
			data: {
		 	tours
		}
	})
});

exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

//exports.deleteTour = catchAsync(async (req, res, next) => {
// 	const tour = await Tour.findByIdAndDelete(req.params.id)
//
// 	if(!tour) {
// 		return next(new AppError('No tour found with that iD', 404))
// 	}
//
// 	res.status(204).json({
// 		status: "success",
// 		data: null
// 	})
// });

exports.getTourStats =catchAsync(async (req, res, next) => {
	const stats = await Tour.aggregate([
		{
			$match: { ratingsAverage: { $gte: 4.5 }}
		},
		{
			$group: {
				_id: { $toUpper: '$difficulty'},
				numTours: { $sum: 1},
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
	const plan = await Tour.aggregate([
			{
				$unwind: '$startDates'
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
					_id: { $month: '$startDates'},
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
					numTourStarts: -1
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