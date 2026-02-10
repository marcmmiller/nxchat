"use server";

import { eq, asc, sql } from "drizzle-orm";
import { db } from "@/app/drizzle/db";
import { messages, users } from "@/app/drizzle/schema";

export async function getMessages(roomId: string) {
  return db
    .select({
      id: messages.id,
      content: messages.content,
      createdAt: messages.createdAt,
      senderEmail: users.email,
      senderName: users.displayName,
    })
    .from(messages)
    .innerJoin(users, eq(messages.senderId, users.id))
    .where(eq(messages.roomId, roomId))
    .orderBy(asc(messages.createdAt));
}

export async function sendMessage(
  roomId: string,
  userEmail: string,
  content: string
) {
  const [user] = await db
    .select({ id: users.id, displayName: users.displayName })
    .from(users)
    .where(eq(users.email, userEmail))
    .limit(1);

  if (!user) {
    throw new Error(`User not found: ${userEmail}`);
  }

  const [inserted] = await db
    .insert(messages)
    .values({
      roomId,
      senderId: user.id,
      content,
    })
    .returning();

  const payload = JSON.stringify({
    id: inserted.id,
    content: inserted.content,
    createdAt: inserted.createdAt,
    senderEmail: userEmail,
    senderName: user.displayName,
  });

  await db.execute(
    sql`SELECT pg_notify(${`room:${roomId}`}, ${payload})`
  );
}
