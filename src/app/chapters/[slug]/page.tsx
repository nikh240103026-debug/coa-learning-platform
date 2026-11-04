import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChapterView } from "@/components/chapter/ChapterView";
import { chapters, getChapter } from "@/content/chapters";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return chapters.map((chapter) => ({ slug: chapter.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const chapter = getChapter(slug);
  return chapter ? { title: chapter.title, description: chapter.summary } : { title: "Chapter not found" };
}

export default async function ChapterPage({ params }: Props) {
  const { slug } = await params;
  if (!getChapter(slug)) notFound();
  return <ChapterView key={slug} slug={slug} />;
}
