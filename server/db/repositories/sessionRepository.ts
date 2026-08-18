import { db } from '../client.js';
import { sessions, users } from '../schema.js';
import { eq, and, gt } from 'drizzle-orm';
import crypto from 'crypto';

export async function createSession(userId: string) {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt
  });

  return sessionId;
}

export async function getSession(sessionId: string) {
  const result = await db.select({
    id: sessions.id,
    userId: sessions.userId,
    expiresAt: sessions.expiresAt,
    createdAt: sessions.createdAt,
    role: users.role
  })
  .from(sessions)
  .innerJoin(users, eq(sessions.userId, users.id))
  .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, Date.now())));

  if (result.length === 0) return null;
  return result[0];
}

export async function deleteSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}
