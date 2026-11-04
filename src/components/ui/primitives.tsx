import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { ChapterStatus } from "@/lib/types";
import { cn, STATUS_LABEL } from "@/lib/utils";

type Variant = "default" | "primary" | "ghost";
type Size = "sm" | "md";

export function buttonClass(variant: Variant = "default", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded border text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    size === "sm" ? "h-8 px-2.5" : "h-10 px-4",
    variant === "primary" && "border-accent bg-accent text-on-accent hover:bg-accent/90",
    variant === "default" && "border-line bg-surface hover:border-accent",
    variant === "ghost" && "border-transparent hover:bg-ink/5",
    className
  );
}

export function Button({
  variant = "default",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button type="button" className={buttonClass(variant, size, className)} {...props} />;
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded border border-line bg-surface p-4", className)}>{children}</div>;
}

export function StatusBadge({ status }: { status: ChapterStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wide",
        status === "done" && "border-accent bg-accent text-on-accent",
        status === "in-progress" && "border-accent text-accent",
        status === "not-started" && "border-line text-muted"
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className="h-1 w-full overflow-hidden rounded-sm bg-line"
    >
      <div className="h-full bg-accent transition-[width]" style={{ width: `${clamped}%` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 112 }: { value: number; size?: number }) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Overall progress ${value} percent`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} stroke="rgb(var(--line))" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          stroke="rgb(var(--accent))"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-xl font-medium">{value}%</span>
    </div>
  );
}

export function PageHeader({ label, title, description, children }: {
  label: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="blueprint -mx-4 mb-8 border-b border-line px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
      <p className="label-mono mb-2">{label}</p>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </header>
  );
}

export function EmptyState({ icon: Icon, title, text, children }: {
  icon?: LucideIcon;
  title: string;
  text?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded border border-dashed border-line px-4 py-10 text-center">
      {Icon && <Icon aria-hidden className="h-6 w-6 text-muted" strokeWidth={1.5} />}
      <p className="font-medium">{title}</p>
      {text && <p className="max-w-md text-sm text-muted">{text}</p>}
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded bg-line/60", className)} />;
}

export function SectionTitle({ label, title }: { label?: string; title: string }) {
  return (
    <div className="mb-3">
      {label && <p className="label-mono">{label}</p>}
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
    </div>
  );
}
