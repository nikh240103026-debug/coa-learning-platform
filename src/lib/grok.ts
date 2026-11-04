import type { ChatRole } from "./types";

export type ChatTurn = { role: ChatRole; content: string };

const GROK_API_URL = "https://api.x.ai/v1/chat/completions";

export function isGrokConfigured(): boolean {
  return Boolean(process.env.GROK_API_KEY && process.env.GROK_MODEL);
}

type GrokError = Error & { status?: number };

function makeGrokError(response: Response, body: string): GrokError {
  let message = `Grok request failed with status ${response.status}.`;
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } };
    if (parsed.error?.message) message = parsed.error.message;
  } catch {
    // Keep the safe status-based message when the provider response is not JSON.
  }
  const error = new Error(message) as GrokError;
  error.status = response.status;
  return error;
}

export async function streamChat(systemPrompt: string, turns: ChatTurn[]) {
  const response = await fetch(GROK_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROK_API_KEY as string}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROK_MODEL as string,
      stream: true,
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        ...turns.map((turn) => ({ role: turn.role, content: turn.content })),
      ],
    }),
  });

  if (!response.ok || !response.body) {
    throw makeGrokError(response, await response.text());
  }

  return readGrokStream(response.body);
}

async function* readGrokStream(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        const data = event
          .split("\n")
          .find((line) => line.startsWith("data:"))
          ?.slice(5)
          .trim();
        if (!data || data === "[DONE]") continue;
        const parsed = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> };
        const text = parsed.choices?.[0]?.delta?.content;
        if (text) yield text;
      }

      if (done) break;
    }
  } finally {
    reader.releaseLock();
  }
}
