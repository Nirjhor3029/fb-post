const { StatusCodes } = require('http-status-codes');
const config = require('../config');
const { ValidationError } = require('./validate');

class AppError extends Error {
  constructor(message, code, statusCode) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

const errorHandler = (err, req, res, next) => {
  let response = {
    success: false,
    error: {},
  };

  if (err instanceof ValidationError) {
    response.error = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: err.details,
    };
    return res.status(err.statusCode).json(response);
  }

  if (err instanceof AppError) {
    response.error = {
      code: err.code,
      message: err.message,
    };
    return res.status(err.statusCode).json(response);
  }

  if (err.code === 'VALIDATION_ERROR') {
    response.error = {
      code: 'FACEBOOK_TOKEN_INVALID',
      message: err.message,
    };
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response);
  }

  console.error('Unhandled error:', err);

  response.error = {
    code: 'INTERNAL_ERROR',
    message: config.nodeEnv === 'production'
      ? 'Something went wrong'
      : err.message,
  };

  if (config.nodeEnv === 'development') {
    response.error.stack = err.stack;
  }

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response);
};

module.exports = {
  errorHandler,
  AppError,
};
