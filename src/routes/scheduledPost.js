const express = require('express');
const Joi = require('joi');
const postController = require('../controllers/postController');
const { validate } = require('../middleware/validate');
const { AppError } = require('../middleware/errorHandler');
const { StatusCodes } = require('http-status-codes');

const router = express.Router();

const createPostSchema = Joi.object({
  post_image: Joi.string()
    .uri()
    .max(2048)
    .required()
    .label('Post image URL')
    .messages({
      'string.uri': 'must be a valid URL',
      'any.required': 'is required',
    }),
  post_text: Joi.string()
    .max(5000)
    .trim()
    .allow('')
    .optional()
    .label('Post text'),
  scheduled_at: Joi.date()
    .iso()
    .greater('now')
    .optional()
    .label('Scheduled at'),
});

router.post('/schedule', validate(createPostSchema), postController.createPost);

router.get('/all', postController.getAllPosts);

router.get('/process-next', postController.processNextPost);

router.get('/:id', postController.getPostById);

router.delete('/:id', postController.deletePost);

module.exports = router;
