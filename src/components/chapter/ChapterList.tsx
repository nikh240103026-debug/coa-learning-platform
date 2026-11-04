"use client";

import { useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import { ChapterCard } from "@/components/dashboard/ChapterCard";
import { Button, EmptyState, PageHeader } from "@/components/ui/primitives";
import { chapters } from "@/content/chapters";
import { chapterStatus, useProgress } from "@/hooks/useProgress";
import type { ChapterStatus } from "@/lib/types";
import { cn, STATUS_LABEL } from "@/lib/utils";

type Filter = "all" | ChapterStatus;
const FILTERS: Filter[] = ["all", "not-started", "in-progress", "done"];

export function ChapterList() {
  const { progress } = useProgress();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return chapters.filter((chapter) => {
      if (filter !== "all" && chapterStatus(progress, chapter.slug) !== filter) return false;
      if (!q) return true;
      return [chapter.title, chapter.summary, ...chapter.keyTerms, ...chapter.sections.map((s) => s.title)]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [query, filter, progress]);

  return (
    <div>
      <PageHeader label="COA Lab / Syllabus" title="All chapters" description="Ten chapters, each with notes, diagrams, a test and exam questions." />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search aria-hidden className="absolute left-3 top-3 h-4 w-4 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, topic or key term"
            aria-label="Search chapters"
            className="h-10 w-full rounded border border-line bg-surface pl-9 pr-3 text-sm placeholder:text-muted"
          />
        </div>
        <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-1">
          {FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={cn(
                "h-10 rounded border px-3 text-sm",
                filter === value ? "border-accent bg-accent text-on-accent" : "border-line bg-surface hover:border-accent"
              )}
            >
              {value === "all" ? "All" : STATUS_LABEL[value]}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={SearchX} title="No chapters match" text="Try another search term or clear the filter.">
          <Button
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
          >
            Clear filters
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((chapter) => (
            <ChapterCard key={chapter.slug} chapter={chapter} progress={progress} />
          ))}
        </div>
      )}
    </div>
  );
}
