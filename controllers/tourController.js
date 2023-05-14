const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const APIQuery = require('../utils/apiQuery');
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res) => {
  // 1) FILTERING
  // console.log('QUERY::', req.query);÷
  // const queryObj = filterReservedQueryVals({ ...req.query });
  // Note to self:  <collection_schema>.find always returns the Query Object
  // so u can cahin any other Query methods defined on the query prototypes
  // BUt when u do await , it executes that query
  // normal query string : ?difficulty=easy&duration=5&page=2
  // let query = Tour.find(queryObj);

  // for advanced query
  // let query = Tour.find(queryObj);
  // string : ?difficulty=easy&duration=5&page=2&ratingsAverage[gte]=4.7

  // 2) SORT
  // ascending : 127.0.0.1:3000/api/v1/tours?sort=price
  // descending: 127.0.0.1:3000/api/v1/tours?sort=-price
  //127.0.0.1:3000/api/v1/tours?sort=price,-ratingsAverage&price=1497
  const features = new APIQuery(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  if (!tours) {
    return new Error('No tour found', 500);
  }

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours: tours
    }
  });
});

exports.getTour = catchAsync(async (req, res) => {
  const tour = await Tour.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: {
      tour
    }
  });
});

// eslint-disable-next-line node/no-unsupported-features/es-syntax
exports.createTour = catchAsync(async (req, res) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

exports.updateTour = catchAsync(async (req, res) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true // to check all schema validators
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
});

exports.deleteTour = catchAsync(async (req, res) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return new Error('No tour found with that ID', 404);
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
// using aggregators
exports.getToursStatistics = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: {
          $gte: 4.5
        }
      }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        avgRating: {
          $avg: '$ratingsAverage'
        },
        numTours: { $sum: 1 }, // 1 add for each document
        numRatings: { $sum: '$ratingsQuantity' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 } // ascending
    }
  ]);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: {
      stats
    }
  });
});
// using aggregator
exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1; // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});
