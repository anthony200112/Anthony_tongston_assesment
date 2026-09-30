import Joi from 'joi';
import Content from '../models/Content.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

/**
 * Resolve the acting user. If a valid JWT was supplied, use that user.
 * Otherwise fall back to the first admin so the API works without login.
 */
async function resolveUser(req) {
  if (req.user) {
    const u = await User.findById(req.user.id);
    if (!u) throw Object.assign(new Error('Authenticated user not found.'), { status: 404 });
    return u;
  }
  const admin = await User.findOne({ role: 'admin' });
  if (!admin) throw Object.assign(new Error('No users exist yet. Create one first.'), { status: 409 });
  return admin;
}

export const createContentSchema = {
  body: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    body: Joi.string().min(10).required(),
    tags: Joi.array().items(Joi.string().trim().lowercase()).default([]),
  }),
};

export const listContentSchema = {
  query: Joi.object({
    tag: Joi.string().trim().lowercase(),
    q: Joi.string().trim().allow(''),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

export async function createContent(req, res, next) {
  try {
    const user = await resolveUser(req);
    const { title, body, tags } = req.body;

    const content = await Content.create({ title, body, tags, createdBy: user._id });
    logger.info('Content created', { id: content._id, title, userId: user._id });

    res.status(201).json({
      id: content._id,
      title: content.title,
      body: content.body,
      tags: content.tags,
      createdBy: content.createdBy,
      createdAt: content.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

export async function listContent(req, res, next) {
  try {
    const { tag, q, page, limit } = req.query;
    const filter = {};
    if (tag) filter.tags = tag;
    if (q) filter.$text = { $search: q };

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Content.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Content.countDocuments(filter),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items: items.map((c) => ({
        id: c._id,
        title: c.title,
        body: c.body,
        tags: c.tags,
        createdBy: c.createdBy,
        createdAt: c.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function getContent(req, res, next) {
  try {
    const content = await Content.findById(req.params.id).lean();
    if (!content) throw Object.assign(new Error(`Content "${req.params.id}" not found.`), { status: 404 });

    res.json({
      id: content._id,
      title: content.title,
      body: content.body,
      tags: content.tags,
      createdBy: content.createdBy,
      createdAt: content.createdAt,
    });
  } catch (err) {
    next(err);
  }
}
