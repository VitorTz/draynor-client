import type { Manga, PageType } from "../types";
import MangaCard from "./MangaCard";
import './MangaSection.css'


interface MangaSectionProps {
  title: string;
  mangas: Manga[];
  navigate: (page: PageType, data?: any) => void;
}

const MangaSection = ({ title, mangas, navigate }: MangaSectionProps) => (
  <section className="manga-section">
    <h2>{title}</h2>
    <div className="manga-grid">
      {mangas.map(manga => (
        <MangaCard key={manga.id} manga={manga} navigate={navigate} />
      ))}
    </div>
  </section>
);

export default MangaSection;