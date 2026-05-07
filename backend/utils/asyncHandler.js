const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error("ASYNC HANDLER ERROR:", err);

      // Forward to error middleware
      next(err);
    });
  };
};

module.exports = asyncHandler;