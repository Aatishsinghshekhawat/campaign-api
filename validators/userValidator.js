const { body } = require('express-validator');

exports.validateUserCreation = [
  body('name')
    .matches(/^[A-Za-z\s.]+$/)
    .withMessage('Name must contain only letters, dots, and spaces'),

  body('email')
    .isEmail()
    .withMessage('Valid email is required'),

  body('password')
    .isLength({ min: 4 })
    .withMessage('Password must be at least 4 characters'),

  body('mobile')
    .matches(/^\d{10,15}$/)
    .withMessage('Mobile must be numeric and 10-15 digits (with country code)'),
];
