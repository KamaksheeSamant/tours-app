const filterMongoQueryVals = query => {
  // we want to filter few field names from our query strings
  let queryStr = JSON.stringify(query);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  return JSON.parse(queryStr);
};

const filterReservedQueryVals = query => {
  // we want to filter few field names from our query strings
  let queryObj = { ...query };
  const excludedFileds = ['page', 'sort', 'limit', 'fields'];
  excludedFileds.forEach(el => delete queryObj[el]);
  queryObj = filterMongoQueryVals(queryObj);
  return queryObj;
};

module.exports = { filterReservedQueryVals };
