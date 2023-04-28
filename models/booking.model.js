const mongoose = require('mongoose');

const booking = new mongoose.Schema({
  paid: {
    type: Boolean,
    default: false,
  },
  price: {
    type: Number,
    required: [true, 'A trip must have a price'],
  },
  CreatedAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  tour:[ {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: false,
  }],
  tripProgram: {
    type: mongoose.Schema.ObjectId,
    ref: 'TripProgram',
    required: false,
  },
});

const Booking = mongoose.model('Booking', booking);
module.exports = Booking;
