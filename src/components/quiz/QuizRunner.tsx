"use client";

import { useRef, useState } from "react";
import { Bookmark, BookmarkCheck, Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { useProgress } from "@/hooks/useProgress";
import type { Chapter, QuizQuestion } from "@/lib/types";
import { cn } from "@/lib/utils";

export function QuestionReview({ question, selected, index }: { question: QuizQuestion; selected: number | undefined; index: number }) {
  return (
    <div>
      <p className="font-medium leading-6">
        <span className="mr-2 font-mono text-sm text-accent">Q{index + 1}</span>
        {question.question}
      </p>
      <ul className="mt-3 space-y-1.5">
        {question.options.map((option, i) => {
          const isCorrect = i === question.answerIndex;
          const isChosen = i === selected;
          return (
            <li
              key={i}
              className={cn(
                "flex items-start gap-2 rounded border px-3 py-2 text-sm",
                isCorrect ? "border-ok bg-ok/10" : isChosen ? "border-bad bg-bad/10" : "border-line"
              )}
            >
              {isCorrect && <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ok" />}
              {isChosen && !isCorrect && <X aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-bad" />}
              <span>
                {option}
                {isCorrect && <span className="sr-only"> (correct answer)</span>}
                {isChosen && <span className="sr-only"> (your answer)</span>}
              </span>
            </li>
          );
        })}
      </ul>
      {selected === undefined && <p className="mt-2 text-sm text-bad">You did not answer this question.</p>}
      <p className="mt-2 border-l-2 border-accent pl-3 text-sm leading-6 text-muted">{question.explanation}</p>
    </div>
  );
}

export function QuizRunner({ questions, chapter }: { questions: QuizQuestion[]; chapter: Chapter }) {
  const { recordQuiz, toggleBookmark, isBookmarked } = useProgress();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const answeredCount = Object.keys(answers).length;
  const score = questions.filter((q) => answers[q.id] === q.answerIndex).length;

  function submit() {
    recordQuiz(
      chapter.slug,
      chapter.title,
      score,
      questions.length,
      questions.map((q) => ({ topic: q.topic, correct: answers[q.id] === q.answerIndex, slug: chapter.slug }))
    );
    setSubmitted(true);
    topRef.current?.scrollIntoView({ block: "start" });
  }

  function retake() {
    setAnswers({});
    setSubmitted(false);
    topRef.current?.scrollIntoView({ block: "start" });
  }

  return (
    <div ref={topRef} className="max-w-3xl scroll-mt-32">
      {submitted ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded border border-accent bg-surface p-4" role="status">
          <div>
            <p className="label-mono">Result</p>
            <p className="font-mono text-2xl font-medium">
              {score}/{questions.length}
              <span className="ml-2 text-base text-muted">{Math.round((score / questions.length) * 100)}%</span>
            </p>
          </div>
          <Button onClick={retake}>
            <RotateCcw aria-hidden className="h-4 w-4" />
            Retake test
          </Button>
        </div>
      ) : (
        <p className="label-mono mb-4">
          {questions.length} questions / {answeredCount} answered
        </p>
      )}

      <ol className="space-y-4">
        {questions.map((question, index) => {
          const bookmarkId = `question:${question.id}`;
          const saved = isBookmarked(bookmarkId);
          return (
            <li key={question.id} className="relative rounded border border-line bg-surface p-4 pr-10">
              <button
                type="button"
                onClick={() =>
                  toggleBookmark({
                    id: bookmarkId,
                    kind: "question",
                    slug: chapter.slug,
                    title: question.question,
                    href: `/chapters/${chapter.slug}#quiz`,
                  })
                }
                aria-pressed={saved}
                aria-label={saved ? `Remove bookmark for question ${index + 1}` : `Bookmark question ${index + 1}`}
                className="absolute right-3 top-3 rounded p-1 text-muted hover:text-accent"
              >
                {saved ? <BookmarkCheck aria-hidden className="h-4 w-4 text-accent" /> : <Bookmark aria-hidden className="h-4 w-4" />}
              </button>

              {submitted ? (
                <QuestionReview question={question} selected={answers[question.id]} index={index} />
              ) : (
                <fieldset>
                  <legend className="font-medium leading-6">
                    <span className="mr-2 font-mono text-sm text-accent">Q{index + 1}</span>
                    {question.question}
                  </legend>
                  <div className="mt-3 space-y-1.5">
                    {question.options.map((option, i) => (
                      <label
                        key={i}
                        className={cn(
                          "flex cursor-pointer items-start gap-2 rounded border px-3 py-2 text-sm hover:border-accent",
                          answers[question.id] === i ? "border-accent bg-accent/10" : "border-line"
                        )}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          checked={answers[question.id] === i}
                          onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: i }))}
                          className="mt-0.5 accent-[rgb(var(--accent))]"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
            </li>
          );
        })}
      </ol>

      {!submitted && (
        <div className="mt-6 flex items-center gap-3">
          <Button variant="primary" onClick={submit} disabled={answeredCount === 0}>
            Submit test
          </Button>
          {answeredCount < questions.length && answeredCount > 0 && (
            <span className="text-sm text-muted">{questions.length - answeredCount} unanswered</span>
          )}
        </div>
      )}
    </div>
  );
}
