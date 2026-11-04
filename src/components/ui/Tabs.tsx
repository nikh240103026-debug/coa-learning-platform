"use client";

import { useRef, type KeyboardEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabItem = { id: string; label: string; icon?: LucideIcon };

export function Tabs({ tabs, active, onChange, label }: {
  tabs: readonly TabItem[];
  active: string;
  onChange: (id: string) => void;
  label: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = -1;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    event.preventDefault();
    onChange(tabs[next].id);
    listRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
  }

  return (
    <div ref={listRef} role="tablist" aria-label={label} className="tabs-scroll flex gap-1 overflow-x-auto">
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              "flex h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-sm",
              selected ? "border-accent font-medium text-ink" : "border-transparent text-muted hover:text-ink"
            )}
          >
            {Icon && <Icon aria-hidden className="h-4 w-4" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
