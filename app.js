const express = require('express');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/appErrorController');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('./models/booking.model');

const app = express();

// Use body-parser to retrieve the raw body as a buffer
const bodyParser = require('body-parser');

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

app.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }),
  async (request, response) => {
    const sig = request.headers['stripe-signature'];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = event.data.object;

        // Then define and call a function to handle the event payment_intent.succeeded
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRouters');
const touristAttractionsRouter = require('./routes/touristAttractionsRouter');
const plannedTripsRouter = require('./routes/plannedTripsRouter');
const cityRouter = require('./routes/cityRouter');
const reviewRouter = require('./routes/reviewRouter');
const bookingRouter = require('./routes/bookingRouter');
const tripProgramRouter = require('./routes/tripProgramRoutes');
const countryRouter = require('./routes/countryRouter');
const availabilityRouter = require('./routes/availabilityRouter');
const cartRouter = require('./routes/cartRouter');

app.use(express.json());

// Routing
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/touristAttractions', touristAttractionsRouter);
app.use('/api/v1/plannedTrips', plannedTripsRouter);
app.use('/api/v1/cities', cityRouter); // not fully tested
app.use('/api/v1/countries', countryRouter); // not fully tested
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);
app.use('/api/v1/tripPrograms', tripProgramRouter);
app.use('/api/v1/availability', availabilityRouter); // not tested
app.use('/api/v1/cart', cartRouter); // not tested

app.all('*', (req, res, next) => {
  next(new AppError(`Couldn't find ${req.originalUrl} on this server!`), 404);
});

// IMPLEMENTING a global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
