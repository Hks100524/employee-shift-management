const { body, header, validationResult } = require('express-validator');

const checkInRules = [
  header('Idempotency-Key').optional(),
  body('idempotency_key').optional().isString().withMessage('Idempotency key must be string'),
];

const checkOutRules = [
  header('Idempotency-Key').optional(),
  body('idempotency_key').optional().isString().withMessage('Idempotency key must be string'),
];

module.exports = { checkInRules, checkOutRules };
