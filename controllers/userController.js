const fs = require('fs');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Factory = require('./handlerFactory');

const filterobj = (obj, ...allowedFields) => {
  const newobj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newobj[el] = obj[el];
  });
  return newobj;
};
exports.GetAllUsers = Factory.getAll(User);
exports.deleteuser = Factory.deleteOne(User);
exports.Updateuser = Factory.updateOne(User);
exports.Getuser = Factory.getOne(User);
exports.createuser = Factory.createOne(User);

exports.deleteMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.UpdateMe = catchAsync(async (req, res, next) => {
  // 1) create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for update password. please use /updatePassword ',
        400
      )
    );
  }
  // 2) filter out unwanted fields names that are not allowed to be updated
  const filterBody = filterobj(req.body, 'name', 'email');

  // 3) Update user document
  const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});
