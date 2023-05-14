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
  // res.status(404).json({
  //   status: 'fail',
  //   message: 'Could not find the route'
  // });
  // const error = new Error('Count not find the route');
  // error.status = 'fail';
  // error.statusCode = 404;

  const error = new AppError('Count not find the route', 404);
  next(error); // using next with arg means exp will know that there is an err and will call ur err middlewareß
});
// to tell express that this is a err handling middle ware functio
// pass 4 args err, req, res, next
// at the very end ( as middle ware calls sequesce is as they are defined)
app.use((error, _req, res, _next) => {
  error.statusCode = error.statusCode || '500'; // internal server down code
  error.status = error.status || 'error';
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message
  });
});

// NOT: if you are passing any val to next , express will consider it as an err and skip all other stpes
// global err handling middleware

module.exports = app;
