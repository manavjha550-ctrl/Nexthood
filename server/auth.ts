
import crypto from 'crypto';
import express from 'express';
import {
  getUserByEmail,
  getUserById,
  createUser,
  updateUser
} from './db/repositories/userRepository.js';
import {
  createSession,
  getSession,
  deleteSession
} from './db/repositories/sessionRepository.js';
import { db } from './db/client.js';
import { passwordResetTokens, sessions } from './db/schema.js';
import { eq, and, gt } from 'drizzle-orm';

export const authRouter = express.Router();

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function requireAdmin(req, res, next) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  next();
}

export async function authMiddleware(req, res, next) {
  const sessionId = req.cookies.nh_session_id;
  if (!sessionId) {
    req.user = null;
    return next();
  }

  try {
    const session = await getSession(sessionId);
    if (!session) {
      req.user = null;
      return next();
    }

    const user = await getUserById(session.userId);
    if (!user) {
      req.user = null;
      return next();
    }
    
    // Map to camelCase for backwards compatibility
    req.user = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role
    };
    next();
  } catch (err) {
    console.error('Auth middleware error', err);
    req.user = null;
    next();
  }
}

authRouter.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    if (!fullName || !email || !password || password.length < 6) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);

    const user = await createUser({
      fullName,
      email,
      phone,
      passwordHash,
      salt,
      role: 'CUSTOMER'
    });

    const sessionId = await createSession(user.id);

    res.cookie('nh_session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'INVALID EMAIL OR PASSWORD.' });
    }

    const hash = hashPassword(password, user.salt);
    if (hash !== user.passwordHash) {
      return res.status(401).json({ error: 'INVALID EMAIL OR PASSWORD.' });
    }

    const sessionId = await createSession(user.id);

    res.cookie('nh_session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

authRouter.post('/logout', async (req, res) => {
  try {
    const sessionId = req.cookies.nh_session_id;
    if (sessionId) {
      await deleteSession(sessionId);
    }
    res.clearCookie('nh_session_id');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

authRouter.get('/me', authMiddleware, (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(user);
});

authRouter.put('/profile', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { fullName, email, phone } = req.body;

    if (email && email !== user.email) {
      const existing = await getUserByEmail(email);
      if (existing) return res.status(400).json({ error: 'Email already in use' });
    }

    const updated = await updateUser(user.id, {
      full_name: fullName,
      email: email,
      phone: phone
    });

    res.json({
      id: updated.id,
      fullName: updated.fullName,
      email: updated.email,
      phone: updated.phone,
      role: updated.role
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

authRouter.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { currentPassword, newPassword } = req.body;
    const dbUser = await getUserById(user.id);
    if (!dbUser) return res.status(401).json({ error: 'Unauthorized' });

    const currentHash = hashPassword(currentPassword, dbUser.salt);
    if (currentHash !== dbUser.passwordHash) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password too short' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(newPassword, salt);

    await updateUser(user.id, {
      salt,
      password_hash: passwordHash
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

authRouter.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await getUserByEmail(email);

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = Date.now() + 1000 * 60 * 60; // 1 hour
      
      await db.insert(passwordResetTokens).values({ token, userId: user.id, expiresAt });
      console.log(`[DEV] Reset token for ${email}: ${token}`);
    }

    res.json({ message: 'IF AN ACCOUNT EXISTS, A PASSWORD RESET LINK HAS BEEN SENT.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

authRouter.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const tokenRes = await db.select().from(passwordResetTokens).where(and(eq(passwordResetTokens.token, token), gt(passwordResetTokens.expiresAt, Date.now())));
    if (tokenRes.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const resetRecord = tokenRes[0];
    resetRecord.userId = resetRecord.userId;
    const user = await getUserById(resetRecord.userId);

    if (!user) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password too short' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(newPassword, salt);

    await updateUser(user.id, {
      salt,
      password_hash: passwordHash
    });

    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    await db.delete(sessions).where(eq(sessions.userId, user.id));

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
