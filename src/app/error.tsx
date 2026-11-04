"use client";

import { AlertTriangle } from "lucide-react";
import { Button, EmptyState } from "@/components/ui/primitives";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="py-16">
      <EmptyState icon={AlertTriangle} title="Something went wrong" text="This page failed to load. Your saved progress is safe.">
        <Button variant="primary" onClick={reset}>
          Try again
        </Button>
      </EmptyState>
    </div>
  );
}
