import { createContext, useContext, useState, type ReactNode } from "react";


export interface Genre {
  id: number;
  genre: string;
  created_at: string;
}

interface GenreContextType {
  genres: Genre[];
  setGenres: React.Dispatch<React.SetStateAction<Genre[]>>;
}

const GenreContext = createContext<GenreContextType | undefined>(undefined);

export const GenreProvider = ({ children }: { children: ReactNode }) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  return (
    <GenreContext.Provider value={{ genres, setGenres }}>
      {children}
    </GenreContext.Provider>
  );
};

export const useGenres = (): GenreContextType => {
  const context = useContext(GenreContext);
  if (!context) throw new Error("useGenres must be used within a GenreProvider");
  return context;
};
