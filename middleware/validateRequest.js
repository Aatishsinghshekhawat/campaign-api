const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.param,
      message: err.msg,
    }));

    return res.status(422).json({
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }
  next();
};