const { body } = require('express-validator');

exports.validateUserCreation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 4 }).withMessage('Password must be at least 4 characters'),
  body('mobileCountryCode').isNumeric().withMessage('Country code must be numeric'),
  body('mobile').isNumeric().withMessage('Mobile number must be numeric'),
  body('roleId').isInt().withMessage('Role ID must be an integer'),
];
