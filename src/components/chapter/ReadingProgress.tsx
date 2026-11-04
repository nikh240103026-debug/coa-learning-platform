"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      setPercent(scrollable > 0 ? Math.min(100, (doc.scrollTop / scrollable) * 100) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div aria-hidden className="no-print fixed inset-x-0 top-0 z-40 h-0.5">
      <div className="h-full bg-accent" style={{ width: `${percent}%` }} />
    </div>
  );
}
