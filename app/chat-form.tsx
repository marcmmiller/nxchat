"use client";

import { useRef } from "react";
import { sendMessage } from "./actions";

export function ChatForm({
  roomId,
  userEmail,
}: {
  roomId: string;
  userEmail: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    const content = formData.get("content") as string;
    if (!content.trim()) return;
    await sendMessage(roomId, userEmail, content.trim());
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex gap-2 p-4 border-t">
      <input
        type="text"
        name="content"
        placeholder="Type a message..."
        autoComplete="off"
        className="flex-1 rounded-full border px-4 py-2 text-sm text-black outline-none focus:border-blue-400"
      />
      <button
        type="submit"
        className="rounded-full bg-blue-500 px-5 py-2 text-sm font-medium text-white hover:bg-blue-600"
      >
        Send
      </button>
    </form>
  );
}
