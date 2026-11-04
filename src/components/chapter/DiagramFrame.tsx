"use client";

import { useState } from "react";
import { Maximize2, Minus, Plus, X } from "lucide-react";
import { Mermaid } from "@/components/Mermaid";
import { Button } from "@/components/ui/primitives";
import { Dialog } from "@/components/ui/Dialog";
import type { DiagramBlock } from "@/lib/types";

const KIND_LABEL: Record<DiagramBlock["kind"], string> = {
  block: "Block diagram",
  flowchart: "Flowchart",
  "working-diagram": "Working diagram",
  "working-flowchart": "Working flowchart",
};

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;

export function DiagramFrame({ diagram }: { diagram: DiagramBlock }) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  return (
    <figure className="my-5 rounded border border-line bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2">
        <div className="min-w-0">
          <p className="label-mono">{KIND_LABEL[diagram.kind]}</p>
          <p className="truncate text-sm font-medium">{diagram.title}</p>
        </div>
        <Button size="sm" className="no-print shrink-0" aria-label={`View ${diagram.title} fullscreen`} onClick={() => setOpen(true)}>
          <Maximize2 aria-hidden className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Zoom</span>
        </Button>
      </div>
      <div className="p-3">
        <Mermaid chart={diagram.mermaid} label={diagram.title} />
      </div>
      <figcaption className="border-t border-line px-3 py-2 text-sm text-muted">{diagram.caption}</figcaption>

      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          setZoom(1);
        }}
        label={diagram.title}
        className="m-0 h-full max-h-none w-full max-w-none bg-paper text-ink"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2">
            <p className="min-w-0 truncate text-sm font-medium">{diagram.title}</p>
            <div className="flex shrink-0 items-center gap-1">
              <Button size="sm" aria-label="Zoom out" disabled={zoom <= MIN_ZOOM} onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 0.5))}>
                <Minus aria-hidden className="h-3.5 w-3.5" />
              </Button>
              <span className="w-12 text-center font-mono text-xs">{Math.round(zoom * 100)}%</span>
              <Button size="sm" aria-label="Zoom in" disabled={zoom >= MAX_ZOOM} onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 0.5))}>
                <Plus aria-hidden className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" aria-label="Close fullscreen" onClick={() => setOpen(false)}>
                <X aria-hidden className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <Mermaid chart={diagram.mermaid} label={diagram.title} scale={zoom} />
          </div>
        </div>
      </Dialog>
    </figure>
  );
}
