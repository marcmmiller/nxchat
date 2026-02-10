import postgres from "postgres";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const channel = `room:${roomId}`;

  const listener = postgres(process.env.DATABASE_URL!);

  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      req.signal.addEventListener("abort", async () => {
        if (!closed) {
          closed = true;
          controller.close();
        }
        await listener.end();
      });

      await listener.listen(channel, (payload) => {
        if (!closed) {
          controller.enqueue(`data: ${payload}\n\n`);
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
