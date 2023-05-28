const mongoose = require('mongoose');
const slugify = require('slugify');
//const validator = require('validator');
const User = require('./userModel');

const productSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'A product must have a name'],
		unique: true,
		trim: true,
		maxlength: [40, 'A product name must have less or eq 40 char'],
		minlength: [10, 'A product name must have more or eq 10 char']
		//validate: [validator.isAlpha, 'Tour name must only contain character']
	},
	slug: String,
	durationAging: {
		type: Number,
		required: [true, 'A product must have duration']
	},
	weight: {
		type: Number,
		required: [true, 'A product must have weight']
	},
	calories: {
		type: String,
		required: [true, 'A product must have calories'],
		enum: {
			values: ['low', 'medium', 'high'],
			message: 'Difficulty is either: low, medium, high'
		}
	},
	ratingsAverage: {
		type: Number,
		default: 4.5,
		min: [1, 'Rating must be above 1.0'],
		max: [5, 'Rating must be below 5.0'],
		set: val => Math.round(val * 10) / 10
	},
	ratingsQuantity:{
		type: Number,
		default: 0
	},
	price: {
		type: Number,
		required: [true, 'A price must have a number']
	},
	priceDiscount: {
		type: Number,
		validate: {
			validator: function(val) {
				// this only point to current doc on NEW doc creation
				return val < this.price 
			},
			message: 'Discount price ({VALUE}) should be below the regular price'
		}
	},
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
	cheeseCreateDates: [Date],
	secretProduct: {
		type: Boolean,
		default: false
	},
	mainStoreLocation: {
		// GeoJSON
		type: {
			type: String,
			default: 'Point',
			enum: ['Point']
		},
		coordinates: [Number],
		address: String,
		description: String
	},
	storeLocations: [
		{
			type: {
				type: String,
				default: 'Point',
				enum: ['Point']
			},
			coordinates: [Number],
			address: String,
			description: String,
			shopType: Number
		}
	],
    personal: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
},
{
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

productSchema.index({ price: 1 , ratingsAverage: -1 });
productSchema.index({ slug: 1 });
productSchema.index({ mainStoreLocation: '2dsphere' });
productSchema.virtual('durationWeeks').get(function() {
	return this.duration / 7;
});

// Virtual populating
productSchema.virtual('reviews', {
	ref: 'Review',
	foreignField: 'product',
	localField: '_id'
});

// DOCUMENT MIDDLEWARE: runs only before .save() and .create()
productSchema.pre('save', function(next) {
	this.slug = slugify(this.name, { lower: true});
	next();
});

productSchema.pre('save', async function (next) {
    const personalPromises = this.personal.map(async id => await User.findById(id));
    this.personal = await Promise.all(personalPromises);
    next();
});

//tourSchema.pre('save', function(next) {
//	console.log('Will save document...');
//	next();
//})
//
//tourSchema.post('save', function(doc, next) {
//	console.log(doc);
//	next();
//})

// QUERY MIDDLEWARE
productSchema.pre(/^find/, function(next) {
	this.find({ secretProduct: { $ne: true } });

	this.start = Date.now();
	next();
});

productSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'personal',
		select: '-__v -passwordChangedAt'
	});

	next();
});

productSchema.post(/^find/, function(docs, next) {
	console.log(`Query took ${Date.now() - this.start} milliseconds`);
	next();
});



// AGREGATION MIDDLEWARE

//tourSchema.pre('aggregate', function(next) {
// 	this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//
// 	console.log(this.pipeline());
// 	next();
// });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

// це буде перерроблено на сири скоро




























