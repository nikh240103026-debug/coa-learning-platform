"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { Button, Card, EmptyState } from "@/components/ui/primitives";
import { ChapterSelect } from "@/components/ui/ChapterSelect";
import { InlineText } from "@/components/ui/InlineText";
import { chapters, getChapter } from "@/content/chapters";
import type { Block, Chapter } from "@/lib/types";

function calloutsOf(chapter: Chapter, variant: "formula" | "remember") {
  return chapter.sections.flatMap((section) =>
    section.blocks
      .filter((block): block is Extract<Block, { type: "callout" }> => block.type === "callout" && block.variant === variant)
      .map((block) => ({ text: block.text, from: section.title }))
  );
}

export function FormulaSheet() {
  const [slug, setSlug] = useState(chapters[0].slug);
  const chapter = getChapter(slug) as Chapter;
  const formulas = calloutsOf(chapter, "formula");
  const remember = calloutsOf(chapter, "remember");

  return (
    <div className="space-y-5">
      <div className="no-print flex flex-wrap items-end justify-between gap-3">
        <ChapterSelect value={slug} onChange={setSlug} id="sheet-chapter" />
        <Button onClick={() => window.print()}>
          <Printer aria-hidden className="h-4 w-4" />
          Print sheet
        </Button>
      </div>

      <h2 className="text-lg font-semibold tracking-tight">{chapter.title}</h2>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="label-mono mb-3">Formulas</p>
          {formulas.length === 0 ? (
            <EmptyState title="No formulas in this chapter" text="This chapter is mostly conceptual. See the definitions." />
          ) : (
            <ul className="divide-y divide-line">
              {formulas.map((item) => (
                <li key={item.text} className="py-2">
                  <p className="font-mono text-sm leading-6">
                    <InlineText text={item.text} />
                  </p>
                  <p className="label-mono mt-0.5">{item.from}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <p className="label-mono mb-3">Remember</p>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6 marker:text-accent">
            {remember.map((item) => (
              <li key={item.text}>
                <InlineText text={item.text} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div>
        <p className="label-mono mb-2">Definitions</p>
        <div className="overflow-x-auto rounded border border-line">
          <table className="w-full bg-surface text-sm">
            <tbody>
              {chapter.flashcards.map((card) => (
                <tr key={card.front} className="border-b border-line last:border-0">
                  <th scope="row" className="w-1/3 px-3 py-2 text-left align-top font-semibold">
                    {card.front}
                  </th>
                  <td className="px-3 py-2 align-top leading-6">{card.back}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
