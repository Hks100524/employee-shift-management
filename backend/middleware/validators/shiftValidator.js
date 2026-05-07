const { body, param, validationResult } = require('express-validator');

const createRules = [
  body('employee_id')
    .notEmpty()
    .withMessage('Employee ID is required')
    .isMongoId()
    .withMessage('Valid employee ID required'),
  body('shift_date')
    .notEmpty()
    .withMessage('Shift date is required')
    .matches(/^(?:\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{4})$/)
    .withMessage('Shift date must be YYYY-MM-DD or DD-MM-YYYY format'),
  body('start_time')
    .notEmpty()
    .withMessage('Start time required')
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be HH:MM (24hr)'),
  body('end_time')
    .notEmpty()
    .withMessage('End time required')
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be HH:MM (24hr)'),
  body('branch')
    .trim()
    .notEmpty()
    .withMessage('Branch is required'),
];

const updateRules = [
  param('id').isMongoId().withMessage('Invalid shift ID'),
  body('employee_id').optional().isMongoId().withMessage('Valid employee ID required'),
  body('shift_date').optional().matches(/^(?:\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{4})$/).withMessage('Shift date must be YYYY-MM-DD or DD-MM-YYYY format'),
  body('start_time', 'end_time').optional().matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time HH:MM 24hr'),
];

module.exports = { createRules, updateRules };
