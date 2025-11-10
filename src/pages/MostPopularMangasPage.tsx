import { useEffect, useState } from "react";
import { draynorApi } from "../api/draynor";
import type { Manga, PageType } from "../types";
import MangaCard from "../components/MangaCard";
import "../components/MangaSection.css";
import "./MostPopularMangasPage.css";

interface PopularMangasPageProps {
  navigate: (page: PageType, data?: any) => void;
}

const PopularMangasPage = ({ navigate }: PopularMangasPageProps) => {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const limit = 24;

  const loadMangas = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await draynorApi.mangas.getPopular(limit, offset);
      setMangas((prev) => [...prev, ...res.results]);
      setHasMore(res.results.length === limit);
      setOffset((prev) => prev + limit);
    } catch (err) {
      console.error("Failed to load popular mangas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMangas();
  }, []);

  return (
    <main className="popular-page">
      <h1 className="popular-title">Most Viewed Mangas</h1>
      <div className="manga-grid">
        {mangas.map((manga, index) => (
          <MangaCard key={index} manga={manga} navigate={navigate} />
        ))}
      </div>

      {hasMore && (
        <div className="pagination-controls">
          <button
            onClick={loadMangas}
            disabled={loading}
            className="load-more-button"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </main>
  );
};

export default PopularMangasPage;
