import type { Chapter, QuizQuestion } from "@/lib/types";
import ch01 from "./ch01-intro";
import ch02 from "./ch02-data-representation";
import ch03 from "./ch03-digital-logic";
import ch04 from "./ch04-isa";
import ch05 from "./ch05-cpu-control";
import ch06 from "./ch06-pipelining";
import ch07 from "./ch07-memory";
import ch08 from "./ch08-virtual-memory";
import ch09 from "./ch09-io";
import ch10 from "./ch10-multiprocessors";

export const chapters: Chapter[] = [ch01, ch02, ch03, ch04, ch05, ch06, ch07, ch08, ch09, ch10];

const TAGS: Record<string, string> = {
  "intro-to-coa": "INTRO",
  "data-representation": "ARITHMETIC",
  "digital-logic": "LOGIC",
  "isa-addressing": "ISA",
  "cpu-control": "CPU",
  pipelining: "PIPELINE",
  memory: "MEMORY",
  "virtual-memory": "VIRTUAL MEM",
  io: "I/O",
  multiprocessors: "PARALLEL",
};

/** Monospace label such as CH-07 / MEMORY. */
export function chapterTag(chapter: Chapter): string {
  return `CH-${String(chapter.number).padStart(2, "0")} / ${TAGS[chapter.slug] ?? "COA"}`;
}

export function getChapter(slug: string): Chapter | undefined {
  return chapters.find((chapter) => chapter.slug === slug);
}

export function getAdjacent(slug: string): { previous?: Chapter; next?: Chapter } {
  const index = chapters.findIndex((chapter) => chapter.slug === slug);
  return { previous: chapters[index - 1], next: index >= 0 ? chapters[index + 1] : undefined };
}

export type TaggedQuestion = QuizQuestion & { slug: string };

export const allQuestions: TaggedQuestion[] = chapters.flatMap((chapter) =>
  chapter.quiz.map((question) => ({ ...question, slug: chapter.slug }))
);
