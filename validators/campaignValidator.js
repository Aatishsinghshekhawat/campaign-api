const { body } = require('express-validator');

exports.createCampaignValidator = [
  body('name').notEmpty().withMessage('Name is required'),
  body('channel').optional().isString(),
  body('status').optional().isIn(['Published', 'Draft', 'Enabled', 'Disabled']),
  body('startDate').optional().isISO8601().toDate(),
  body('repeat').optional().isBoolean(),
];

exports.updateCampaignValidator = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('channel').optional().isString(),
  body('status').optional().isIn(['Published', 'Draft', 'Enabled', 'Disabled']),
  body('startDate').optional().isISO8601().toDate(),
  body('repeat').optional().isBoolean(),
];
