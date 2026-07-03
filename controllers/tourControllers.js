const fs = require('fs');
const Tour = require('./../models/tourModels');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsyncError = require('./../utils/catchAsyncError');
const appError = require('./../utils/appError');
const multer = require('multer');
const sharp = require('sharp');
const factoryFunction = require('./factoryFunction');
// exports.checkID = (req, res, next, val) => {
//   // param  stores in the ---> val ;
//   console.log(`ID:${val}`);
//   if (req.params.id > tours.length - 1) {
//     return res.status(404).json({
//       status: 'failure',
//       message: 'cannot update the tour',
//     });
//   }
//   next();
// };
// exports.checkBody = (req, res, next) => {
//   console.log(req.body);
//   const obj = req.body;
//   if (!obj.name || !obj.price) {
//     return res.status(400).json({
//       status: 'failure',
//       message: 'missing name or price parameter',
//     });
//   }
//   next();
// };
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new appError('Not an image,Please upload image!', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
exports.resizeTourimages = catchAsyncError(async (req, res, next) => {
  console.log(req.files);
  if (!req.files.imageCover || !req.files.images) return next();
  //imageCover
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  //images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );

  next();
});
exports.aliasingTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,duration,price,ratingsAverage,summary';
  next();
};
exports.getAllTours = factoryFunction.getAll(Tour);
exports.getTour = factoryFunction.getOne(Tour, { path: 'reviews' });
exports.createTour = factoryFunction.createOne(Tour);
exports.updateTour = factoryFunction.updateOne(Tour);
exports.deleteTour = factoryFunction.deleteOne(Tour);
exports.getAllToursStats = catchAsyncError(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTour: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: -1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});
exports.getMonthlyPlan = catchAsyncError(async (req, res, next) => {
  const year = req.params.year;
  const monthlyPlan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' }, // extract month januray--->1 december----->12
        numTours: { $sum: 1 },
        tour: { $push: '$name' }, // create an array of field
      },
    },
    {
      $addFields: { month: '$_id' }, // add fields name and value
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTours: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      monthlyPlan,
    },
  });
});
exports.getToursWithin = catchAsyncError(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    return next(new appError('please provide starting coordinates', 400));
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tours,
    },
  });
});
exports.getDistances = catchAsyncError(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    return next(
      new appError('Please provide the latitudes and longititudes!', 400)
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    result: distances.length,
    data: {
      distances,
    },
  });
});
