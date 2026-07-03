//review //rating //createdAt // ref to tour //ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModels');
const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'please give the review'],
  },
  rating: {
    type: Number,
    required: [true, 'please provide rating'],
    max: 5,
    min: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'review must belong to user'],
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'review must belong to tour'],
  },
});
reviewSchema.pre(/^find/, function () {
  // this.populate({
  //   path: 'user',
  //   select: 'name',
  // }).populate({
  //   path: 'tour',
  //   select: 'name',
  // });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
});
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
// prevent duplicate reviews
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});
reviewSchema.pre(/^findOneAnd/, async function () {
  // this.r = await this.findOne();When you call this.findOne() on the query object and await it, the query is executed. Then the original findOneAnd query tries to execute again, causing the error.
  this.r = await this.clone().findOne();
});
reviewSchema.post(/^findOneAnd/, async function () {
  // this.r = await this.findOne(); this would not work because query is allready executed;
  this.r.constructor.calcAverageRatings(this.r.tour);
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
