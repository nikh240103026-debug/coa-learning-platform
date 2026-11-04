"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { ChapterSelect } from "@/components/ui/ChapterSelect";
import { InlineText } from "@/components/ui/InlineText";
import { chapters, getChapter } from "@/content/chapters";
import { useProgress } from "@/hooks/useProgress";
import type { Chapter } from "@/lib/types";

export function ImportantQuestions() {
  const [slug, setSlug] = useState(chapters[0].slug);
  const chapter = getChapter(slug) as Chapter;
  const { toggleBookmark, isBookmarked } = useProgress();

  return (
    <div className="space-y-5">
      <ChapterSelect value={slug} onChange={setSlug} id="important-chapter" />
      <ol className="max-w-3xl space-y-3">
        {chapter.importantQuestions.map((item, index) => {
          const id = `question:important:${slug}:${index}`;
          const saved = isBookmarked(id);
          return (
            <li key={id} className="rounded border border-line bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium leading-6">
                  <span className="mr-2 font-mono text-sm text-accent">Q{index + 1}</span>
                  {item.q}
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="label-mono whitespace-nowrap">{item.marks} marks</span>
                  <button
                    type="button"
                    onClick={() =>
                      toggleBookmark({ id, kind: "question", slug, title: item.q, href: "/practice#important" })
                    }
                    aria-pressed={saved}
                    aria-label={saved ? `Remove bookmark for question ${index + 1}` : `Bookmark question ${index + 1}`}
                    className="rounded p-1 text-muted hover:text-accent"
                  >
                    {saved ? <BookmarkCheck aria-hidden className="h-4 w-4 text-accent" /> : <Bookmark aria-hidden className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium text-accent">Model answer</summary>
                <p className="mt-2 whitespace-pre-line border-l-2 border-accent pl-3 text-sm leading-6">
                  <InlineText text={item.modelAnswer} />
                </p>
              </details>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
