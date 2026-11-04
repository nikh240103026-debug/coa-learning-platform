"use client";

import { chapters } from "@/content/chapters";

export function ChapterSelect({ value, onChange, allowAll, allLabel = "All chapters", id = "chapter-select" }: {
  value: string;
  onChange: (slug: string) => void;
  allowAll?: boolean;
  allLabel?: string;
  id?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="label-mono">
        Chapter
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full max-w-md rounded border border-line bg-surface px-2 text-sm"
      >
        {allowAll && <option value="">{allLabel}</option>}
        {chapters.map((chapter) => (
          <option key={chapter.slug} value={chapter.slug}>
            {String(chapter.number).padStart(2, "0")}. {chapter.title}
          </option>
        ))}
      </select>
    </div>
  );
}
