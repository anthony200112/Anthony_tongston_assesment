import app from './src/app.js';
import { connectDatabase } from './src/config/database.js';
import env from './src/config/env.js';
import logger from './src/utils/logger.js';
import { seedAdminUser } from './src/models/User.js';

async function start() {
  try {
    await connectDatabase();
    await seedAdminUser();

    const server = app.listen(env.port, () => {
      logger.info(`T-World API running on port ${env.port} (${env.nodeEnv})`);
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received — shutting down gracefully');
      server.close(() => process.exit(0));
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received — shutting down gracefully');
      server.close(() => process.exit(0));
    });
  } catch (err) {
    logger.error('Failed to start server', { message: err.message, stack: err.stack });
    process.exit(1);
  }
}

start();
