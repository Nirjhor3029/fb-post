const Joi = require('joi');
const { StatusCodes } = require('http-status-codes');

class ValidationError extends Error {
  constructor(details) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.details = details;
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

const postSchema = Joi.object({
  imageUrl: Joi.string()
    .uri()
    .max(2048)
    .required()
    .label('Image URL')
    .messages({
      'string.uri': 'must be a valid URL',
      'string.max': 'must not exceed 2048 characters',
      'any.required': 'is required',
    }),
  caption: Joi.string()
    .max(5000)
    .trim()
    .allow('')
    .optional()
    .label('Caption'),
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return next(new ValidationError(details));
    }

    next();
  };
};

module.exports = {
  postSchema,
  validate,
  ValidationError,
};
