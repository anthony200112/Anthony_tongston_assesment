import Joi from 'joi';
import mongoose from 'mongoose';
import User from '../models/User.js';
import TokenTransaction from '../models/TokenTransaction.js';
import ContractConversion from '../models/ContractConversion.js';
import {
  CONVERSION_RATES,
  calculateConversion,
  generateMockTxHash,
} from '../utils/tokenCalculator.js';
import logger from '../utils/logger.js';

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

export const convertSchema = {
  body: Joi.object({
    amount: Joi.number().integer().positive().required(),
    toAsset: Joi.string().valid('MOCK_USDT', 'MOCK_ETH').required(),
  }),
};

export const withdrawSchema = {
  body: Joi.object({
    amount: Joi.number().integer().positive().required(),
    address: Joi.string().trim().min(10).required(),
  }),
};

export async function getBalance(req, res, next) {
  try {
    const user = await resolveUser(req);
    res.json({ balance: user.tokenBalance });
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req, res, next) {
  try {
    const user = await resolveUser(req);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      TokenTransaction.find({ userId: user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      TokenTransaction.countDocuments({ userId: user._id }),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items: items.map((t) => ({
        id: t._id,
        type: t.type,
        source: t.source,
        amount: t.amount,
        balanceAfter: t.balanceAfter,
        referenceId: t.referenceId,
        createdAt: t.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function convert(req, res, next) {
  const session = await mongoose.startSession();
  try {
    const { amount, toAsset } = req.body;
    const { error, amountOut } = calculateConversion(amount, toAsset);
    if (error) throw Object.assign(new Error(error), { status: 400 });

    const user = await resolveUser(req);
    if (user.tokenBalance < amount) {
      throw Object.assign(
        new Error(`Insufficient token balance. You have ${user.tokenBalance} tokens but tried to convert ${amount}.`),
        { status: 400 },
      );
    }

    await session.withTransaction(async () => {
      // Debit tokens
      user.tokenBalance -= amount;
      await user.save({ session });

      const rate = CONVERSION_RATES[toAsset].tokensPerUnit;
      const txHash = generateMockTxHash();

      const conversion = await ContractConversion.create(
        [{
          userId: user._id,
          fromToken: 'TWD',
          toAsset,
          amount,
          exchangeRate: rate,
          amountOut,
          txHashMock: txHash,
          status: 'completed',
        }],
        { session },
      );

      await TokenTransaction.create(
        [{
          userId: user._id,
          type: 'CONVERT',
          source: 'MANUAL',
          amount: -amount,
          balanceAfter: user.tokenBalance,
          referenceId: conversion[0]._id,
          referenceModel: 'ContractConversion',
        }],
        { session },
      );

      logger.info('Token conversion completed', {
        userId: user._id,
        amount,
        toAsset,
        amountOut,
        txHash,
      });

      res.json({
        fromToken: 'TWD',
        toAsset,
        amountIn: amount,
        amountOut,
        exchangeRate: rate,
        txHash,
        status: 'completed',
        remainingBalance: user.tokenBalance,
      });
    });
  } catch (err) {
    next(err);
  } finally {
    session.endSession();
  }
}

export async function withdraw(req, res, next) {
  const session = await mongoose.startSession();
  try {
    const { amount, address } = req.body;
    const user = await resolveUser(req);

    if (user.tokenBalance < amount) {
      throw Object.assign(
        new Error(`Insufficient token balance. You have ${user.tokenBalance} tokens but tried to withdraw ${amount}.`),
        { status: 400 },
      );
    }

    await session.withTransaction(async () => {
      user.tokenBalance -= amount;
      await user.save({ session });

      await TokenTransaction.create(
        [{
          userId: user._id,
          type: 'WITHDRAW',
          source: 'MANUAL',
          amount: -amount,
          balanceAfter: user.tokenBalance,
        }],
        { session },
      );

      const txHash = generateMockTxHash();
      logger.info('Token withdrawal simulated', { userId: user._id, amount, address, txHash });

      res.json({
        amount,
        address,
        txHash,
        status: 'completed',
        remainingBalance: user.tokenBalance,
      });
    });
  } catch (err) {
    next(err);
  } finally {
    session.endSession();
  }
}
