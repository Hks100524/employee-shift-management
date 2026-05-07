const AppError = require("../utils/AppError");

const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) {
    return next(new AppError("Not authorized.", 401));
  }

  if (!roles.includes(req.user.role)) {
    return next(new AppError("You do not have permission to access this resource.", 403));
  }

  return next();
};

module.exports = authorize;
