const postRepository = require('../repositories/postRepository');
const { postToFacebook } = require('./facebook');
const logger = require('../utils/logger');

class PostService {
  async processNextScheduledPost() {
    const post = await postRepository.findFirstUnposted();

    if (!post) {
      return {
        success: false,
        message: 'No pending posts found',
      };
    }

    const result = await postToFacebook(post.post_image, post.post_text || '');

    if (!result.success) {
      logger.error(`Failed to post to Facebook: ${result.error.message}`);
      return {
        success: false,
        message: 'Failed to post to Facebook',
        error: result.error,
      };
    }

    const updatedPost = await postRepository.markAsPosted(post._id);

    return {
      success: true,
      data: {
        postId: result.postId,
        postUrl: result.postUrl,
        postedAt: result.postedAt,
        post: updatedPost,
      },
    };
  }

  async createPost(postData) {
    return postRepository.create(postData);
  }

  async getAllPosts(query = {}, options = {}) {
    return postRepository.findAll(query, options);
  }

  async getPostById(id) {
    return postRepository.findById(id);
  }

  async deletePost(id) {
    return postRepository.deleteById(id);
  }
}

module.exports = new PostService();
