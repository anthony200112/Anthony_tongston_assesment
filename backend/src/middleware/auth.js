import jwt from 'jsonwebtoken';
import env from '../config/env.js';

/**
 * Sign a JWT containing the user id and role.
 */
export function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiry,
  });
}

/**
 * Verify a JWT from the Authorization header and attach req.user.
 * If no token is provided we still continue as an anonymous (mock) user
 * so the API is testable without auth. A valid token upgrades to the real user.
 */
export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    // Anonymous/mock mode: use the first admin user so API is testable without login.
    // The controllers handle the case where req.user is not set.
    req.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}
