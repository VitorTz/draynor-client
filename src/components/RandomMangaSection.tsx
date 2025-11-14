import { useState, useEffect } from "react";
import { draynorApi } from "../api/draynor";
import type { Manga, PageType } from "../types";
import MangaCard from "./MangaCard";
import { Shuffle } from "lucide-react";
import "./MangaSection.css";
import './RandomMangaSection.css'


interface RandomMangaSectionProps {
  title?: string;
  limit?: number;
  navigate: (page: PageType, data?: any) => void;
}

const RandomMangaSection = ({ navigate }: RandomMangaSectionProps) => {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRandomMangas = async () => {
    try {
      setLoading(true);
      const response = await draynorApi.mangas.getRandom(12);
      setMangas(response.results);
    } catch (err) {
      console.error("Failed to load random mangas", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomMangas();
  }, []);

  return (
    <section className="manga-section">
      <div className="manga-section-header">
        <h2>Random</h2>
        <button
          className="refresh-random-button"
          onClick={fetchRandomMangas}
          disabled={loading}
        >
          <Shuffle size={18} />
          <span>{loading ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      <div className="manga-grid">
        {mangas.map((manga) => (
          <MangaCard key={manga.id} manga={manga} navigate={navigate} />
        ))}
      </div>
    </section>
  );
};

export default RandomMangaSection;
