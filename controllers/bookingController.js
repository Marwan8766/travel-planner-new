const tripProgramModel = require('../models/tripProgramsmodel');
const tourModel = require('../models/tourModel');
const bookingModel = require('../models/booking.model');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Factory = require('./handlerFactory');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createTourBook = catchAsync(async (req, res, next) => {
  const tourId = req.params.id;
  const tour = await tourModel.findOne({ _id: tourId });
  if (!tour) {
    return next(new AppError('Tour not found', 404));
  }
  try {
    const booking = await bookingModel.create({
      bookedTour: tourId,
      user: req.user._id,
      price: tour.price,
    });
    if (!booking) {
      return next(new AppError('Could not create book', 400));
    }
    res.status(200).json({
      status: 'success',
      data: {
        booking,
      },
    });
  } catch (err) {
    return next(
      new AppError(`Could not upload this book: ${err.message}`, 400)
    );
  }
});

exports.createTripProgramBook = catchAsync(async (req, res, next) => {
  const tripProgramId = req.params.id;
  const tripProgram = await tripProgramModel.findOne({ _id: tripProgramId });
  if (!tripProgram) {
    return next(new AppError('tripProgram not found', 404));
  }
  try {
    const booking = await bookingModel.create({
      bookedTripProgram: tripProgramId,
      user: req.user._id,
      price: tripProgram.price,
    });
    if (!booking) {
      return next(new AppError('Could not create tripProgram', 400));
    }
    res.status(200).json({
      status: 'success',
      data: {
        tripProgram,
      },
    });
  } catch (err) {
    return next(
      new AppError(`Could not upload this tripProgram: ${err.message}`, 400)
    );
  }
});

exports.deleteBook = catchAsync(async (req, res, next) => {
  // find the book
  const book = await bookingModel.findById(req.params.id);
  // if no book was found throw  an rror
  if (!book) return next(new AppError("This booking could't be found", 404));

  // find the book and delete it from DB
  const deletedbook = await bookingModel.findByIdAndDelete(req.params.id);

  // if no book was found throw error
  if (!deletedbook) return next(new AppError("This booking wasn't found", 404));

  // send res json with success message and deleted book
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllbooks = catchAsync(async (req, res, next) => {
  // find all books
  const book = await bookingModel.find();
  // if there is no books throw an error
  if (book.length === 0)
    return next(new AppError('There is no books found', 404));
  // send res json with success and books
  res.status(200).json({
    status: 'success',
    data: book,
  });
});

exports.createStripeCheckoutItems = catchAsync(async (req, res, next) => {
  // find the user cart
  const cart = req.cart;

  // populate the tour and tripProgram fields
  await cart
    .populate({
      path: 'items.tour',
      select: 'name price company',
      populate: {
        path: 'company',
        select: 'stripeAccountId',
      },
    })
    .populate({
      path: 'items.tripProgram',
      select: 'name price company',
      populate: {
        path: 'company',
        select: 'stripeAccountId name',
      },
    })
    .execPopulate();

  // map the items array to an array with price and quantity
  const lineItems = cart.items.map((item) => {
    const { tour, tripProgram, type, quantity, date } = item;
    const { name, price, company } = type === 'tour' ? tour : tripProgram;
    const { stripeAccountId } = company;
    return {
      price_data: {
        currency: 'usd',
        unit_amount: price * 100,
        product_data: {
          name: name,
          description: `Company: ${company.name} , Date: ${date.toISOString()}`,
        },
      },
      quantity: quantity,
    };
  });

  // create metadata object with all items data
  const metadata = {
    items: cart.items.map((item) => {
      const { tour, tripProgram, type, quantity, date } = item;
      const { name, price, company } = type === 'tour' ? tour : tripProgram;
      const { stripeAccountId } = company;
      return {
        type: type,
        date: date.toISOString(),
        companyId: company._id.toString(),
        itemName: name,
        itemPrice: price,
        quantity: quantity,
        companyStripeId: stripeAccountId,
      };
    }),
  };

  // put them on req and call next
  req.lineItems = lineItems;
  req.metadata = metadata;
  next();
});

exports.createStripePaymentSession = catchAsync(async (req, res, next) => {
  // take line_items array and metadata from the req
  const { line_items_array, metadata_obj } = req.body;

  // create the session
  const session = await stripe.checkout.sessions.create({
    line_items: line_items_array,
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/success.html`,
    cancel_url: `${req.protocol}://${req.get('host')}/cancel.html`,
    receipt_email: req.user.email,
    currency: 'usd',
    payment_method_types: ['card'],
    metadata: metadata_obj,
  });

  // send res
  res.redirect(303, session.url);
});

exports.createBooking_webhook = async (paymentIntentSucceeded) => {
  const metadata = paymentIntentSucceeded.metadata;

  // Use the metadata to create a booking
  const booking = await bookingModel.create({
    user: metadata.userId,
    company: metadata.companyId,
    itemName: metadata.itemName,
    itemPrice: metadata.itemPrice,
    quantity: metadata.quantity,
    date: metadata.date,
    paymentIntent: paymentIntentSucceeded.id,
  });
};
