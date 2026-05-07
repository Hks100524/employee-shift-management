const AppError = require("./AppError");

const isValidEmail = (email) =>
  typeof email === "string" &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());

const requiredString = (value, fieldName) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(`${fieldName} is required.`, 400);
  }

  return value.trim();
};

const optionalString = (value) =>
  typeof value === "string" && value.trim() ? value.trim() : "";

const normalizeEmail = (email) => {
  if (!isValidEmail(email)) {
    throw new AppError("A valid email is required.", 400);
  }

  return email.trim().toLowerCase();
};

const ensureObjectId = (value, fieldName) => {
  if (!value || typeof value !== "string" || value.length !== 24) {
    throw new AppError(`Invalid ${fieldName}.`, 400);
  }

  return value;
};

module.exports = {
  ensureObjectId,
  isValidEmail,
  normalizeEmail,
  optionalString,
  requiredString,
};
