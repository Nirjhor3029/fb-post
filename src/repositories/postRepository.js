const Post = require('../models/Post');

class PostRepository {
  async findFirstUnposted() {
    return Post.findOne({ is_posted: 0 })
      .sort({ created_at: 1 })
      .lean();
  }

  async markAsPosted(id) {
    return Post.findByIdAndUpdate(
      id,
      {
        is_posted: 1,
        posted_at: new Date(),
        updated_at: new Date(),
      },
      { new: true }
    ).lean();
  }

  async create(postData) {
    return Post.create(postData);
  }

  async findAll(query = {}, options = {}) {
    const { page = 1, limit = 10, sort = { created_at: -1 } } = options;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query),
    ]);

    return {
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id) {
    return Post.findById(id).lean();
  }

  async deleteById(id) {
    return Post.findByIdAndDelete(id);
  }
}

module.exports = new PostRepository();
