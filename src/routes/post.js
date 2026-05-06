const express = require('express');
const { StatusCodes } = require('http-status-codes');
const { postToFacebook, validateToken } = require('../services/facebook');
const { validate, postSchema } = require('../middleware/validate');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

router.post('/post', validate(postSchema), async (req, res, next) => {
  try {
    const { imageUrl, caption } = req.body;

    const result = await postToFacebook(imageUrl, caption);

    if (!result.success) {
      throw new AppError(
        result.error.message,
        'FACEBOOK_API_ERROR',
        StatusCodes.BAD_REQUEST
      );
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        postId: result.postId,
        postUrl: result.postUrl,
        postedAt: result.postedAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/health', async (req, res, next) => {
  try {
    const uptime = process.uptime();

    res.status(StatusCodes.OK).json({
      status: 'healthy',
      uptime: Math.floor(uptime),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/validate', async (req, res, next) => {
  try {
    const result = await validateToken();

    if (!result.valid) {
      throw new AppError(
        result.error.message,
        'FACEBOOK_TOKEN_INVALID',
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        pageName: result.pageName,
        pageId: result.pageId,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
