const mongoose = require("mongoose");

const AppError = require("../utils/AppError");

const notFound = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Something went wrong.";
  let errorObj = { details: error.details || null };

  // ========== MONGOOSE ERRORS ==========
  if (error.code === 11000) {
    statusCode = 409;
    const field = Object.keys(error.keyPattern || {})[0] || "field";
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    errorObj.details = { field, value: error.keyValue?.[field] };
  }

  if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation failed.";
    errorObj.details = Object.values(error.errors).map((item) => item.message);
  }

  if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${error.kind} value for ${error.path}.`;
    errorObj.details = { path: error.path, value: error.value };
  }

  if (error.name === "MongoNetworkError") {
    statusCode = 503;
    message = "Database connection failed. Please try again later.";
    errorObj.details = "Network connectivity issue with MongoDB.";
  }

  // ========== JWT ERRORS ==========
  if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please login again.";
    errorObj.details = "Malformed or invalid JWT token.";
  }

  if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired. Please login again.";
    errorObj.details = "JWT token has expired.";
  }

  // ========== APPERROR (already has statusCode) ==========
  if (error.isOperational) {
    statusCode = error.statusCode;
    message = error.message;
    errorObj = { details: error.details, code: error.statusCode };
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: errorObj,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

module.exports = {
  errorHandler,
  notFound,
};
