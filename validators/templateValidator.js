const { body } = require('express-validator');

exports.createTemplateValidator = [
  body('title').notEmpty().withMessage('Title is required'),
  body('status')
    .isIn(['enabled', 'disabled'])
    .withMessage('Status must be enabled or disabled'),
  body('content').optional(), 
];

exports.updateTemplateValidator = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional().notEmpty().withMessage('Content cannot be empty'),
];

exports.toggleStatusValidator = [
  body('status')
    .isIn(['enabled', 'disabled'])
    .withMessage('Status must be "enabled" or "disabled"'),
];
