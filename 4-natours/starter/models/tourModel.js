const mongoose = require('mongoose')

const tourSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'A tour must have a name'],
		unique: true,
		trim: true
	},
	duration: {
		type: Number,
		required: [true, 'A tour must have duration']
	},
	maxGroupSize: {
		type: Number,
		required: [true, 'A tour must have group size']
	},
	difficulty: {
		type: String,
		required: [true, 'A tour must have difficulty']
	},
	ratingsAverage: {
		type: Number,
		default: 4.5
	},
	ratingsQuantity:{
		type: Number,
		default: 0
	},
	price: {
		type: Number,
		required: [true, 'A price must have a number']
	},
	priceDiscount: Number,
	summary: {
		type: String,
		trim: true,
		required: true
	},
	description: {
		type: String,
		trim: true
	},
	imageCover: {
		type: String,
		required: [true , 'A must have a cover image']
	},
	images: [String],
	createAt:{
		type: Date,
		default: Date.now(),
		select: false
	},
	startDates: [Date]
})

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour
