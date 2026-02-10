import { sql } from "drizzle-orm";
import { db } from "@/app/drizzle/db";

export async function GET() {
  try {
    const result = await db.execute(sql`SELECT NOW() AS time`);
    return Response.json({ ok: true, time: result[0].time });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
