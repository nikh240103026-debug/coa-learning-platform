"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck, Printer } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { useProgress } from "@/hooks/useProgress";
import type { Chapter } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BlockRenderer } from "./BlockRenderer";

export function NotesView({ chapter }: { chapter: Chapter }) {
  const { markSectionRead, toggleBookmark, isBookmarked } = useProgress();
  const [activeId, setActiveId] = useState(chapter.sections[0]?.id ?? "");

  useEffect(() => {
    const elements = chapter.sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            markSectionRead(chapter.slug, entry.target.id);
          }
        }
      },
      { rootMargin: "-25% 0px -65% 0px" }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [chapter, markSectionRead]);

  const toc = (
    <ul className="space-y-0.5 text-sm">
      {chapter.sections.map((section) => (
        <li key={section.id}>
          <a
            href={`#${section.id}`}
            aria-current={activeId === section.id ? "location" : undefined}
            className={cn(
              "block border-l-2 py-1 pl-3",
              activeId === section.id ? "border-accent font-medium text-accent" : "border-line text-muted hover:text-ink"
            )}
          >
            {section.title}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_220px]">
      <div className="min-w-0">
        <details className="no-print mb-6 rounded border border-line bg-surface p-3 xl:hidden">
          <summary className="label-mono cursor-pointer">Table of contents</summary>
          <nav aria-label="Table of contents" className="mt-3">
            {toc}
          </nav>
        </details>

        <div className="rounded border border-line bg-surface p-4">
          <p className="label-mono mb-2">Learning objectives</p>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 marker:text-accent">
            {chapter.learningObjectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
        </div>

        {chapter.sections.map((section, index) => {
          const bookmarkId = `section:${chapter.slug}:${section.id}`;
          const saved = isBookmarked(bookmarkId);
          return (
            <section key={section.id} id={section.id} data-section className="mt-10">
              <div className="flex items-start justify-between gap-3 border-b border-line pb-2">
                <h2 className="text-xl font-semibold tracking-tight">
                  <span className="mr-2 font-mono text-sm font-normal text-accent">
                    {chapter.number}.{index + 1}
                  </span>
                  {section.title}
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    toggleBookmark({
                      id: bookmarkId,
                      kind: "section",
                      slug: chapter.slug,
                      title: section.title,
                      href: `/chapters/${chapter.slug}#${section.id}`,
                    })
                  }
                  aria-pressed={saved}
                  aria-label={saved ? `Remove bookmark for ${section.title}` : `Bookmark ${section.title}`}
                  className="no-print mt-1 shrink-0 rounded p-1 text-muted hover:text-accent"
                >
                  {saved ? <BookmarkCheck aria-hidden className="h-4 w-4 text-accent" /> : <Bookmark aria-hidden className="h-4 w-4" />}
                </button>
              </div>
              {section.blocks.map((block, blockIndex) => (
                <BlockRenderer key={blockIndex} block={block} />
              ))}
            </section>
          );
        })}
      </div>

      <aside className="no-print hidden xl:block">
        <div className="sticky top-32">
          <p className="label-mono mb-2">On this page</p>
          <nav aria-label="Table of contents">{toc}</nav>
          <Button size="sm" className="mt-4" onClick={() => window.print()}>
            <Printer aria-hidden className="h-3.5 w-3.5" />
            Print notes
          </Button>
        </div>
      </aside>
    </div>
  );
}
