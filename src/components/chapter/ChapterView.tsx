"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Clock, FileText, Image as ImageIcon, ListChecks, MessageCircleQuestion, Sparkles, Video } from "lucide-react";
import { QuizRunner } from "@/components/quiz/QuizRunner";
import { Button, buttonClass, EmptyState, StatusBadge } from "@/components/ui/primitives";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { VideoSlot } from "@/components/VideoSlot";
import { chapterTag, getAdjacent, getChapter } from "@/content/chapters";
import { chapterStatus, useProgress } from "@/hooks/useProgress";
import type { Chapter, DiagramBlock } from "@/lib/types";
import { DiagramFrame } from "./DiagramFrame";
import { NotesView } from "./NotesView";
import { ReadingProgress } from "./ReadingProgress";

const TABS: readonly TabItem[] = [
  { id: "notes", label: "Notes", icon: FileText },
  { id: "diagrams", label: "Diagrams", icon: ImageIcon },
  { id: "video", label: "Video", icon: Video },
  { id: "quiz", label: "Quiz", icon: ListChecks },
  { id: "ask", label: "Ask AI", icon: MessageCircleQuestion },
];
const TAB_IDS = TABS.map((t) => t.id);

function DiagramsTab({ chapter }: { chapter: Chapter }) {
  const diagrams = useMemo(
    () => chapter.sections.flatMap((s) => s.blocks.filter((b): b is DiagramBlock => b.type === "diagram")),
    [chapter]
  );
  if (!diagrams.length) return <EmptyState title="No diagrams in this chapter yet" />;
  return (
    <div className="max-w-4xl">
      {diagrams.map((diagram) => (
        <DiagramFrame key={diagram.title} diagram={diagram} />
      ))}
    </div>
  );
}

function VideoTab({ chapter }: { chapter: Chapter }) {
  const sectionSlots = chapter.sections.filter((s) => s.videoUrl !== undefined);
  return (
    <div className="space-y-6">
      <VideoSlot url={chapter.videoUrl} title={`${chapter.title}: full chapter`} label="Main" />
      {sectionSlots.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {sectionSlots.map((section) => (
            <VideoSlot key={section.id} url={section.videoUrl} title={section.title} label="Section" />
          ))}
        </div>
      )}
    </div>
  );
}

function AskTab({ chapter }: { chapter: Chapter }) {
  const base = `/doubt?chapter=${chapter.slug}`;
  const starters = chapter.keyTerms.slice(0, 4).map((term) => `Explain ${term} with an example`);
  return (
    <div className="max-w-2xl rounded border border-line bg-surface p-5">
      <p className="label-mono mb-1">Doubt solver / {chapterTag(chapter)}</p>
      <h2 className="text-lg font-semibold">Stuck on something in this chapter?</h2>
      <p className="mt-1 text-sm text-muted">The doubt solver opens with this chapter&apos;s topics loaded as context.</p>
      <ul className="mt-4 space-y-1.5">
        {starters.map((starter) => (
          <li key={starter}>
            <Link href={`${base}&q=${encodeURIComponent(starter)}`} className="flex items-center gap-2 text-sm text-accent hover:underline">
              <ArrowRight aria-hidden className="h-3.5 w-3.5 shrink-0" />
              {starter}
            </Link>
          </li>
        ))}
      </ul>
      <Link href={base} className={buttonClass("primary", "md", "mt-5")}>
        <Sparkles aria-hidden className="h-4 w-4" />
        Open doubt solver
      </Link>
    </div>
  );
}

export function ChapterView({ slug }: { slug: string }) {
  const chapter = getChapter(slug) as Chapter;
  const { previous, next } = getAdjacent(slug);
  const { progress, visitChapter, toggleComplete } = useProgress();
  const [tab, setTab] = useState("notes");
  const done = Boolean(progress.completed[slug]);

  useEffect(() => {
    visitChapter(chapter.slug, chapter.title);
  }, [chapter.slug, chapter.title, visitChapter]);

  // Deep links: #quiz opens a tab, #section-id opens Notes and scrolls to it.
  useEffect(() => {
    const apply = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      if (!hash) return;
      if (TAB_IDS.includes(hash)) {
        setTab(hash);
      } else if (chapter.sections.some((s) => s.id === hash)) {
        setTab("notes");
        window.setTimeout(() => document.getElementById(hash)?.scrollIntoView(), 60);
      }
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [chapter.sections]);

  const completeButton = (
    <Button variant={done ? "default" : "primary"} aria-pressed={done} onClick={() => toggleComplete(chapter.slug, chapter.title)}>
      <Check aria-hidden className="h-4 w-4" />
      {done ? "Completed" : "Mark chapter complete"}
    </Button>
  );

  return (
    <div>
      {tab === "notes" && <ReadingProgress />}

      <header className="blueprint -mx-4 border-b border-line px-4 pb-6 pt-8 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <div className="flex flex-wrap items-center gap-3">
          <p className="label-mono">{chapterTag(chapter)}</p>
          <StatusBadge status={chapterStatus(progress, slug)} />
          <span className="flex items-center gap-1 font-mono text-xs text-muted">
            <Clock aria-hidden className="h-3 w-3" />
            {chapter.estMinutes} min read
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{chapter.title}</h1>
        <p className="mt-2 max-w-3xl text-muted">{chapter.summary}</p>
        <div className="no-print mt-4">{completeButton}</div>
      </header>

      <div className="no-print sticky top-14 z-20 -mx-4 border-b border-line bg-paper px-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <Tabs tabs={TABS} active={tab} onChange={setTab} label="Chapter sections" />
      </div>

      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="pt-6">
        {tab === "notes" && <NotesView chapter={chapter} />}
        {tab === "diagrams" && <DiagramsTab chapter={chapter} />}
        {tab === "video" && <VideoTab chapter={chapter} />}
        {tab === "quiz" && <QuizRunner key={slug} questions={chapter.quiz} chapter={chapter} />}
        {tab === "ask" && <AskTab chapter={chapter} />}
      </div>

      <footer className="no-print mt-12 border-t border-line pt-6">
        <div className="mb-6 flex justify-center">{completeButton}</div>
        <nav aria-label="Chapter navigation" className="grid gap-3 sm:grid-cols-2">
          {previous ? (
            <Link href={`/chapters/${previous.slug}`} className="rounded border border-line bg-surface p-3 hover:border-accent">
              <span className="label-mono flex items-center gap-1">
                <ArrowLeft aria-hidden className="h-3 w-3" />
                Previous
              </span>
              <span className="mt-1 block text-sm font-medium">{previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/chapters/${next.slug}`} className="rounded border border-line bg-surface p-3 text-right hover:border-accent">
              <span className="label-mono flex items-center justify-end gap-1">
                Next
                <ArrowRight aria-hidden className="h-3 w-3" />
              </span>
              <span className="mt-1 block text-sm font-medium">{next.title}</span>
            </Link>
          )}
        </nav>
      </footer>
    </div>
  );
}
