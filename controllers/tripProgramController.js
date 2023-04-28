const TripProgram = require('../models/tripProgramsmodel');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.createTripProgram = Factory.createOne(TripProgram);

exports.deleteTripProgram = Factory.deleteOne(TripProgram);
exports.UpdateTripProgram = Factory.updateOne(TripProgram);

exports.GetAllTripProgram = catchAsync(async (req, res, next) => {
  const doc = await TripProgram.find().populate('tour').populate('company');
  // Send response
  res.status(200).json({
    status: 'success',
    result: doc.length,
    data: {
      data: doc,
    },
  });
});

exports.GetTripProgram = catchAsync(async (req, res, next) => {
  let query = TripProgram.findById(req.params.id)
    .populate('tour')
    .populate('company');
  const doc = await query;
  if (!doc) return next(new AppError('No document found for that ID', 404));
  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});
