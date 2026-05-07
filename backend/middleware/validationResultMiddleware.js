const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const validationResultMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(err => ({
      field: err.path,
      msg: err.msg
    }));
    throw new AppError('Validation failed', 400, errorDetails);
  }
  next();
};

module.exports = validationResultMiddleware;
