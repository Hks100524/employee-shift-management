const { body, param } = require('express-validator');

const createRules = [
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

  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required'),

  body('branch')
    .trim()
    .notEmpty()
    .withMessage('Branch is required'),

  body('designation')
    .trim()
    .notEmpty()
    .withMessage('Designation is required'),

  // 🔥 FIXED
  body(['joining_date', 'joiningDate'])
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Joining date must be YYYY-MM-DD format'),

  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),

  // 🔥 FIXED
  body(['manager_id', 'managerId'])
    .optional()
    .isMongoId()
    .withMessage('Invalid manager ID'),

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const updateRules = [
  param('id').isMongoId().withMessage('Invalid employee ID'),

  body('email')
    .optional()
    .normalizeEmail()
    .isEmail()
    .withMessage('Valid email required'),

  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),

  // 🔥 FIXED
  body(['manager_id', 'managerId'])
    .optional()
    .isMongoId()
    .withMessage('Invalid manager ID'),
];

module.exports = { createRules, updateRules };