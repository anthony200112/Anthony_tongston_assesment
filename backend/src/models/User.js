import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    tokenBalance: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

/**
 * Hash a plaintext password before saving.
 */
userSchema.statics.hashPassword = function hashPassword(plaintext) {
  return bcrypt.hash(plaintext, 10);
};

/**
 * Compare a plaintext password against the stored hash.
 */
userSchema.methods.comparePassword = function comparePassword(plaintext) {
  return bcrypt.compare(plaintext, this.passwordHash);
};

/**
 * Return a safe public representation (no password hash).
 */
userSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id.toString(),
    email: this.email,
    role: this.role,
    tokenBalance: this.tokenBalance,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);

/**
 * Ensure a default admin account exists on boot.
 * Reads credentials from env (ADMIN_EMAIL / ADMIN_PASSWORD) or falls back to seeded defaults.
 */
export async function seedAdminUser() {
  const email = env.adminEmail;
  const password = env.adminPassword;

  const existing = await User.findOne({ email });
  if (existing) return;

  const passwordHash = await User.hashPassword(password);
  await User.create({ email, passwordHash, role: 'admin', tokenBalance: 0 });
  logger.info('Seeded default admin user', { email });
}

export default User;
