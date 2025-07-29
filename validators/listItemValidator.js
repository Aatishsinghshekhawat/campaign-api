const { param, body, validationResult } = require('express-validator');

exports.validateListIdParam = [
  param('listId').exists().isInt({ min: 1 }).withMessage('listId param must be a positive integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid listId param', errors: errors.array() });
    }
    next();
  }
];

exports.validateItemIdParam = [
  param('id').exists().isInt({ min: 1 }).withMessage('itemId param must be a positive integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid itemId param', errors: errors.array() });
    }
    next();
  }
];

exports.validateCsvRows = [
  body('rows').isArray({ min: 1 }).withMessage('rows must be a non-empty array'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'CSV data validation failed', errors: errors.array() });
    }
    next();
  }
];
