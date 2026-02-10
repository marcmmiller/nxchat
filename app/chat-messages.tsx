"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  senderEmail: string;
  senderName: string;
};

export function ChatMessages({
  initialMessages,
  roomId,
  userEmail,
}: {
  initialMessages: Message[];
  roomId: string;
  userEmail: string;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const es = new EventSource(`/api/rooms/${roomId}/stream`);

    es.onmessage = (event) => {
      const msg: Message = JSON.parse(event.data);
      setMessages((prev) => [...prev, msg]);
    };

    return () => es.close();
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.length === 0 && (
        <p className="text-center text-zinc-400 text-sm">
          No messages yet. Say something!
        </p>
      )}
      {messages.map((msg) => {
        const isMe = msg.senderEmail === userEmail;
        return (
          <div
            key={msg.id}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs rounded-2xl px-4 py-2 ${
                isMe
                  ? "bg-blue-500 text-white"
                  : "bg-zinc-100 text-zinc-900"
              }`}
            >
              {!isMe && (
                <p className="text-xs font-semibold mb-0.5">
                  {msg.senderName}
                </p>
              )}
              <p className="text-sm">{msg.content}</p>
              <p
                className={`text-[10px] mt-1 ${
                  isMe ? "text-blue-100" : "text-zinc-400"
                }`}
              >
                {new Date(msg.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
