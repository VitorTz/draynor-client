import { CircleCheck, ChevronRight } from "lucide-react";
import type { PageType } from "../types";
import "./ChapterItem.css";

interface ChapterItemProps {
  index: number;
  startIndex: number;
  chapter: { id: number; chapter_name: string };
  manga: { id: number };
  navigate: (path: PageType, data?: any) => void;
  setIndex: (i: number) => void;
  readChapters: Set<number>;
}

export function ChapterItem({
  index,
  startIndex,
  chapter,
  manga,
  navigate,
  setIndex,
  readChapters,
}: ChapterItemProps) {
  const isRead = readChapters.has(chapter.id);

  return (
    <div
      key={index}
      className={`chapter-item ${isRead ? "read" : ""}`}
      onClick={() => {
        setIndex(startIndex + index);
        navigate("reader", {
          chapterIndex: startIndex + index,
          mangaId: manga.id,
          chapterId: chapter.id,
        });
      }}
    >
      <span>
        Chapter {chapter.chapter_name}
      </span>

      <div className="chapter-icons">
        {isRead && (
          <CircleCheck size={20} className="read-icon" />
        )}
        <ChevronRight size={20} className="chapter-chevron" />
      </div>
    </div>
  );
}
