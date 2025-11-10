import { createContext, useContext, useState, type ReactNode } from "react";

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
}

const ChapterListContext = createContext<ChapterListContextType | undefined>(undefined);

export const ChapterListProvider = ({ children }: { children: ReactNode }) => {
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [index, setIndex] = useState<number>(0);

  const activeChapter = chapters[index] || null;

  return (
    <ChapterListContext.Provider
      value={{ chapters, setChapters, index, setIndex, activeChapter }}
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
