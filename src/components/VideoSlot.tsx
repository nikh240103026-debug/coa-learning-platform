import { Video } from "lucide-react";
import { parseYouTubeId } from "@/lib/utils";

export function VideoSlot({ url, title, label }: { url?: string; title: string; label?: string }) {
  const trimmed = url?.trim();
  const youTubeId = trimmed ? parseYouTubeId(trimmed) : null;

  return (
    <figure className="overflow-hidden rounded border border-line bg-surface">
      <div className="aspect-video w-full">
        {youTubeId ? (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${youTubeId}`}
            title={title}
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : trimmed ? (
          <video className="h-full w-full bg-black" controls preload="metadata" src={trimmed} aria-label={title} />
        ) : (
          <div className="blueprint flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center">
            <Video aria-hidden className="h-7 w-7 text-accent" strokeWidth={1.5} />
            <p className="text-sm font-medium">Visualization video coming soon</p>
          </div>
        )}
      </div>
      <figcaption className="flex items-center justify-between gap-3 border-t border-line px-3 py-2">
        <span className="text-sm">{title}</span>
        {label && <span className="label-mono shrink-0">{label}</span>}
      </figcaption>
    </figure>
  );
}
