"use client";

import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button, EmptyState } from "@/components/ui/primitives";
import { ChapterSelect } from "@/components/ui/ChapterSelect";
import { chapters, getChapter } from "@/content/chapters";
import { useProgress, type FlashStatus } from "@/hooks/useProgress";
import type { Chapter } from "@/lib/types";

function Deck({ chapter }: { chapter: Chapter }) {
  const { progress, setFlashcard, resetFlashcards } = useProgress();
  const [reviewOnly, setReviewOnly] = useState(false);
  const [position, setPosition] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const keyFor = (index: number) => `${chapter.slug}:${index}`;
  const cards = chapter.flashcards
    .map((card, index) => ({ ...card, index }))
    .filter((card) => !reviewOnly || progress.flashcards[keyFor(card.index)] === "review");

  const known = chapter.flashcards.filter((_, i) => progress.flashcards[keyFor(i)] === "known").length;
  const review = chapter.flashcards.filter((_, i) => progress.flashcards[keyFor(i)] === "review").length;
  const card = cards[Math.min(position, cards.length - 1)];

  function move(delta: number) {
    if (!cards.length) return;
    setFlipped(false);
    setPosition((p) => (Math.min(p, cards.length - 1) + delta + cards.length) % cards.length);
  }

  function rate(status: FlashStatus) {
    if (!card) return;
    setFlashcard(keyFor(card.index), status);
    setFlipped(false);
    // In review-only mode a "known" card leaves the list, so the same position shows the next one.
    if (!(reviewOnly && status === "known")) {
      setPosition((p) => (Math.min(p, cards.length - 1) + 1) % cards.length);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs text-muted">
          {known} known / {review} to review / {chapter.flashcards.length} total
        </p>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={reviewOnly}
              onChange={(event) => {
                setReviewOnly(event.target.checked);
                setPosition(0);
                setFlipped(false);
              }}
              className="accent-[rgb(var(--accent))]"
            />
            Review pile only
          </label>
          <Button size="sm" onClick={() => resetFlashcards(chapter.slug)}>
            <RotateCcw aria-hidden className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {!card ? (
        <EmptyState title="Review pile is empty" text="Cards you mark as Review again will collect here." />
      ) : (
        <>
          <button
            type="button"
            data-flipped={flipped}
            onClick={() => setFlipped((v) => !v)}
            aria-label={flipped ? "Show the term" : "Show the answer"}
            className="flip-card block h-64 w-full rounded text-left"
          >
            <span className="flip-inner block">
              <span aria-hidden={flipped} className="flip-face blueprint flex flex-col items-center justify-center rounded border border-line p-6 text-center">
                <span className="label-mono mb-3">Term</span>
                <span className="text-lg font-semibold">{card.front}</span>
              </span>
              <span aria-hidden={!flipped} className="flip-face flip-back flex flex-col items-center justify-center overflow-y-auto rounded border border-accent bg-surface p-6 text-center">
                <span className="label-mono mb-3">Answer</span>
                <span className="text-sm leading-6">{card.back}</span>
              </span>
            </span>
          </button>

          <p className="mt-2 text-center font-mono text-xs text-muted">
            Card {Math.min(position, cards.length - 1) + 1} of {cards.length}. Select the card to flip it.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <Button aria-label="Previous card" onClick={() => move(-1)}>
              <ChevronLeft aria-hidden className="h-4 w-4" />
            </Button>
            <div className="flex gap-2">
              <Button onClick={() => rate("review")}>
                <RotateCcw aria-hidden className="h-4 w-4" />
                Review again
              </Button>
              <Button variant="primary" onClick={() => rate("known")}>
                <Check aria-hidden className="h-4 w-4" />
                I knew it
              </Button>
            </div>
            <Button aria-label="Next card" onClick={() => move(1)}>
              <ChevronRight aria-hidden className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export function Flashcards() {
  const [slug, setSlug] = useState(chapters[0].slug);
  const chapter = getChapter(slug) as Chapter;
  return (
    <div className="space-y-5">
      <ChapterSelect value={slug} onChange={setSlug} id="flashcard-chapter" />
      <Deck key={slug} chapter={chapter} />
    </div>
  );
}
