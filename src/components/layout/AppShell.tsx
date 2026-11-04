"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, BookOpen, Cpu, GraduationCap, LayoutDashboard, Menu, MessageCircleQuestion, Search, X } from "lucide-react";
import { CommandPalette, OPEN_PALETTE_EVENT } from "@/components/CommandPalette";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chapters", label: "Chapters", icon: BookOpen },
  { href: "/practice", label: "Practice", icon: GraduationCap },
  { href: "/doubt", label: "Doubt Solver", icon: MessageCircleQuestion },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
];

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-accent text-on-accent">
        <Cpu aria-hidden className="h-4 w-4" />
      </span>
      <span className="font-mono text-sm font-medium tracking-tight">COA Lab</span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main">
      <ul className="flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center gap-3 rounded px-3 text-sm",
                  active ? "bg-accent/10 font-medium text-accent" : "text-muted hover:bg-ink/5 hover:text-ink"
                )}
              >
                <Icon aria-hidden className="h-4 w-4" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-on-accent"
      >
        Skip to content
      </a>

      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-paper lg:flex">
        <div className="flex h-14 items-center border-b border-line px-4">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavLinks />
        </div>
        <p className="label-mono border-t border-line px-4 py-3">Progress saved on this device</p>
      </aside>

      <div className="app-main lg:pl-60">
        <header className="no-print sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-paper/95 px-4 backdrop-blur sm:px-6 lg:px-10">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              className="flex h-9 w-9 items-center justify-center rounded border border-line bg-surface"
            >
              <Menu aria-hidden className="h-4 w-4" />
            </button>
            <Brand />
          </div>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
            aria-label="Search chapters, sections and key terms"
            className="ml-auto flex h-9 items-center gap-2 rounded border border-line bg-surface px-2.5 text-sm text-muted hover:border-accent lg:ml-0 lg:w-72"
          >
            <Search aria-hidden className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="label-mono ml-auto hidden rounded-sm border border-line px-1 sm:inline">Ctrl K</kbd>
          </button>
          <ThemeToggle />
        </header>

        <main id="main" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-10">
          {children}
        </main>
      </div>

      <Dialog
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        label="Navigation menu"
        className="m-0 w-full max-w-none border-b border-line bg-paper text-ink backdrop:bg-ink/40"
      >
        <div className="p-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <Brand />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close navigation menu"
              className="flex h-9 w-9 items-center justify-center rounded border border-line"
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          </div>
          <NavLinks onNavigate={() => setDrawerOpen(false)} />
        </div>
      </Dialog>

      <CommandPalette />
    </>
  );
}
