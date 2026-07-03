const APIFeatures = require('./../utils/apiFeatures');
const catchAsyncError = require('./../utils/catchAsyncError');
const appError = require('./../utils/appError');
exports.deleteOne = (Models) =>
  catchAsyncError(async (req, res, next) => {
    const doc = await Models.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new appError('No document found with this ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
exports.updateOne = (Models) =>
  catchAsyncError(async (req, res, next) => {
    const doc = await Models.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new appError('No document found with this ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
exports.createOne = (Models) =>
  catchAsyncError(async (req, res, next) => {
    // const newTours = new Tour({})
    // newTours.save();
    const doc = await Models.create(req.body);
    if (!doc) {
      return next(new appError('No document found with this ID', 404));
    }
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
exports.getOne = (Models, popOptions) =>
  catchAsyncError(async (req, res, next) => {
    let query = Models.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(new appError('document not found by this ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.getAll = (Models) =>
  catchAsyncError(async (req, res, next) => {
    //EXECUTE QUERY
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Models.find(filter), req.query) // create a object and pass mongoose query
      .filter() // and methods in class manupilate the query feature of object
      .sort()
      .fieldLimiting()
      .pagination();
    const doc = await features.query;
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
