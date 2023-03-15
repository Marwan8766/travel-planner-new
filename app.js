const express = require('express');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/appErrorController');

const app = express();
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRouters');

app.use(express.json());

// Routing
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Couldn't find ${req.originalUrl} on this server!`), 404);
});

// IMPLEMENTING a global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
