"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, RotateCcw, Send, Square, Trash2 } from "lucide-react";
import { Button, PageHeader, Skeleton } from "@/components/ui/primitives";
import { ChapterSelect } from "@/components/ui/ChapterSelect";
import { getChapter } from "@/content/chapters";
import { useHydrated, useLocalStorage } from "@/hooks/useLocalStorage";
import { DOUBT_MODES, MODES } from "@/lib/prompts";
import type { ChatMessage, DoubtMode } from "@/lib/types";
import { cn, makeId } from "@/lib/utils";
import { ChatBubble } from "./ChatBubble";

const EMPTY_CHAT: ChatMessage[] = [];
const MAX_HISTORY_SENT = 20;

const GENERAL_STARTERS = [
  "What is the difference between Von Neumann and Harvard architecture?",
  "Multiply 5 and -3 using Booth's algorithm, step by step",
  "A cache has a 5% miss rate, 1 ns hit time and 100 ns miss penalty. Find the AMAT.",
  "Explain data hazards in pipelining with an example",
];

export function DoubtClient() {
  const params = useSearchParams();
  const hydrated = useHydrated();
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>("coa.chat.v1", EMPTY_CHAT);
  const [mode, setMode] = useState<DoubtMode>("explain");
  const [chapterSlug, setChapterSlug] = useState(() => {
    const requested = params.get("chapter") ?? "";
    return getChapter(requested) ? requested : "";
  });
  const [input, setInput] = useState(params.get("q") ?? "");
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const starters = useMemo(() => {
    const chapter = chapterSlug ? getChapter(chapterSlug) : undefined;
    if (!chapter) return GENERAL_STARTERS;
    return chapter.keyTerms.slice(0, 4).map((term) => `Explain ${term} with an example`);
  }, [chapterSlug]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length, streamingText, loading]);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function ask(history: ChatMessage[]) {
    setError(null);
    setLoading(true);
    setStreamingText("");
    const controller = new AbortController();
    abortRef.current = controller;
    let answer = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: history.slice(-MAX_HISTORY_SENT).map(({ role, content }) => ({ role, content })),
          mode,
          chapterSlug: chapterSlug || undefined,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "The AI service could not answer. Please try again.");
      }
      if (!response.body) throw new Error("The AI service returned an empty response.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setStreamingText(answer);
      }
      if (!answer.trim()) throw new Error("The AI service returned an empty response. Please try again.");
      setMessages((prev) => [...prev, { id: makeId(), role: "assistant", content: answer }]);
    } catch (caught) {
      const aborted = caught instanceof DOMException && caught.name === "AbortError";
      if (answer.trim()) {
        setMessages((prev) => [...prev, { id: makeId(), role: "assistant", content: answer }]);
      }
      if (!aborted) {
        setError(
          answer.trim()
            ? "The answer was cut off before it finished. Please ask again."
            : caught instanceof TypeError
            ? "Could not reach the server. Check your connection and try again."
            : caught instanceof Error
              ? caught.message
              : "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
      setStreamingText("");
      abortRef.current = null;
    }
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const history: ChatMessage[] = [...messages, { id: makeId(), role: "user", content: trimmed }];
    setMessages(history);
    setInput("");
    void ask(history);
  }

  function retry() {
    if (loading) return;
    if (messages[messages.length - 1]?.role === "user") void ask(messages);
  }

  function clearChat() {
    abortRef.current?.abort();
    setMessages(EMPTY_CHAT);
    setError(null);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send(input);
    }
  }

  const isEmpty = hydrated && messages.length === 0 && !loading;

  return (
    <div>
      <PageHeader label="COA Lab / Doubt solver" title="AI Doubt Solver" description="Ask about any COA topic. Numericals are solved step by step." />

      <div className="mb-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <div>
          <p id="mode-label" className="label-mono mb-1">
            Mode
          </p>
          <div role="group" aria-labelledby="mode-label" className="grid grid-cols-2 gap-1 lg:grid-cols-4">
            {DOUBT_MODES.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={mode === id}
                title={MODES[id].hint}
                onClick={() => setMode(id)}
                className={cn(
                  "min-h-10 rounded border px-2 py-1 text-sm",
                  mode === id ? "border-accent bg-accent text-on-accent" : "border-line bg-surface hover:border-accent"
                )}
              >
                {MODES[id].label}
              </button>
            ))}
          </div>
        </div>
        <ChapterSelect value={chapterSlug} onChange={setChapterSlug} allowAll allLabel="Any chapter" id="doubt-chapter" />
      </div>

      <div className="space-y-6">
        {!hydrated && <Skeleton className="h-32" />}

        {isEmpty && (
          <div className="rounded border border-dashed border-line p-5">
            <p className="label-mono mb-3">Try asking</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {starters.map((starter) => (
                <li key={starter}>
                  <button
                    type="button"
                    onClick={() => send(starter)}
                    className="h-full w-full rounded border border-line bg-surface p-3 text-left text-sm hover:border-accent"
                  >
                    {starter}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {hydrated && messages.map((message) => <ChatBubble key={message.id} role={message.role} content={message.content} />)}

        {loading &&
          (streamingText ? (
            <ChatBubble role="assistant" content={streamingText} />
          ) : (
            <p role="status" className="label-mono animate-pulse">
              Thinking
            </p>
          ))}

        {error && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded border border-bad/50 bg-bad/5 p-3 text-sm">
            <span className="flex items-center gap-2">
              <AlertTriangle aria-hidden className="h-4 w-4 shrink-0 text-bad" />
              {error}
            </span>
            {messages[messages.length - 1]?.role === "user" && (
              <Button size="sm" onClick={retry}>
                <RotateCcw aria-hidden className="h-3.5 w-3.5" />
                Retry
              </Button>
            )}
          </div>
        )}
        {/* The margin keeps the end of an answer clear of the sticky input box. */}
        <div ref={bottomRef} className="scroll-mb-44" />
      </div>

      <div className="sticky bottom-0 mt-6 border-t border-line bg-paper py-3">
        <label htmlFor="doubt-input" className="sr-only">
          Your question
        </label>
        <textarea
          id="doubt-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          maxLength={6000}
          placeholder="Type your doubt. Enter to send, Shift+Enter for a new line."
          className="w-full resize-y rounded border border-line bg-surface p-3 text-sm leading-6 placeholder:text-muted"
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <Button size="sm" variant="ghost" onClick={clearChat} disabled={messages.length === 0 && !loading}>
            <Trash2 aria-hidden className="h-3.5 w-3.5" />
            Clear chat
          </Button>
          {loading ? (
            <Button onClick={() => abortRef.current?.abort()}>
              <Square aria-hidden className="h-4 w-4" />
              Stop
            </Button>
          ) : (
            <Button variant="primary" onClick={() => send(input)} disabled={!input.trim()}>
              <Send aria-hidden className="h-4 w-4" />
              Send
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
