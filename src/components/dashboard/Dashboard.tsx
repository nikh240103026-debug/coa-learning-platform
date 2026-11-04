"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Clock, Flame, Target, TrendingUp } from "lucide-react";
import { chapters, chapterTag, getChapter } from "@/content/chapters";
import {
  averageScore,
  bestScorePercent,
  chapterPercent,
  computeStreak,
  useProgress,
  weakTopics,
} from "@/hooks/useProgress";
import { buttonClass, Card, EmptyState, PageHeader, ProgressBar, ProgressRing, SectionTitle, Skeleton } from "@/components/ui/primitives";
import { dateKey, timeAgo } from "@/lib/utils";
import { ChapterCard } from "./ChapterCard";
import { ActivityChart, ScoreChart } from "./Charts";

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Flame }) {
  return (
    <Card className="flex flex-col justify-between gap-3">
      <div className="flex items-center justify-between">
        <span className="label-mono">{label}</span>
        <Icon aria-hidden className="h-4 w-4 text-accent" />
      </div>
      <span className="font-mono text-2xl font-medium">{value}</span>
    </Card>
  );
}

function lastDays(count: number, days: Record<string, number>) {
  const out: { day: string; actions: number }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    out.push({ day: `${date.getDate()}/${date.getMonth() + 1}`, actions: days[dateKey(date)] ?? 0 });
  }
  return out;
}

export function Dashboard() {
  const { progress, hydrated } = useProgress();

  const header = (
    <PageHeader
      label="COA Lab / Dashboard"
      title="Computer Organization & Architecture"
      description="Notes, working diagrams, tests and an AI doubt solver, from logic gates to multiprocessors."
    />
  );

  if (!hydrated) {
    return (
      <div>
        {header}
        <div role="status" aria-label="Loading your progress" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="mt-4 h-64" />
      </div>
    );
  }

  const overall = Math.round(chapters.reduce((sum, c) => sum + chapterPercent(progress, c), 0) / chapters.length);
  const doneCount = chapters.filter((c) => progress.completed[c.slug]).length;
  const average = averageScore(progress);
  const streak = computeStreak(progress.studyDays);
  const weak = weakTopics(progress);
  const continueChapter =
    (progress.lastVisited && getChapter(progress.lastVisited.slug)) ||
    chapters.find((c) => !progress.completed[c.slug]) ||
    chapters[0];

  const scoreData = chapters.map((c) => ({ name: String(c.number), score: bestScorePercent(progress, c.slug) ?? 0 }));
  const hasScores = Object.keys(progress.quizAttempts).length > 0;
  const hasActivity = Object.keys(progress.studyDays).length > 0;

  return (
    <div>
      {header}

      <section aria-label="Progress summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-4 sm:col-span-2 lg:col-span-1">
          <ProgressRing value={overall} size={96} />
          <div>
            <p className="label-mono">Overall</p>
            <p className="text-sm text-muted">Across all {chapters.length} chapters</p>
          </div>
        </Card>
        <Stat label="Chapters done" value={`${doneCount}/${chapters.length}`} icon={Target} />
        <Stat label="Avg quiz score" value={average === null ? "--" : `${average}%`} icon={TrendingUp} />
        <Stat label="Day streak" value={String(streak)} icon={Flame} />
      </section>

      <section aria-label="Continue learning" className="mt-4">
        <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="label-mono mb-1">{progress.lastVisited ? "Continue where you left off" : "Start here"} / {chapterTag(continueChapter)}</p>
            <h2 className="font-semibold">{continueChapter.title}</h2>
            <div className="mt-2 max-w-md">
              <ProgressBar value={chapterPercent(progress, continueChapter)} label="Chapter progress" />
            </div>
          </div>
          <Link href={`/chapters/${continueChapter.slug}`} className={buttonClass("primary")}>
            {progress.lastVisited ? "Continue" : "Begin"}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </Card>
      </section>

      <section aria-label="Charts" className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle label="Best attempt" title="Score per chapter" />
          {hasScores ? (
            <ScoreChart data={scoreData} />
          ) : (
            <EmptyState icon={BarChart3} title="No test scores yet" text="Take a chapter test to see your scores here." />
          )}
        </Card>
        <Card>
          <SectionTitle label="Last 14 days" title="Study activity" />
          {hasActivity ? (
            <ActivityChart data={lastDays(14, progress.studyDays)} />
          ) : (
            <EmptyState icon={Clock} title="No activity yet" text="Open a chapter to start your streak." />
          )}
        </Card>
      </section>

      <section aria-label="Insights" className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle label="From your test results" title="Weak topics" />
          {weak.length === 0 ? (
            <p className="text-sm text-muted">Topics scoring under 70% in tests will appear here.</p>
          ) : (
            <ul className="divide-y divide-line">
              {weak.map((t) => (
                <li key={t.topic}>
                  <Link href={`/chapters/${t.slug}`} className="flex items-center justify-between gap-3 py-2 text-sm hover:text-accent">
                    <span>{t.topic}</span>
                    <span className="font-mono text-xs text-bad">{t.accuracy}%</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <SectionTitle label="Log" title="Recent activity" />
          {progress.activity.length === 0 ? (
            <p className="text-sm text-muted">Your recent study actions will appear here.</p>
          ) : (
            <ul className="divide-y divide-line">
              {progress.activity.slice(0, 6).map((item) => (
                <li key={`${item.at}-${item.text}`}>
                  <Link href={item.href} className="flex items-center justify-between gap-3 py-2 text-sm hover:text-accent">
                    <span className="min-w-0 truncate">{item.text}</span>
                    <span className="shrink-0 font-mono text-xs text-muted">{timeAgo(item.at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section aria-labelledby="chapter-grid" className="mt-10">
        <h2 id="chapter-grid" className="mb-4 text-lg font-semibold tracking-tight">
          Chapters
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chapters.map((chapter) => (
            <ChapterCard key={chapter.slug} chapter={chapter} progress={progress} />
          ))}
        </div>
      </section>
    </div>
  );
}
