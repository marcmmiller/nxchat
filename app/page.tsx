import { getMessages, getRoom } from "./actions";
import { ChatForm } from "./chat-form";
import { ChatMessages } from "./chat-messages";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ room?: string; user?: string }>;
}) {
  const { room, user } = await searchParams;

  if (!room || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">nxchat</h1>
          <p className="text-zinc-500">
            Provide <code className="bg-zinc-100 px-1 rounded">room</code> and{" "}
            <code className="bg-zinc-100 px-1 rounded">user</code> search
            params to start chatting.
          </p>
          <p className="text-zinc-400 text-sm mt-2">
            e.g. <code>/?room=ROOM_UUID&user=alice@example.com</code>
          </p>
        </div>
      </div>
    );
  }

  const [roomData, chatMessages] = await Promise.all([
    getRoom(room),
    getMessages(room),
  ]);

  // Serialize dates for the client component
  const serialized = chatMessages.map((msg) => ({
    ...msg,
    createdAt: msg.createdAt.toISOString(),
  }));

  return (
    <div className="flex h-screen flex-col items-center bg-zinc-50">
      <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-sm">
        {/* Header */}
        <div className="border-b px-4 py-3">
          <p className="text-sm font-semibold">{roomData?.name ?? `Room: ${room}`}</p>
          <p className="text-xs text-zinc-500">Logged in as: {user}</p>
        </div>

        {/* Messages */}
        <ChatMessages
          initialMessages={serialized}
          roomId={room}
          userEmail={user}
        />

        {/* Input */}
        <ChatForm roomId={room} userEmail={user} />
      </div>
    </div>
  );
}
