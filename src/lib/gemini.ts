import { GoogleGenerativeAI, type Content } from "@google/generative-ai";
import type { ChatRole } from "./types";

export type ChatTurn = { role: ChatRole; content: string };

/** Server only. Reads credentials from process.env and never returns them. */
export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_MODEL);
}

/** Gemini needs history that starts with a user turn, so merge and trim accordingly. */
function toHistory(turns: ChatTurn[]): Content[] {
  const history: Content[] = [];
  for (const turn of turns) {
    const role = turn.role === "assistant" ? "model" : "user";
    if (history.length === 0 && role !== "user") continue;
    const last = history[history.length - 1];
    if (last && last.role === role) {
      last.parts.push({ text: turn.content });
    } else {
      history.push({ role, parts: [{ text: turn.content }] });
    }
  }
  return history;
}

export async function streamChat(systemPrompt: string, turns: ChatTurn[]) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL as string,
    systemInstruction: systemPrompt,
    generationConfig: { temperature: 0.4 },
  });

  // A failed earlier send can leave a trailing user turn. Fold it into the new
  // message so the conversation keeps alternating between user and model.
  const history = toHistory(turns.slice(0, -1));
  let message = turns[turns.length - 1].content;
  const last = history[history.length - 1];
  if (last?.role === "user") {
    history.pop();
    message = `${last.parts.map((part) => part.text ?? "").join("\n")}\n${message}`;
  }

  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(message);
  // We only consume result.stream; stop the aggregate promise rejecting unhandled.
  result.response.catch(() => undefined);
  return result.stream;
}
