"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User } from "lucide-react";
import type { ChatRole } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ChatBubble({ role, content }: { role: ChatRole; content: string }) {
  const isUser = role === "user";
  const Icon = isUser ? User : Bot;
  return (
    <div className="flex gap-3">
      <span
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border",
          isUser ? "border-line" : "border-accent text-accent"
        )}
      >
        <Icon aria-hidden className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="label-mono mb-1">{isUser ? "You" : "COA Lab AI"}</p>
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-6">{content}</p>
        ) : (
          <div className="ai-prose text-sm">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ children }) => (
                  <div className="overflow-x-auto">
                    <table>{children}</table>
                  </div>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
