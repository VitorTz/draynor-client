import { createContext, useContext, useState, type ReactNode } from "react";
import type { MangaCarouselItem } from "../types";

interface MangaCarouselType {
  mangas: MangaCarouselItem[];
  setMangas: (mangas: MangaCarouselItem[]) => void;
}

const MangaCarouselContext = createContext<MangaCarouselType | undefined>(undefined);

export const MangaCarouselProvider = ({ children }: { children: ReactNode }) => {

  const [mangas, setMangas] = useState<MangaCarouselItem[]>([]);

  return (
    <MangaCarouselContext.Provider value={{ mangas, setMangas }}>
      {children}
    </MangaCarouselContext.Provider>
  );
};

export const useMangaCarousel = (): MangaCarouselType => {
  const context = useContext(MangaCarouselContext);
  if (!context) {
    throw new Error("useManga must be used within a MangaCarouselProvider");
  }
  return context;
};
