const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    post_text: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    post_image: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },
    scheduled_at: {
      type: Date,
      default: null,
    },
    is_posted: {
      type: Number,
      default: 0,
      enum: [0, 1],
    },
    posted_at: {
      type: Date,
      default: null,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

postSchema.index({ is_posted: 1, scheduled_at: 1 });

postSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
