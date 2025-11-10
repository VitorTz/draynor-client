import { createContext, useContext, useState, type ReactNode } from "react";
import type { MangaPageData } from "../types";

interface MangaCarouselType {
  mangas: MangaPageData[];
  setMangas: (mangas: MangaPageData[]) => void;
}

const MangaCarouselContext = createContext<MangaCarouselType | undefined>(undefined);

export const MangaCarouselProvider = ({ children }: { children: ReactNode }) => {

  const [mangas, setMangas] = useState<MangaPageData[]>([]);

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
