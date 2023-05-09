const removeReservedQueryVals = query => {
  // we want to filter few field names from our query strings
  const queryObj = { ...query };
  const excludedFileds = ['page', 'sort', 'limit', 'fields'];
  excludedFileds.forEach(el => delete queryObj[el]);
  return queryObj;
};

module.exports = { removeReservedQueryVals };
