import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, rooms, roomMembers, messages } from "../app/drizzle/schema";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function seed() {
  const [alice, bob] = await db
    .insert(users)
    .values([
      { email: "alice@example.com", displayName: "Alice" },
      { email: "bob@example.com", displayName: "Bob" },
    ])
    .returning();

  const [room] = await db
    .insert(rooms)
    .values({ name: null, isGroup: false, createdBy: alice.id })
    .returning();

  await db.insert(roomMembers).values([
    { roomId: room.id, userId: alice.id, role: "admin" },
    { roomId: room.id, userId: bob.id, role: "member" },
  ]);

  await db.insert(messages).values([
    { roomId: room.id, senderId: alice.id, content: "Hey Bob!" },
    { roomId: room.id, senderId: bob.id, content: "Hi Alice! How are you?" },
    { roomId: room.id, senderId: alice.id, content: "Pretty good, just testing this chat app." },
    { roomId: room.id, senderId: bob.id, content: "Nice, it seems to be working!" },
  ]);

  console.log("Seeded:");
  console.log(`  Users: ${alice.email}, ${bob.email}`);
  console.log(`  Room: ${room.id}`);
  console.log(`  Messages: 4`);

  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
