import { useState, useEffect } from "react";
import type { PageType, Manga } from "../types";
import { draynorApi } from "../api/draynor";
import MangaCard from "../components/MangaCard";
import LoadingScreen from "../components/LoadingScreen";
import "./SearchPage.css";
import { useGenres } from "../context/GenreContext";

interface SearchPageProps {
  navigate: (page: PageType, data?: any) => void;
}

const SearchPage = ({ navigate }: SearchPageProps) => {
  const [query, setQuery] = useState("");
  const { genres, setGenres } = useGenres();
  const [genreId, setGenreId] = useState<number | null>(null);
  const [order, setOrder] = useState<"ASC" | "DESC">("DESC");
  const [results, setResults] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 24;

  useEffect(() => {
    const init = async () => {
      const data = await draynorApi.genres.getGenres();
      setGenres(data.results);
    };
    if (genres.length === 0) init();
  }, []);

  const fetchMangas = async (pageNum: number) => {
    setLoading(true);
    try {
      const offset = (pageNum - 1) * limit;
      const data = await draynorApi.mangas.searchMangas(
        query.trim() || null,
        genreId,
        order,
        limit,
        offset
      );
      setResults(data.results);
      setTotalPages(Math.ceil(data.total / limit));
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    await fetchMangas(1);
  };

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    await fetchMangas(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="search-page">
      <h1>Search Mangas</h1>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Enter manga title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          value={genreId ?? ""}
          onChange={(e) =>
            setGenreId(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.genre}
            </option>
          ))}
        </select>

        <select
          value={order}
          onChange={(e) => setOrder(e.target.value as "ASC" | "DESC")}
        >
          <option value="DESC">Newest</option>
          <option value="ASC">Oldest</option>
        </select>

        <button type="submit">Search</button>
      </form>

      {loading ? (
        <LoadingScreen />
      ) : (
        <>
          <div className="manga-grid">
            {results.length > 0 ? (
              results.map((manga) => (
                <MangaCard key={manga.id} manga={manga} navigate={navigate} />
              ))
            ) : (
              <p style={{ textAlign: "center", color: "var(--text-light)" }}>
                No results found.
              </p>
            )}
          </div>

          {results.length > 0 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;
