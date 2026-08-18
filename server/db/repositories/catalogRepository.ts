import { db } from '../client.js';
import { categories, collections } from '../schema.js';
import { desc, eq } from 'drizzle-orm';

export async function getCategories() {
  return await db.select().from(categories).orderBy(desc(categories.createdAt));
}
export async function getCollections() {
  return await db.select().from(collections).orderBy(desc(collections.createdAt));
}
export async function createCategory(data: any) {
  const result = await db.insert(categories).values({
    id: data.id,
    name: String(data.name).trim(),
    slug: String(data.slug || data.name).trim().toLowerCase().replace(/\s+/g, '-'),
    description: data.description || null,
    image: data.image || null,
    status: data.status || 'ACTIVE'
  }).returning();
  return result[0];
}
export async function updateCategory(id: string, data: any) {
  const result = await db.update(categories).set({
    name: data.name !== undefined ? String(data.name).trim() : undefined,
    slug: data.slug !== undefined ? String(data.slug).trim().toLowerCase() : undefined,
    description: data.description !== undefined ? data.description : undefined,
    image: data.image !== undefined ? data.image : undefined,
    status: data.status !== undefined ? data.status : undefined,
    updatedAt: new Date()
  }).where(eq(categories.id, id)).returning();
  return result[0];
}
export async function deleteCategory(id: string) {
  return db.update(categories).set({ status: 'ARCHIVED', updatedAt: new Date() }).where(eq(categories.id, id));
}
export async function createCollection(data: any) {
  const result = await db.insert(collections).values({
    id: data.id,
    name: String(data.name).trim(),
    slug: String(data.slug || data.name).trim().toLowerCase().replace(/\s+/g, '-'),
    description: data.description || null,
    coverImage: data.coverImage || null,
    status: data.status || 'ACTIVE'
  }).returning();
  return result[0];
}
export async function updateCollection(id: string, data: any) {
  const result = await db.update(collections).set({
    name: data.name !== undefined ? String(data.name).trim() : undefined,
    slug: data.slug !== undefined ? String(data.slug).trim().toLowerCase() : undefined,
    description: data.description !== undefined ? data.description : undefined,
    coverImage: data.coverImage !== undefined ? data.coverImage : undefined,
    status: data.status !== undefined ? data.status : undefined,
    updatedAt: new Date()
  }).where(eq(collections.id, id)).returning();
  return result[0];
}
export async function deleteCollection(id: string) {
  return db.update(collections).set({ status: 'ARCHIVED', updatedAt: new Date() }).where(eq(collections.id, id));
}
