import { fail, fieldErrors, readJson } from "../../lib/Http";
import { askSeek, type SeekTurn } from "../../lib/seek/Agent";
import { seekSchema } from "../../lib/Validation";

export const runtime = "nodejs";
// Three model calls run in sequence
export const maxDuration = 60;

export async function POST(request: Request) {
  const body = await readJson(request);
  if (body === null) return fail("Request body must be valid JSON.", 400);

  const parsed = seekSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Please check your message.", 400, fieldErrors(parsed.error));
  }

  if (!process.env.GEMINI_API_KEY) {
    return fail("Seek is not configured on this deployment.", 503);
  }

  const encoder = new TextEncoder();

  // Newline delimited JSON, so events render as they arrive
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: unknown) =>
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));

      try {
        for await (const event of askSeek(
          parsed.data.history as SeekTurn[],
          parsed.data.message
        )) {
          send(event);
        }
      } catch (error) {
        console.error("Seek failed:", error);
        send({
          type: "error",
          message: "Seek could not answer just now. Please try again.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
