const mongoose = require('mongoose');
//const Tour = require('./tourModel');
const Product = require('./productModel');

const reviewSchema = new mongoose.Schema({
    review: {
      type: String,
      required: [true, 'Can not be empty!']
    },
    rating: {
        type: Number,
        default: 4.5,
        max: [5, 'Max rating is 5!'],
        min: [0, 'Min rating is 0!']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: [true, 'Review must belong to a Product.']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a User.']
    }
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

reviewSchema.index({ product: 1, user: 1}, { unique: true });

reviewSchema.pre(/^find/, function(next){
    //this.populate({
    //         path: 'tour',
    //         select: 'name'
    //     }).populate({
    //         path: 'user',
    //         select: 'name photo'
    //     });

    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});

reviewSchema.statics.calcAverageRatings = async function(productId) {
    const stats = await this.aggregate([
        {
            $match: { product: productId }
        },
        {
            $group: {
                _id: '$product',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    console.log(stats);
    if(stats.length > 0 ){
        await Product.findByIdAndUpdate(productId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Product.findByIdAndUpdate(productId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5 });
    }
};

reviewSchema.post('save', function(){
    // this points to current review

    this.constructor.calcAverageRatings(this.product);

});

reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.clone().findOne();
    next();
});

reviewSchema.post(/^findOneAnd/, async function() {
    await this.r.constructor.calcAverageRatings(this.r.product);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
