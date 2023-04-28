const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
      },
      tripProgram: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TripProgram',
      },
      type: {
        type: String,
        enum: ['tour', 'tripProgram'],
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
      },
      date: {
        type: Date,
        required: true,
      },
    },
  ],
});

cartSchema.pre('save', function (next) {
  // Check that at least one item is present in the cart
  if (this.items.length === 0) return next();

  // Loop through each item and validate it
  for (const item of this.items) {
    // Check that either tour or tripProgram is present
    if (!item.tour && !item.tripProgram) {
      return next(
        new AppError(
          'Either a tour or trip program is required for each item',
          400
        )
      );
    }

    // Check that only one of tour or tripProgram is present
    if (item.tour && item.tripProgram) {
      return next(
        new AppError(
          'Each item can be for either a tour or a tripProgram, but not both',
          400
        )
      );
    }

    // Set the type of the item based on the presence of tour or tripProgram
    if (item.tour) {
      item.type = 'tour';
    } else {
      item.type = 'tripProgram';
    }

    // check that the date is greater than or equal current date
    if (item.date < Date.now())
      return next(
        new AppError(
          'The date for each item must be greater than or equal to the current date',
          400
        )
      );
  }

  // Continue with the save operation
  next();
});

cartSchema.index({ user: 1 });

module.exports = mongoose.model('Cart', cartSchema);
