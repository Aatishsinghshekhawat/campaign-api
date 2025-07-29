const { param, body, validationResult } = require('express-validator');

exports.validateListIdParam = [
  param('id').exists().isInt({ min: 1 }).withMessage('List ID param must be a positive integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid list ID param', errors: errors.array() });
    }
    next();
  }
];

exports.validateListNameBody = [
  body('name')
    .exists().withMessage('List name is required')
    .isString().withMessage('List name must be a string')
    .trim()
    .notEmpty().withMessage('List name cannot be empty'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid list name', errors: errors.array() });
    }
    next();
  }
];

exports.validateListFilter = [
  body('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid pagination params', errors: errors.array() });
    }
    next();
  }
];
