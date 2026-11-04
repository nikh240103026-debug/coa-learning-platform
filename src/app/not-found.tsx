import Link from "next/link";
import { buttonClass, EmptyState } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <div className="py-16">
      <EmptyState title="Page not found" text="That page or chapter does not exist.">
        <Link href="/chapters" className={buttonClass("primary")}>
          Browse chapters
        </Link>
      </EmptyState>
    </div>
  );
}
