import {
  boolean,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(),
  email: text().unique().notNull(),
  displayName: text().notNull(),
  avatarUrl: text(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const rooms = pgTable("rooms", {
  id: uuid().defaultRandom().primaryKey(),
  name: text(),
  isGroup: boolean().default(false).notNull(),
  createdBy: uuid()
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const roomMembers = pgTable(
  "room_members",
  {
    roomId: uuid()
      .references(() => rooms.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    role: text().default("member").notNull(),
    joinedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    lastReadAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.roomId, table.userId] }),
    index("idx_room_members_user").on(table.userId),
  ]
);

export const messages = pgTable(
  "messages",
  {
    id: uuid().defaultRandom().primaryKey(),
    roomId: uuid()
      .references(() => rooms.id, { onDelete: "cascade" })
      .notNull(),
    senderId: uuid()
      .references(() => users.id)
      .notNull(),
    content: text().notNull(),
    type: text().default("text").notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("idx_messages_room_created").on(table.roomId, table.createdAt)]
);
