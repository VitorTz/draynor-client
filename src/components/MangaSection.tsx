import type { Manga, PageType } from "../types";
import MangaCard from "./MangaCard";
import "./MangaSection.css";

interface MangaSectionProps {
  title: string;
  mangas: Manga[];
  navigate: (page: PageType, data?: any) => void;
  viewAllPage?: PageType;
}

const MangaSection = ({ title, mangas, navigate, viewAllPage }: MangaSectionProps) => (
  <section className="manga-section">
    <div className="manga-section-header">
      <h2>{title}</h2>
      {viewAllPage && (
        <button
          className="view-all-button"
          onClick={() => navigate(viewAllPage)}
        >
          View All →
        </button>
      )}
    </div>

    <div className="manga-grid">
      {mangas.map((manga) => (
        <MangaCard key={manga.id} manga={manga} navigate={navigate} />
      ))}
    </div>
  </section>
);

export default MangaSection;
