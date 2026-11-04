"use client";

import { Lightbulb, Pin, Sigma, type LucideIcon } from "lucide-react";
import { InlineText } from "@/components/ui/InlineText";
import type { Block, CalloutVariant } from "@/lib/types";
import { DiagramFrame } from "./DiagramFrame";

const CALLOUTS: Record<CalloutVariant, { label: string; icon: LucideIcon }> = {
  formula: { label: "Key Formula", icon: Sigma },
  remember: { label: "Remember", icon: Pin },
  "exam-tip": { label: "Exam Tip", icon: Lightbulb },
};

export function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="my-3 leading-7">
          <InlineText text={block.text} />
        </p>
      );
    case "points":
      return (
        <ul className="my-3 list-disc space-y-1.5 pl-5 leading-7 marker:text-accent">
          {block.items.map((item, index) => (
            <li key={index}>
              <InlineText text={item} />
            </li>
          ))}
        </ul>
      );
    case "callout": {
      const { label, icon: Icon } = CALLOUTS[block.variant];
      return (
        <aside className="print-keep my-4 rounded-r border border-l-2 border-line border-l-accent bg-surface px-4 py-3">
          <p className="label-mono mb-1 flex items-center gap-1.5 !text-accent">
            <Icon aria-hidden className="h-3.5 w-3.5" />
            {label}
          </p>
          <p className={block.variant === "formula" ? "font-mono text-sm leading-6" : "text-sm leading-6"}>
            <InlineText text={block.text} />
          </p>
        </aside>
      );
    }
    case "diagram":
      return <DiagramFrame diagram={block} />;
    case "table":
      return (
        <div className="my-4 overflow-x-auto rounded border border-line">
          <table className="w-full border-collapse bg-surface text-sm">
            <thead>
              <tr className="border-b border-line">
                {block.headers.map((header) => (
                  <th key={header} scope="col" className="whitespace-nowrap px-3 py-2 text-left font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-line last:border-0">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-3 py-2 align-top">
                      <InlineText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "example":
      return (
        <div className="print-keep my-4 rounded border border-line bg-surface">
          <p className="border-b border-line px-4 py-2 text-sm font-semibold">
            <span className="label-mono mr-2">Worked example</span>
            {block.title}
          </p>
          <ol className="list-decimal space-y-1.5 py-3 pl-9 pr-4 text-sm leading-6 marker:font-mono marker:text-muted">
            {block.steps.map((step, index) => (
              <li key={index}>
                <InlineText text={step} />
              </li>
            ))}
          </ol>
        </div>
      );
  }
}
