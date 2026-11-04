export type DiagramKind = "block" | "flowchart" | "working-diagram" | "working-flowchart";
export type CalloutVariant = "formula" | "remember" | "exam-tip";
export type Difficulty = "easy" | "medium" | "hard";
export type ChapterStatus = "not-started" | "in-progress" | "done";

export type Block =
  | { type: "paragraph"; text: string }
  | { type: "points"; items: string[] }
  | { type: "callout"; variant: CalloutVariant; text: string }
  | { type: "diagram"; title: string; caption: string; kind: DiagramKind; mermaid: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "example"; title: string; steps: string[] };

export type DiagramBlock = Extract<Block, { type: "diagram" }>;

export type Section = {
  id: string;
  title: string;
  blocks: Block[];
  videoUrl?: string;
};

export type Flashcard = { front: string; back: string };

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  difficulty: Difficulty;
  topic: string;
};

export type ImportantQuestion = { q: string; modelAnswer: string; marks: number };

export type Chapter = {
  slug: string;
  number: number;
  title: string;
  summary: string;
  estMinutes: number;
  learningObjectives: string[];
  sections: Section[];
  videoUrl?: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  importantQuestions: ImportantQuestion[];
  keyTerms: string[];
};

export type ChatRole = "user" | "assistant";
export type ChatMessage = { id: string; role: ChatRole; content: string };
export type DoubtMode = "explain" | "numerical" | "beginner" | "exam";
