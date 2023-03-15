const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.createTour = Factory.createOne(Tour);