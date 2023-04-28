const mongoose = require('mongoose');
const validator = require('validator');
const Tour = require('./tourModel');

const tripProgram = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please write your name'],
  },
  price: {
    type: Number,
    required: [true, 'A trip must have a price'],
  },
  summary: {
    type: String,
    trim: true,
    // required: [true, 'A tour must have a overview'],
    select: true,
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'A trip must have a descrption'],
    select: true,
  },
  images: [String],
  CreatedAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  startDates: [Date],
  startLocations: {
    type: {
      type: String,
      default: 'point',
      enum: ['point'],
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
  tour: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Program must belong to a tour'],
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'program must belong to a company'],
  },
});

const TripProgram = mongoose.model('TripProgram', tripProgram);
module.exports = TripProgram;
