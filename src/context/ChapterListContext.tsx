import { createContext, useContext, useState, type ReactNode } from "react";
import type { Manga } from "../types";

export interface ChapterItem {
  id: number;
  chapter_name: string;
}

interface ChapterListContextType {
  chapters: ChapterItem[];
  setChapters: (list: ChapterItem[]) => void;
  index: number;
  setIndex: (i: number) => void;
  activeChapter: ChapterItem | null;
  manga: Manga | null;
  setManga: (manga: Manga) => void;
}

const ChapterListContext = createContext<ChapterListContextType | undefined>(undefined);

export const ChapterListProvider = ({ children }: { children: ReactNode }) => {

  const [manga, setManga] = useState<Manga | null>(null)
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [index, setIndex] = useState<number>(0);

  const activeChapter = chapters[index] || null;

  return (
    <ChapterListContext.Provider
      value={{ chapters, setChapters, index, setIndex, activeChapter, manga, setManga }}
    >
      {children}
    </ChapterListContext.Provider>
  );
};

export const useChapterList = (): ChapterListContextType => {
  const ctx = useContext(ChapterListContext);
  if (!ctx) throw new Error("useChapterList must be used within a ChapterListProvider");
  return ctx;
};
