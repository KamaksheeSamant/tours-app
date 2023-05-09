const Tour = require('../models/tourModel');
const { filterReservedQueryVals } = require('../utils/common');
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // 1) FILTERING
    console.log('QUERY::', req.query);
    const queryObj = filterReservedQueryVals({ ...req.query });
    // Note to self:  <collection_schema>.find always returns the Query Object
    // so u can cahin any other Query methods defined on the query prototypes
    // BUt when u do await , it executes that query
    // normal query string : ?difficulty=easy&duration=5&page=2
    // let query = Tour.find(queryObj);

    // for advanced query
    let query = Tour.find(queryObj);
    // string : ?difficulty=easy&duration=5&page=2&ratingsAverage[gte]=4.7

    // 2) SORT
    // ascending : 127.0.0.1:3000/api/v1/tours?sort=price
    // descending: 127.0.0.1:3000/api/v1/tours?sort=-price
    //127.0.0.1:3000/api/v1/tours?sort=price,-ratingsAverage&price=1497
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // limiting fields
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // pagination

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = Tour.countDocuments();
      if (skip >= numTours) {
        throw new Error('This page does not exist!');
      }
    }

    const tours = await query;

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: {
        tours: tours
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: 'error',
      data: JSON.stringify(error)
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: {
        tour
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: 'error',
      data: JSON.stringify(error)
    });
  }
};

// eslint-disable-next-line node/no-unsupported-features/es-syntax
exports.createTour = async (req, res) => {
  // console.log('req body', req.body);
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: 'error',
      data: JSON.stringify(error)
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!tour) {
      return new Error('No tour found with that ID', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: 'error',
      data: JSON.stringify(error)
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
      return new Error('No tour found with that ID', 404);
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: 'error',
      data: JSON.stringify(error)
    });
  }
};
