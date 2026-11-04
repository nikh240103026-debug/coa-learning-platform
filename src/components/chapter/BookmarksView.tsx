"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, Trash2 } from "lucide-react";
import { Card, EmptyState, PageHeader, SectionTitle, Skeleton } from "@/components/ui/primitives";
import { ChapterSelect } from "@/components/ui/ChapterSelect";
import { chapters, chapterTag, getChapter } from "@/content/chapters";
import { useProgress } from "@/hooks/useProgress";

export function BookmarksView() {
  const { progress, hydrated, toggleBookmark, setNote } = useProgress();
  const [slug, setSlug] = useState(chapters[0].slug);
  const note = progress.notes[slug] ?? "";

  return (
    <div>
      <PageHeader label="COA Lab / Saved" title="Bookmarks and notes" description="Saved on this device only. Clearing browser data removes them." />

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-label="Bookmarks">
          <SectionTitle title="Bookmarks" />
          {!hydrated ? (
            <Skeleton className="h-40" />
          ) : progress.bookmarks.length === 0 ? (
            <EmptyState icon={Bookmark} title="Nothing bookmarked yet" text="Use the bookmark icon next to a section heading or a question." />
          ) : (
            <ul className="space-y-2">
              {progress.bookmarks.map((bookmark) => {
                const chapter = getChapter(bookmark.slug);
                return (
                  <li key={bookmark.id} className="flex items-start justify-between gap-3 rounded border border-line bg-surface p-3">
                    <Link href={bookmark.href} className="min-w-0 hover:text-accent">
                      <span className="label-mono block">
                        {bookmark.kind} {chapter ? `/ ${chapterTag(chapter)}` : ""}
                      </span>
                      <span className="mt-0.5 block text-sm">{bookmark.title}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleBookmark(bookmark)}
                      aria-label={`Remove bookmark: ${bookmark.title}`}
                      className="shrink-0 rounded p-1 text-muted hover:text-bad"
                    >
                      <Trash2 aria-hidden className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-label="Personal notes">
          <SectionTitle title="Personal notes" />
          <Card>
            <ChapterSelect value={slug} onChange={setSlug} id="notes-chapter" />
            <label htmlFor="personal-note" className="label-mono mb-1 mt-4 block">
              Your notes
            </label>
            <textarea
              id="personal-note"
              value={note}
              onChange={(event) => setNote(slug, event.target.value)}
              rows={12}
              placeholder="Write your own summary, doubts or formulas for this chapter."
              className="w-full resize-y rounded border border-line bg-paper p-3 text-sm leading-6 placeholder:text-muted"
            />
            <p className="mt-1 text-xs text-muted">Saved automatically as you type.</p>
          </Card>
        </section>
      </div>
    </div>
  );
}
