const { body, param, validationResult } = require('express-validator');

const register = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'employee'])
    .withMessage('Role must be admin, manager, or employee'),
  body(['joining_date', 'joiningDate'])
    .optional()
    .matches(/^(?:\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{4})$/)
    .withMessage('Joining date must be YYYY-MM-DD or DD-MM-YYYY format'),
];

const login = [
  body('email')
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

module.exports = { register, login };
