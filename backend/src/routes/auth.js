import { Router } from 'express';
import Joi from 'joi';
import User from '../models/User.js';
import { signToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'user').default('user'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post('/register', async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: true, stripUnknown: true });
    if (error) throw Object.assign(new Error(error.details[0].message.replace(/"/g, '')), { status: 400 });

    const existing = await User.findOne({ email: value.email });
    if (existing) throw Object.assign(new Error(`A user with email "${value.email}" already exists.`), { status: 409 });

    const passwordHash = await User.hashPassword(value.password);
    const user = await User.create({ email: value.email, passwordHash, role: value.role });

    logger.info('User registered', { id: user._id, email: user.email, role: user.role });

    res.status(201).json({
      token: signToken(user),
      user: user.toPublic(),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: true, stripUnknown: true });
    if (error) throw Object.assign(new Error(error.details[0].message.replace(/"/g, '')), { status: 400 });

    const user = await User.findOne({ email: value.email });
    if (!user) throw Object.assign(new Error('Invalid email or password.'), { status: 401 });

    const valid = await user.comparePassword(value.password);
    if (!valid) throw Object.assign(new Error('Invalid email or password.'), { status: 401 });

    logger.info('User logged in', { id: user._id, email: user.email });

    res.json({
      token: signToken(user),
      user: user.toPublic(),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
