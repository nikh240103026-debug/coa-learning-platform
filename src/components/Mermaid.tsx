"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

// Mermaid parses these colours itself, so they must be literal hex values.
// Keep them in step with the tokens in globals.css.
const PALETTE: Record<Theme, Record<string, string>> = {
  light: {
    background: "#FFFEFA",
    primaryColor: "#FFFEFA",
    primaryTextColor: "#1A1C20",
    primaryBorderColor: "#1D4ED8",
    secondaryColor: "#EEF2FE",
    tertiaryColor: "#F7F5EF",
    lineColor: "#585D66",
    textColor: "#1A1C20",
    mainBkg: "#FFFEFA",
    nodeBorder: "#1D4ED8",
    clusterBkg: "#F7F5EF",
    clusterBorder: "#D6D2C6",
    titleColor: "#1A1C20",
    edgeLabelBackground: "#F7F5EF",
    actorBkg: "#FFFEFA",
    actorBorder: "#1D4ED8",
    actorTextColor: "#1A1C20",
    signalColor: "#1A1C20",
    signalTextColor: "#1A1C20",
    labelBoxBkgColor: "#FFFEFA",
    labelBoxBorderColor: "#1D4ED8",
    labelTextColor: "#1A1C20",
    loopTextColor: "#1A1C20",
    noteBkgColor: "#EEF2FE",
    noteBorderColor: "#1D4ED8",
    noteTextColor: "#1A1C20",
  },
  dark: {
    background: "#16202B",
    primaryColor: "#16202B",
    primaryTextColor: "#E6EAF0",
    primaryBorderColor: "#6EA0FF",
    secondaryColor: "#1E2C3B",
    tertiaryColor: "#0F1720",
    lineColor: "#9BA7B4",
    textColor: "#E6EAF0",
    mainBkg: "#16202B",
    nodeBorder: "#6EA0FF",
    clusterBkg: "#0F1720",
    clusterBorder: "#2C3846",
    titleColor: "#E6EAF0",
    edgeLabelBackground: "#0F1720",
    actorBkg: "#16202B",
    actorBorder: "#6EA0FF",
    actorTextColor: "#E6EAF0",
    signalColor: "#E6EAF0",
    signalTextColor: "#E6EAF0",
    labelBoxBkgColor: "#16202B",
    labelBoxBorderColor: "#6EA0FF",
    labelTextColor: "#E6EAF0",
    loopTextColor: "#E6EAF0",
    noteBkgColor: "#1E2C3B",
    noteBorderColor: "#6EA0FF",
    noteTextColor: "#E6EAF0",
  },
};

function subscribeToTheme(listener: () => void) {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function useTheme(): Theme {
  return useSyncExternalStore(
    subscribeToTheme,
    () => (document.documentElement.classList.contains("dark") ? "dark" : "light"),
    () => "light"
  );
}

let initializedFor: Theme | null = null;
let renderCounter = 0;

/** With `scale`, the diagram is drawn at that multiple of its natural size instead of fitting its container. */
export function Mermaid({ chart, label, scale }: { chart: string; label?: string; scale?: number }) {
  const theme = useTheme();
  const baseId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    renderCounter += 1;
    const renderId = `mmd-${baseId}-${renderCounter}`;

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        if (initializedFor !== theme) {
          mermaid.initialize({
            startOnLoad: false,
            securityLevel: "strict",
            suppressErrorRendering: true,
            theme: "base",
            themeVariables: {
              ...PALETTE[theme],
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              fontSize: "14px",
            },
            flowchart: { htmlLabels: true, curve: "basis" },
          });
          initializedFor = theme;
        }
        const result = await mermaid.render(renderId, chart);
        if (!cancelled) {
          setSvg(result.svg);
          setFailed(false);
        }
      } catch {
        document.getElementById(`d${renderId}`)?.remove();
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, theme, baseId]);

  if (failed) {
    return (
      <div className="rounded border border-bad/40 p-3 text-sm" role="alert">
        <p className="mb-2 text-bad">This diagram could not be rendered. Its source is shown below.</p>
        <pre className="overflow-x-auto font-mono text-xs text-muted">{chart}</pre>
      </div>
    );
  }

  if (svg === null) {
    return (
      <div className="flex min-h-40 items-center justify-center" role="status">
        <span className="label-mono animate-pulse">Rendering diagram</span>
      </div>
    );
  }

  const naturalWidth = Number(svg.match(/viewBox="\S+\s+\S+\s+([\d.]+)\s+[\d.]+"/)?.[1]);

  return (
    <div
      className={scale && naturalWidth ? "mermaid-svg diagram-zoom mx-auto" : "mermaid-svg overflow-x-auto"}
      style={scale && naturalWidth ? { width: naturalWidth * scale } : undefined}
      role="img"
      aria-label={label ?? "Diagram"}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
