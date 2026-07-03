const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModels');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // ===== OLD (Typo in your code) =====
      // require: [true, 'tour must have name']
      required: [true, 'tour must have name'],
      unique: true,
      maxlength: [40, 'tour name must have atmost 40 characters'],
      minlength: [10, 'tour name must have atleast 10 characters'],
      // validate: [validator.isAlpha, 'tour name must contain only letters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have maxGroupSize'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty either be easy,medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
      max: 5.0,
      min: 0.0,
    },
    price: {
      type: Number,
      // ===== OLD (Typo in your code) =====
      // require: [true, 'tour must have name']
      required: [true, 'tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      default: 0,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should less than regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: true,
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now,
      select: false, // for hiding fiels
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      // reference
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
// DOCUMENT MIDDLEWARE
tourSchema.pre('save', function () {
  // there is no next parameter in new version
  //runs before .save() and .create()
  console.log(this);
});
// tourSchema.pre('save', async function () {
//   const PromiseArray = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(PromiseArray);
// });   // Embedding
tourSchema.pre('save', function () {
  this.slug = slugify(this.name, { lower: true });
});
//QUERY MIDDLEWARE
tourSchema.pre(/^find/, function () {
  this.find({ secretTour: { $ne: true } });
  this.starts = Date.now();
});
tourSchema.post(/^find/, function (docs) {
  console.log(`Query took ${Date.now() - this.starts}millisecond`);
});
tourSchema.pre(/^find/, function () {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
});
//Aggregate middleware
// tourSchema.pre('aggregate', function () {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
// });
tourSchema.virtual('DurationWeek').get(function () {
  return this.duration / 7;
}); // used normal fuction beacuse  arror function don't have access of this key word and virtual property only visible when we get data not a part of database
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
