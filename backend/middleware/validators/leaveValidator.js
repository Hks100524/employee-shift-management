const { body, param, validationResult } = require('express-validator');

const applyRules = [
  body('leave_type')
    .notEmpty()
    .withMessage('Leave type required')
    .isIn(['casual', 'sick', 'annual', 'maternity', 'paternity', 'other'])
    .withMessage('Leave type must be casual, sick, annual, maternity, paternity, or other'),
  body('start_date')
    .notEmpty()
    .withMessage('Start date required')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Start date YYYY-MM-DD'),
  body('end_date')
    .notEmpty()
    .withMessage('End date required')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('End date YYYY-MM-DD'),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason required')
    .isLength({ max: 500 })
    .withMessage('Reason max 500 chars'),
];

const approveRules = rejectRules = [
  param('id').isMongoId().withMessage('Invalid leave ID'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment max 500 chars'),
];

module.exports = { applyRules, approveRules, rejectRules };
