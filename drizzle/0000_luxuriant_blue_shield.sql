CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roomId" uuid NOT NULL,
	"senderId" uuid NOT NULL,
	"content" text NOT NULL,
	"type" text DEFAULT 'text' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_members" (
	"roomId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"joinedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"lastReadAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "room_members_roomId_userId_pk" PRIMARY KEY("roomId","userId")
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"isGroup" boolean DEFAULT false NOT NULL,
	"createdBy" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"displayName" text NOT NULL,
	"avatarUrl" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_roomId_rooms_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_users_id_fk" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_members" ADD CONSTRAINT "room_members_roomId_rooms_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_members" ADD CONSTRAINT "room_members_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_messages_room_created" ON "messages" USING btree ("roomId","createdAt");--> statement-breakpoint
CREATE INDEX "idx_room_members_user" ON "room_members" USING btree ("userId");