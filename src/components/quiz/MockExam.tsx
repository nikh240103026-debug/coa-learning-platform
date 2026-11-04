"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Flag, Timer } from "lucide-react";
import { Button, Card, Skeleton } from "@/components/ui/primitives";
import { allQuestions, chapters } from "@/content/chapters";
import { useHydrated, useLocalStorage } from "@/hooks/useLocalStorage";
import { useProgress } from "@/hooks/useProgress";
import { cn, formatClock, shuffle, timeAgo } from "@/lib/utils";
import { QuestionReview } from "./QuizRunner";

type ExamState = {
  ids: string[];
  answers: Record<string, number>;
  marked: string[];
  endsAt: number;
  current: number;
  submitted: boolean;
};

const QUESTION_BY_ID = new Map(allQuestions.map((q) => [q.id, q]));
const SIZES = [
  { count: 20, minutes: 25 },
  { count: 30, minutes: 40 },
  { count: 50, minutes: 60 },
];

/** Round-robin across chapters so every paper covers the whole syllabus. */
function pickQuestions(count: number): string[] {
  const pools = chapters.map((c) => shuffle(allQuestions.filter((q) => q.slug === c.slug)));
  const picked: string[] = [];
  let i = 0;
  while (picked.length < count && pools.some((pool) => pool.length > 0)) {
    const question = pools[i % pools.length].pop();
    if (question) picked.push(question.id);
    i += 1;
  }
  return shuffle(picked);
}

function Setup({ onStart }: { onStart: (count: number, minutes: number) => void }) {
  const { progress } = useProgress();
  const history = [...progress.mockAttempts].reverse().slice(0, 5);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <p className="label-mono mb-1">Timed / Mixed chapters</p>
        <h2 className="text-lg font-semibold">Start a mock exam</h2>
        <p className="mt-1 text-sm text-muted">
          Questions are drawn from all chapters. The paper submits itself when time runs out, and your place is kept if you reload.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {SIZES.map(({ count, minutes }) => (
            <Button key={count} className="h-16 flex-col !gap-0" onClick={() => onStart(count, minutes)}>
              <span className="font-mono">{count} questions</span>
              <span className="text-xs font-normal text-muted">{minutes} minutes</span>
            </Button>
          ))}
        </div>
      </Card>
      <Card>
        <p className="label-mono mb-3">Past attempts</p>
        {history.length === 0 ? (
          <p className="text-sm text-muted">Your mock exam scores will appear here.</p>
        ) : (
          <ul className="divide-y divide-line">
            {history.map((attempt) => (
              <li key={attempt.at} className="flex justify-between py-2 text-sm">
                <span className="font-mono">
                  {attempt.score}/{attempt.total} ({Math.round((attempt.score / attempt.total) * 100)}%)
                </span>
                <span className="font-mono text-xs text-muted">{timeAgo(attempt.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Runner({ exam, update, onSubmit }: {
  exam: ExamState;
  update: (patch: Partial<ExamState>) => void;
  onSubmit: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  const submitRef = useRef(onSubmit);

  useEffect(() => {
    submitRef.current = onSubmit;
  }, [onSubmit]);

  const remaining = exam.endsAt - now;

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (remaining <= 0) submitRef.current();
  }, [remaining]);

  const question = QUESTION_BY_ID.get(exam.ids[exam.current]);
  if (!question) return null;

  const isMarked = exam.marked.includes(question.id);
  const unanswered = exam.ids.length - Object.keys(exam.answers).length;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
      <Card>
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="label-mono">
            Question {exam.current + 1} of {exam.ids.length}
          </span>
          <span className="label-mono">{question.topic}</span>
        </div>
        <fieldset>
          <legend className="font-medium leading-6">{question.question}</legend>
          <div className="mt-4 space-y-2">
            {question.options.map((option, i) => {
              const checked = exam.answers[question.id] === i;
              return (
                <label
                  key={i}
                  className={cn(
                    "flex cursor-pointer items-start gap-2 rounded border px-3 py-2.5 text-sm hover:border-accent",
                    checked ? "border-accent bg-accent/10" : "border-line"
                  )}
                >
                  <input
                    type="radio"
                    name={question.id}
                    checked={checked}
                    onChange={() => update({ answers: { ...exam.answers, [question.id]: i } })}
                    className="mt-0.5 accent-[rgb(var(--accent))]"
                  />
                  {option}
                </label>
              );
            })}
          </div>
        </fieldset>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <Button
            aria-pressed={isMarked}
            onClick={() =>
              update({ marked: isMarked ? exam.marked.filter((id) => id !== question.id) : [...exam.marked, question.id] })
            }
          >
            <Flag aria-hidden className={cn("h-4 w-4", isMarked && "text-accent")} />
            {isMarked ? "Marked for review" : "Mark for review"}
          </Button>
          <div className="flex gap-2">
            <Button disabled={exam.current === 0} onClick={() => update({ current: exam.current - 1 })}>
              <ChevronLeft aria-hidden className="h-4 w-4" />
              Previous
            </Button>
            <Button disabled={exam.current === exam.ids.length - 1} onClick={() => update({ current: exam.current + 1 })}>
              Next
              <ChevronRight aria-hidden className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <Card className="flex items-center justify-between">
          <span className="label-mono flex items-center gap-1.5">
            <Timer aria-hidden className="h-3.5 w-3.5" />
            Time left
          </span>
          <span role="timer" className={cn("font-mono text-xl font-medium", remaining < 60000 && "text-bad")}>
            {formatClock(remaining)}
          </span>
        </Card>
        <Card>
          <p className="label-mono mb-3">Question palette</p>
          <div className="grid grid-cols-6 gap-1.5 lg:grid-cols-5">
            {exam.ids.map((id, index) => {
              const answered = exam.answers[id] !== undefined;
              const marked = exam.marked.includes(id);
              const status = [answered ? "answered" : "unanswered", marked ? "marked" : ""].filter(Boolean).join(", ");
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => update({ current: index })}
                  aria-label={`Question ${index + 1}, ${status}`}
                  aria-current={index === exam.current ? "true" : undefined}
                  className={cn(
                    "relative h-9 rounded border font-mono text-xs",
                    answered ? "border-accent bg-accent text-on-accent" : "border-line",
                    index === exam.current && "ring-2 ring-accent ring-offset-1 ring-offset-surface"
                  )}
                >
                  {index + 1}
                  {marked && (
                    <Flag aria-hidden className={cn("absolute -right-1 -top-1 h-3 w-3 fill-current", answered ? "text-ink" : "text-accent")} />
                  )}
                </button>
              );
            })}
          </div>
          <ul className="mt-3 space-y-1 text-xs text-muted">
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-accent" /> Answered
            </li>
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm border border-line" /> Unanswered
            </li>
            <li className="flex items-center gap-2">
              <Flag aria-hidden className="h-3 w-3 fill-current text-accent" /> Marked for review
            </li>
          </ul>
          <Button
            variant="primary"
            className="mt-4 w-full"
            onClick={() => {
              const message = unanswered > 0 ? `Submit with ${unanswered} unanswered?` : "Submit your exam?";
              if (window.confirm(message)) onSubmit();
            }}
          >
            Submit exam
          </Button>
        </Card>
      </div>
    </div>
  );
}

function Result({ exam, onReset }: { exam: ExamState; onReset: () => void }) {
  const questions = useMemo(() => exam.ids.flatMap((id) => QUESTION_BY_ID.get(id) ?? []), [exam.ids]);
  const score = questions.filter((q) => exam.answers[q.id] === q.answerIndex).length;
  const wrong = questions.filter((q) => exam.answers[q.id] !== q.answerIndex);

  const breakdown = chapters
    .map((chapter) => {
      const inChapter = questions.filter((q) => q.slug === chapter.slug);
      return {
        chapter,
        total: inChapter.length,
        correct: inChapter.filter((q) => exam.answers[q.id] === q.answerIndex).length,
      };
    })
    .filter((row) => row.total > 0);

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center justify-between gap-3 !border-accent">
        <div role="status">
          <p className="label-mono">Mock exam result</p>
          <p className="font-mono text-3xl font-medium">
            {score}/{questions.length}
            <span className="ml-2 text-lg text-muted">{Math.round((score / questions.length) * 100)}%</span>
          </p>
        </div>
        <Button variant="primary" onClick={onReset}>
          Start a new exam
        </Button>
      </Card>

      <section aria-label="Per-chapter breakdown">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Per-chapter breakdown</h2>
        <div className="overflow-x-auto rounded border border-line">
          <table className="w-full bg-surface text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th scope="col" className="px-3 py-2 font-semibold">Chapter</th>
                <th scope="col" className="px-3 py-2 font-semibold">Correct</th>
                <th scope="col" className="px-3 py-2 font-semibold">Score</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map(({ chapter, correct, total }) => (
                <tr key={chapter.slug} className="border-b border-line last:border-0">
                  <td className="px-3 py-2">{chapter.title}</td>
                  <td className="px-3 py-2 font-mono">{correct}/{total}</td>
                  <td className="px-3 py-2 font-mono">{Math.round((correct / total) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-label="Review of wrong answers">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Review wrong answers ({wrong.length})</h2>
        {wrong.length === 0 ? (
          <p className="text-sm text-muted">Every answer was correct.</p>
        ) : (
          <ol className="space-y-4">
            {wrong.map((question, index) => (
              <li key={question.id} className="rounded border border-line bg-surface p-4">
                <QuestionReview question={question} selected={exam.answers[question.id]} index={index} />
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

export function MockExam() {
  const hydrated = useHydrated();
  const { recordMock } = useProgress();
  const [exam, setExam] = useLocalStorage<ExamState | null>("coa.mock.v1", null);
  const submittedRef = useRef(false);

  const update = useCallback(
    (patch: Partial<ExamState>) => setExam((prev) => (prev ? { ...prev, ...patch } : prev)),
    [setExam]
  );

  const submit = useCallback(() => {
    if (!exam || exam.submitted || submittedRef.current) return;
    submittedRef.current = true;
    const questions = exam.ids.flatMap((id) => QUESTION_BY_ID.get(id) ?? []);
    const score = questions.filter((q) => exam.answers[q.id] === q.answerIndex).length;
    recordMock(
      score,
      questions.length,
      questions.map((q) => ({ topic: q.topic, correct: exam.answers[q.id] === q.answerIndex, slug: q.slug }))
    );
    update({ submitted: true });
  }, [exam, recordMock, update]);

  if (!hydrated) return <Skeleton className="h-64" />;

  if (!exam) {
    return (
      <Setup
        onStart={(count, minutes) => {
          submittedRef.current = false;
          setExam({
            ids: pickQuestions(count),
            answers: {},
            marked: [],
            endsAt: Date.now() + minutes * 60000,
            current: 0,
            submitted: false,
          });
        }}
      />
    );
  }

  return exam.submitted ? (
    <Result exam={exam} onReset={() => setExam(null)} />
  ) : (
    <Runner exam={exam} update={update} onSubmit={submit} />
  );
}
