import { db } from '../client.js';
import { users } from '../schema.js';
import { eq } from 'drizzle-orm';

export async function getUserById(id: string) {
  const result = await db.select().from(users).where(eq(users.id, id));
  return result[0];
}

export async function getUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email));
  return result[0];
}

export async function createUser(data: any) {
  const result = await db.insert(users).values({
    fullName: data.fullName,
    email: data.email,
    passwordHash: data.passwordHash,
    salt: data.salt,
    role: data.role || 'CUSTOMER'
  }).returning();
  return result[0];
}

export async function updateUser(id: string, data: any) {
  const result = await db.update(users).set({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    passwordHash: data.passwordHash,
    salt: data.salt,
    role: data.role,
    updatedAt: new Date()
  }).where(eq(users.id, id)).returning();
  return result[0];
}

export async function getAllCustomers() {
  return await db.select().from(users).where(eq(users.role, 'CUSTOMER')).orderBy(users.createdAt);
}
