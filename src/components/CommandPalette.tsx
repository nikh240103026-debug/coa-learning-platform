"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { chapters, chapterTag } from "@/content/chapters";
import { cn } from "@/lib/utils";
import { Dialog } from "./ui/Dialog";

type Item = { id: string; label: string; sub: string; href: string; kind: "Page" | "Chapter" | "Section" | "Term" };

const INDEX: Item[] = [
  { id: "p-dash", label: "Dashboard", sub: "Progress overview", href: "/", kind: "Page" },
  { id: "p-chapters", label: "All chapters", sub: "Browse and filter", href: "/chapters", kind: "Page" },
  { id: "p-practice", label: "Practice", sub: "Tests, mock exam, flashcards", href: "/practice", kind: "Page" },
  { id: "p-doubt", label: "AI Doubt Solver", sub: "Ask a COA question", href: "/doubt", kind: "Page" },
  { id: "p-bookmarks", label: "Bookmarks and notes", sub: "Saved items", href: "/bookmarks", kind: "Page" },
  ...chapters.flatMap((chapter) => {
    const tag = chapterTag(chapter);
    const items: Item[] = [
      { id: `c-${chapter.slug}`, label: chapter.title, sub: tag, href: `/chapters/${chapter.slug}`, kind: "Chapter" },
      ...chapter.sections.map(
        (section): Item => ({
          id: `s-${chapter.slug}-${section.id}`,
          label: section.title,
          sub: tag,
          href: `/chapters/${chapter.slug}#${section.id}`,
          kind: "Section",
        })
      ),
      ...chapter.keyTerms.map(
        (term): Item => ({
          id: `t-${chapter.slug}-${term}`,
          label: term,
          sub: tag,
          href: `/chapters/${chapter.slug}`,
          kind: "Term",
        })
      ),
    ];
    return items;
  }),
];

const MAX_RESULTS = 30;

function PaletteBody({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return INDEX.filter((i) => i.kind === "Page" || i.kind === "Chapter").slice(0, MAX_RESULTS);
    const tokens = q.split(/\s+/);
    return INDEX.filter((item) => {
      const haystack = `${item.label} ${item.sub}`.toLowerCase();
      return tokens.every((t) => haystack.includes(t));
    })
      .sort((a, b) => Number(b.label.toLowerCase().includes(q)) - Number(a.label.toLowerCase().includes(q)))
      .slice(0, MAX_RESULTS);
  }, [query]);

  function go(item: Item) {
    onClose();
    router.push(item.href);
    // Client navigation to a hash on the same page does not fire hashchange.
    window.setTimeout(() => window.dispatchEvent(new Event("hashchange")), 80);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!results.length) return;
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const next = (active + delta + results.length) % results.length;
      setActive(next);
      document.getElementById(`palette-${next}`)?.scrollIntoView({ block: "nearest" });
    } else if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      go(results[active]);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 border-b border-line px-3">
        <Search aria-hidden className="h-4 w-4 text-muted" />
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search chapters, sections and key terms"
          aria-label="Search"
          role="combobox"
          aria-expanded
          aria-controls="palette-results"
          aria-activedescendant={results[active] ? `palette-${active}` : undefined}
          className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted"
        />
        <kbd className="label-mono rounded border border-line px-1.5 py-0.5">Esc</kbd>
      </div>
      {results.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted">No matches for that search.</p>
      ) : (
        <ul id="palette-results" role="listbox" aria-label="Search results" className="max-h-[50vh] overflow-y-auto p-1">
          {results.map((item, index) => (
            <li
              key={item.id}
              id={`palette-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseEnter={() => setActive(index)}
              onClick={() => go(item)}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded px-3 py-2 text-sm",
                index === active && "bg-accent/10"
              )}
            >
              <span className="min-w-0">
                <span className="block truncate">{item.label}</span>
                <span className="label-mono block truncate">{item.sub}</span>
              </span>
              <span className="label-mono shrink-0">{item.kind}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const OPEN_PALETTE_EVENT = "coa:open-palette";

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
    };
  }, []);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      label="Search"
      className="mx-auto mt-[10vh] w-[min(640px,92vw)] rounded border border-line bg-surface text-ink backdrop:bg-ink/40"
    >
      <PaletteBody onClose={() => setOpen(false)} />
    </Dialog>
  );
}
