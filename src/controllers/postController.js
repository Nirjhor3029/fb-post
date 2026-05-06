const { StatusCodes } = require('http-status-codes');
const postService = require('../services/postService');
const { AppError } = require('../middleware/errorHandler');

const processNextPost = async (req, res, next) => {
  try {
    const result = await postService.processNextScheduledPost();

    if (!result.success) {
      throw new AppError(
        result.error ? result.error.message : result.message,
        result.error ? 'FACEBOOK_API_ERROR' : 'NO_PENDING_POSTS',
        result.error ? StatusCodes.BAD_REQUEST : StatusCodes.OK
      );
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

const createPost = async (req, res, next) => {
  try {
    const { post_text, post_image, scheduled_at } = req.body;

    const post = await postService.createPost({
      post_text,
      post_image,
      scheduled_at: scheduled_at ? new Date(scheduled_at) : null,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

const getAllPosts = async (req, res, next) => {
  try {
    const { page, limit, is_posted } = req.query;

    const query = {};
    if (is_posted !== undefined) {
      query.is_posted = parseInt(is_posted, 10);
    }

    const options = {};
    if (page) options.page = parseInt(page, 10);
    if (limit) options.limit = parseInt(limit, 10);

    const result = await postService.getAllPosts(query, options);

    res.status(StatusCodes.OK).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const post = await postService.getPostById(req.params.id);

    if (!post) {
      throw new AppError('Post not found', 'POST_NOT_FOUND', StatusCodes.NOT_FOUND);
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const deleted = await postService.deletePost(req.params.id);

    if (!deleted) {
      throw new AppError('Post not found', 'POST_NOT_FOUND', StatusCodes.NOT_FOUND);
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  processNextPost,
  createPost,
  getAllPosts,
  getPostById,
  deletePost,
};
