import { useState } from "react";
import type { PageType, Manga } from "../types";
import { draynorApi } from "../api/draynor";
import MangaCard from "../components/MangaCard";
import LoadingScreen from "../components/LoadingScreen";
import './SearchPage.css'


interface SearchPageProps {
  navigate: (page: PageType, data?: any) => void;
}

const SearchPage = ({ navigate }: SearchPageProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    await draynorApi
      .mangas
      .getByTitle(query)
      .then(data => setResults(data.results))
      .catch(err => console.error('Search failed:', err))

    setLoading(false)  
  };

  return (
    <div className="search-page">
      <h1>Buscar Mangás</h1>
      
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Digite o nome do mangá..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {loading ? (
        <LoadingScreen />
      ) : (
        <div className="manga-grid">
          {results.map(manga => (
            <MangaCard key={manga.id} manga={manga} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
};


export default SearchPage;