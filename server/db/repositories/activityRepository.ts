import { db } from '../client.js';
import { adminActivityLogs, users } from '../schema.js';
import { eq, desc } from 'drizzle-orm';

export async function logActivity(adminId: string, action: string, entity: string, entityId: string) {
  await db.insert(adminActivityLogs).values({
    adminUserId: adminId,
    action,
    entity,
    entityId
  });
}

export async function getActivityLogs() {
  const result = await db.select({
    id: adminActivityLogs.id,
    adminUserId: adminActivityLogs.adminUserId,
    action: adminActivityLogs.action,
    entity: adminActivityLogs.entity,
    entityId: adminActivityLogs.entityId,
    timestamp: adminActivityLogs.timestamp,
    adminName: users.fullName
  })
  .from(adminActivityLogs)
  .leftJoin(users, eq(adminActivityLogs.adminUserId, users.id))
  .orderBy(desc(adminActivityLogs.timestamp))
  .limit(100);

  return result;
}
