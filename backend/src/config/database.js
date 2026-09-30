import mongoose from 'mongoose';
import env from './env.js';
import logger from '../utils/logger.js';

export async function connectDatabase() {
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.mongodbUri);

  logger.info('Connected to MongoDB');

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', { message: err.message });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
