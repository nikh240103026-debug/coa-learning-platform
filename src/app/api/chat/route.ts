import { NextResponse } from "next/server";
import { getChapter } from "@/content/chapters";
import { isGeminiConfigured, streamChat, type ChatTurn } from "@/lib/gemini";
import { buildSystemPrompt, isDoubtMode } from "@/lib/prompts";
import type { DoubtMode } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGES = 30;
const MAX_MESSAGE_CHARS = 6000;

type Parsed = { turns: ChatTurn[]; mode: DoubtMode; chapterSlug?: string };

function parseBody(body: unknown): Parsed | string {
  if (typeof body !== "object" || body === null) return "Invalid request body.";
  const { messages, mode, chapterSlug } = body as Record<string, unknown>;

  if (!isDoubtMode(mode)) return "Unknown mode.";
  if (!Array.isArray(messages) || messages.length === 0) return "Send at least one message.";
  if (messages.length > MAX_MESSAGES) return "This conversation is too long. Clear the chat and try again.";

  const turns: ChatTurn[] = [];
  for (const message of messages) {
    const { role, content } = (message ?? {}) as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string" || !content.trim()) {
      return "Invalid message format.";
    }
    if (content.length > MAX_MESSAGE_CHARS) return "That message is too long. Please shorten it.";
    turns.push({ role, content });
  }
  if (turns[turns.length - 1].role !== "user") return "The last message must come from the user.";

  if (chapterSlug !== undefined) {
    if (typeof chapterSlug !== "string" || !getChapter(chapterSlug)) return "Unknown chapter.";
    return { turns, mode, chapterSlug };
  }
  return { turns, mode };
}

function errorStatus(error: unknown): number | undefined {
  const status = (error as { status?: unknown })?.status;
  return typeof status === "number" ? status : undefined;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = parseBody(body);
  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  if (!isGeminiConfigured()) {
    return NextResponse.json({ error: "The AI service is not configured on the server yet." }, { status: 503 });
  }

  try {
    const stream = await streamChat(buildSystemPrompt(parsed.mode, parsed.chapterSlug), parsed.turns);
    const encoder = new TextEncoder();
    let cancelled = false;

    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (cancelled) return;
            const text = chunk.text();
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (error) {
          if (cancelled) return;
          console.error("Gemini stream failed", errorStatus(error) ?? "no status");
          controller.error(new Error("stream failed"));
        }
      },
      cancel() {
        cancelled = true;
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (error) {
    // Log only the status: SDK messages can echo request details.
    const status = errorStatus(error);
    console.error("Gemini request failed", status ?? "no status");
    if (status === 429) {
      return NextResponse.json({ error: "Too many requests right now. Please wait a moment and try again." }, { status: 429 });
    }
    return NextResponse.json({ error: "The AI service could not answer. Please try again." }, { status: 502 });
  }
}
