"use client";

import { useMemo } from "react";
import type { Chapter, ChapterStatus } from "@/lib/types";
import { dateKey } from "@/lib/utils";
import { useHydrated, useLocalStorage } from "./useLocalStorage";

export type QuizAttempt = { score: number; total: number; at: string };
export type TopicStat = { correct: number; total: number; slug: string };
export type Bookmark = {
  id: string;
  kind: "section" | "question";
  slug: string;
  title: string;
  href: string;
  at: string;
};
export type ActivityItem = { text: string; href: string; at: string };
export type FlashStatus = "known" | "review";
export type TopicResult = { topic: string; correct: boolean; slug: string };

export type ProgressState = {
  completed: Record<string, string>;
  sectionsRead: Record<string, string[]>;
  quizAttempts: Record<string, QuizAttempt[]>;
  mockAttempts: QuizAttempt[];
  topicStats: Record<string, TopicStat>;
  studyDays: Record<string, number>;
  lastVisited: { slug: string; at: string } | null;
  bookmarks: Bookmark[];
  notes: Record<string, string>;
  flashcards: Record<string, FlashStatus>;
  activity: ActivityItem[];
};

const EMPTY: ProgressState = {
  completed: {},
  sectionsRead: {},
  quizAttempts: {},
  mockAttempts: [],
  topicStats: {},
  studyDays: {},
  lastVisited: null,
  bookmarks: [],
  notes: {},
  flashcards: {},
  activity: [],
};

const MAX_ACTIVITY = 20;

function bumpDay(days: Record<string, number>, by = 1) {
  const key = dateKey();
  return { ...days, [key]: (days[key] ?? 0) + by };
}

function pushActivity(list: ActivityItem[], text: string, href: string): ActivityItem[] {
  if (list[0]?.text === text) return list;
  return [{ text, href, at: new Date().toISOString() }, ...list].slice(0, MAX_ACTIVITY);
}

function mergeTopics(stats: Record<string, TopicStat>, results: TopicResult[]) {
  const next = { ...stats };
  for (const r of results) {
    const current = next[r.topic] ?? { correct: 0, total: 0, slug: r.slug };
    next[r.topic] = {
      slug: r.slug,
      correct: current.correct + (r.correct ? 1 : 0),
      total: current.total + 1,
    };
  }
  return next;
}

export function useProgress() {
  const [stored, setStored] = useLocalStorage<ProgressState>("coa.progress.v1", EMPTY);
  const hydrated = useHydrated();
  const progress = useMemo<ProgressState>(() => ({ ...EMPTY, ...stored }), [stored]);

  const actions = useMemo(() => {
    const update = (fn: (p: ProgressState) => ProgressState) =>
      setStored((prev) => fn({ ...EMPTY, ...prev }));

    return {
      visitChapter(slug: string, title: string) {
        update((p) => ({
          ...p,
          lastVisited: { slug, at: new Date().toISOString() },
          studyDays: bumpDay(p.studyDays),
          activity: pushActivity(p.activity, `Opened ${title}`, `/chapters/${slug}`),
        }));
      },
      markSectionRead(slug: string, sectionId: string) {
        update((p) => {
          const read = p.sectionsRead[slug] ?? [];
          if (read.includes(sectionId)) return p;
          return {
            ...p,
            sectionsRead: { ...p.sectionsRead, [slug]: [...read, sectionId] },
            studyDays: bumpDay(p.studyDays),
          };
        });
      },
      toggleComplete(slug: string, title: string) {
        update((p) => {
          const completed = { ...p.completed };
          if (completed[slug]) {
            delete completed[slug];
            return { ...p, completed };
          }
          completed[slug] = new Date().toISOString();
          return {
            ...p,
            completed,
            studyDays: bumpDay(p.studyDays, 2),
            activity: pushActivity(p.activity, `Completed ${title}`, `/chapters/${slug}`),
          };
        });
      },
      recordQuiz(slug: string, title: string, score: number, total: number, results: TopicResult[]) {
        update((p) => ({
          ...p,
          quizAttempts: {
            ...p.quizAttempts,
            [slug]: [...(p.quizAttempts[slug] ?? []), { score, total, at: new Date().toISOString() }],
          },
          topicStats: mergeTopics(p.topicStats, results),
          studyDays: bumpDay(p.studyDays, 3),
          activity: pushActivity(p.activity, `Scored ${score}/${total} in ${title} test`, `/chapters/${slug}#quiz`),
        }));
      },
      recordMock(score: number, total: number, results: TopicResult[]) {
        update((p) => ({
          ...p,
          mockAttempts: [...p.mockAttempts, { score, total, at: new Date().toISOString() }],
          topicStats: mergeTopics(p.topicStats, results),
          studyDays: bumpDay(p.studyDays, 5),
          activity: pushActivity(p.activity, `Scored ${score}/${total} in a mock exam`, "/practice#mock"),
        }));
      },
      toggleBookmark(bookmark: Omit<Bookmark, "at">) {
        update((p) => {
          const exists = p.bookmarks.some((b) => b.id === bookmark.id);
          return {
            ...p,
            bookmarks: exists
              ? p.bookmarks.filter((b) => b.id !== bookmark.id)
              : [{ ...bookmark, at: new Date().toISOString() }, ...p.bookmarks],
          };
        });
      },
      setNote(slug: string, text: string) {
        update((p) => ({ ...p, notes: { ...p.notes, [slug]: text } }));
      },
      setFlashcard(key: string, status: FlashStatus) {
        update((p) => ({
          ...p,
          flashcards: { ...p.flashcards, [key]: status },
          studyDays: bumpDay(p.studyDays),
        }));
      },
      resetFlashcards(slug: string) {
        update((p) => ({
          ...p,
          flashcards: Object.fromEntries(
            Object.entries(p.flashcards).filter(([key]) => !key.startsWith(`${slug}:`))
          ),
        }));
      },
    };
  }, [setStored]);

  return {
    progress,
    hydrated,
    ...actions,
    isBookmarked: (id: string) => progress.bookmarks.some((b) => b.id === id),
  };
}

/* ---------- Pure derivations, shared by the dashboard and chapter pages ---------- */

export function chapterStatus(p: ProgressState, slug: string): ChapterStatus {
  if (p.completed[slug]) return "done";
  const started =
    (p.sectionsRead[slug]?.length ?? 0) > 0 ||
    (p.quizAttempts[slug]?.length ?? 0) > 0 ||
    p.lastVisited?.slug === slug;
  return started ? "in-progress" : "not-started";
}

/** 70% from sections read, 30% from taking the test. Only "Mark complete" reaches 100. */
export function chapterPercent(p: ProgressState, chapter: Chapter): number {
  if (p.completed[chapter.slug]) return 100;
  const read = p.sectionsRead[chapter.slug]?.length ?? 0;
  const reading = (read / Math.max(1, chapter.sections.length)) * 70;
  const quiz = (p.quizAttempts[chapter.slug]?.length ?? 0) > 0 ? 25 : 0;
  return Math.min(95, Math.round(reading + quiz));
}

export function bestScorePercent(p: ProgressState, slug: string): number | null {
  const attempts = p.quizAttempts[slug];
  if (!attempts?.length) return null;
  return Math.round(Math.max(...attempts.map((a) => (a.score / a.total) * 100)));
}

export function averageScore(p: ProgressState): number | null {
  const scores = Object.keys(p.quizAttempts)
    .map((slug) => bestScorePercent(p, slug))
    .filter((s): s is number => s !== null);
  if (!scores.length) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export function computeStreak(days: Record<string, number>): number {
  const cursor = new Date();
  if (!days[dateKey(cursor)]) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days[dateKey(cursor)]) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function weakTopics(p: ProgressState, limit = 5) {
  return Object.entries(p.topicStats)
    .map(([topic, s]) => ({ topic, slug: s.slug, accuracy: Math.round((s.correct / s.total) * 100), total: s.total }))
    .filter((t) => t.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, limit);
}
