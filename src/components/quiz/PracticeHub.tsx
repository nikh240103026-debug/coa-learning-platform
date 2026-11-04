"use client";

import { useEffect, useState } from "react";
import { BookOpenCheck, FileQuestion, Layers, ListChecks, Sigma, Timer } from "lucide-react";
import { PageHeader } from "@/components/ui/primitives";
import { ChapterSelect } from "@/components/ui/ChapterSelect";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { chapters, getChapter } from "@/content/chapters";
import { bestScorePercent, useProgress } from "@/hooks/useProgress";
import type { Chapter } from "@/lib/types";
import { Flashcards } from "./Flashcards";
import { FormulaSheet } from "./FormulaSheet";
import { ImportantQuestions } from "./ImportantQuestions";
import { MockExam } from "./MockExam";
import { QuizRunner } from "./QuizRunner";

const TABS: readonly TabItem[] = [
  { id: "tests", label: "Chapter tests", icon: ListChecks },
  { id: "mock", label: "Mock exam", icon: Timer },
  { id: "flashcards", label: "Flashcards", icon: Layers },
  { id: "formulas", label: "Formula sheet", icon: Sigma },
  { id: "important", label: "Important questions", icon: FileQuestion },
];

function ChapterTests() {
  const { progress } = useProgress();
  const [slug, setSlug] = useState(chapters[0].slug);
  const chapter = getChapter(slug) as Chapter;
  const best = bestScorePercent(progress, slug);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <ChapterSelect value={slug} onChange={setSlug} id="test-chapter" />
        {best !== null && (
          <p className="flex items-center gap-1.5 font-mono text-xs text-muted">
            <BookOpenCheck aria-hidden className="h-3.5 w-3.5" />
            Best score {best}%
          </p>
        )}
      </div>
      <QuizRunner key={slug} questions={chapter.quiz} chapter={chapter} />
    </div>
  );
}

export function PracticeHub() {
  const [tab, setTab] = useState("tests");

  useEffect(() => {
    const apply = () => {
      const hash = window.location.hash.slice(1);
      if (TABS.some((t) => t.id === hash)) setTab(hash);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  return (
    <div>
      <div className="no-print">
        <PageHeader label="COA Lab / Practice" title="Test preparation" description="Chapter tests, a timed mock exam, flashcards, revision sheets and exam questions." />
      </div>
      <div className="no-print sticky top-14 z-20 -mx-4 mb-6 border-b border-line bg-paper px-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <Tabs tabs={TABS} active={tab} onChange={setTab} label="Practice sections" />
      </div>
      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === "tests" && <ChapterTests />}
        {tab === "mock" && <MockExam />}
        {tab === "flashcards" && <Flashcards />}
        {tab === "formulas" && <FormulaSheet />}
        {tab === "important" && <ImportantQuestions />}
      </div>
    </div>
  );
}
