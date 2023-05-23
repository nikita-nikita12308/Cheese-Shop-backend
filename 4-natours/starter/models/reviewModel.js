// review / rating / createdAt / ref to tour / ref to to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');

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
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a Tour.']
    },
    user: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a User.']
        }
    ]
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

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

reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    console.log(stats);
    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating
    });
};

reviewSchema.post('save', function(){
    // this points to current review

    this.constructor.calcAverageRatings(this.tour);

});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
