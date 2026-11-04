"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { chapterTag } from "@/content/chapters";
import { chapterPercent, chapterStatus, type ProgressState } from "@/hooks/useProgress";
import type { Chapter } from "@/lib/types";
import { ProgressBar, StatusBadge } from "@/components/ui/primitives";

export function ChapterCard({ chapter, progress }: { chapter: Chapter; progress: ProgressState }) {
  const percent = chapterPercent(progress, chapter);
  return (
    <Link
      href={`/chapters/${chapter.slug}`}
      className="group flex flex-col rounded border border-line bg-surface p-4 transition-colors hover:border-accent"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="label-mono">{chapterTag(chapter)}</span>
        <StatusBadge status={chapterStatus(progress, chapter.slug)} />
      </div>
      <h3 className="font-semibold leading-snug group-hover:text-accent">{chapter.title}</h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-muted">{chapter.summary}</p>
      <div className="mt-4 flex items-center justify-between font-mono text-xs text-muted">
        <span className="flex items-center gap-1">
          <Clock aria-hidden className="h-3 w-3" />
          {chapter.estMinutes} min
        </span>
        <span>{percent}%</span>
      </div>
      <div className="mt-1.5">
        <ProgressBar value={percent} label={`${chapter.title} progress`} />
      </div>
    </Link>
  );
}
