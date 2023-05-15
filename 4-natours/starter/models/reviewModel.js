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

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;