import { HTTP_STATUS } from '../config/constants.js';
import * as articleService from '../services/articleService.js';

function handleArticleError(error, res, next) {
  if (error.message === 'Article not found') {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: error.message });
  }
  return next(error);
}

export async function getArticles(req, res, next) {
  try {
    const articles = await articleService.getPublicArticles();
    res.status(HTTP_STATUS.OK).json({ success: true, data: articles });
  } catch (error) {
    next(error);
  }
}

export async function getArticleById(req, res, next) {
  try {
    const article = await articleService.getPublicArticleById(req.params.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: article });
  } catch (error) {
    handleArticleError(error, res, next);
  }
}

export async function getAdminArticles(req, res, next) {
  try {
    const articles = await articleService.getAdminArticles();
    res.status(HTTP_STATUS.OK).json({ success: true, data: articles });
  } catch (error) {
    next(error);
  }
}

export async function createArticle(req, res, next) {
  try {
    const article = await articleService.createArticle(req.body);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
}

export async function updateArticle(req, res, next) {
  try {
    const article = await articleService.updateArticle(req.params.id, req.body);
    res.status(HTTP_STATUS.OK).json({ success: true, data: article });
  } catch (error) {
    handleArticleError(error, res, next);
  }
}

export async function updateArticleStatus(req, res, next) {
  try {
    const article = await articleService.updateArticleStatus(
      req.params.id,
      req.body.isPublished
    );
    res.status(HTTP_STATUS.OK).json({ success: true, data: article });
  } catch (error) {
    handleArticleError(error, res, next);
  }
}
