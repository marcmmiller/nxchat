"use server";

import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/app/drizzle/db";
import { messages, rooms, users } from "@/app/drizzle/schema";

export async function getRoom(roomId: string) {
  const [room] = await db
    .select({ id: rooms.id, name: rooms.name })
    .from(rooms)
    .where(eq(rooms.id, roomId))
    .limit(1);
  return room;
}

export async function getMessages(roomId: string) {
  const rows = await db
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
    .orderBy(desc(messages.createdAt))
    .limit(100);
  return rows.reverse();
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
