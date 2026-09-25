import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    articleId: { type: String, trim: true, unique: true, sparse: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    author: { type: String, trim: true, default: 'OCCASION' },
    publishedAt: { type: Date, default: Date.now },
    isPublished: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Article = mongoose.models.Article || mongoose.model('Article', articleSchema);
