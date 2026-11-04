import { Suspense } from "react";
import type { Metadata } from "next";
import { DoubtClient } from "@/components/doubt/DoubtClient";
import { Skeleton } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "AI Doubt Solver" };

export default function DoubtPage() {
  return (
    <Suspense fallback={<Skeleton className="mt-8 h-96" />}>
      <DoubtClient />
    </Suspense>
  );
}
