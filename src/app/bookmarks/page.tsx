import type { Metadata } from "next";
import { BookmarksView } from "@/components/chapter/BookmarksView";

export const metadata: Metadata = { title: "Bookmarks and notes" };

export default function BookmarksPage() {
  return <BookmarksView />;
}
