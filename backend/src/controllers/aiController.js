import Joi from 'joi';
import Content from '../models/Content.js';
import AIRun from '../models/AIRun.js';
import User from '../models/User.js';
import TokenTransaction from '../models/TokenTransaction.js';
import { runMockSummarization } from '../utils/mockAI.js';
import { TOKENS_PER_AI_RUN } from '../utils/tokenCalculator.js';
import logger from '../utils/logger.js';

export const summarizeSchema = {
  body: Joi.object({
    tone: Joi.string().valid('neutral', 'professional', 'casual', 'academic').default('neutral'),
    length: Joi.string().valid('short', 'medium', 'long').default('medium'),
  }),
};

/**
 * Resolve the acting user (real JWT user or first admin in mock mode).
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

export async function summarize(req, res, next) {
  try {
    const { id } = req.params;
    const { tone, length } = req.body;

    const content = await Content.findById(id);
    if (!content) throw Object.assign(new Error(`Content "${id}" not found.`), { status: 404 });

    const user = await resolveUser(req);

    let status = 'success';
    let output = '';
    let latencyMs = 0;
    let errorMessage = null;

    try {
      const result = runMockSummarization(content.body, { tone, length });
      output = result.output;
      latencyMs = result.latencyMs;
    } catch (err) {
      status = 'failed';
      errorMessage = err.message;
    }

    // Award tokens only on success
    const tokensAwarded = status === 'success' ? TOKENS_PER_AI_RUN : 0;

    const aiRun = await AIRun.create({
      contentId: content._id,
      userId: user._id,
      tone,
      length,
      status,
      output,
      latencyMs,
      tokensAwarded,
      errorMessage,
    });

    if (tokensAwarded > 0) {
      user.tokenBalance += tokensAwarded;
      await user.save();
      await TokenTransaction.create({
        userId: user._id,
        type: 'EARN',
        source: 'AI_USAGE',
        amount: tokensAwarded,
        balanceAfter: user.tokenBalance,
        referenceId: aiRun._id,
        referenceModel: 'AIRun',
      });
      logger.info('Tokens awarded', { userId: user._id, amount: tokensAwarded, balance: user.tokenBalance });
    }

    res.json({
      output,
      latencyMs,
      tokensAwarded,
      totalTokenBalance: user.tokenBalance,
      status,
    });
  } catch (err) {
    next(err);
  }
}
