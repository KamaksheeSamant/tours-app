const express = require('express');
const morgan = require('morgan');
// const { MongoClient, ServerApiVersion } = require('mongodb');
const AppError = require('./utils/appError');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// all the unknow routes needs to eb handled here
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: 'Could not find the route'
  });
});
module.exports = app;
