import { useState, useEffect } from "react";
import type { PageType, Manga } from "../types";
import { draynorApi } from "../api/draynor";
import { BookOpen } from "lucide-react";
import LoadingScreen from "../components/LoadingScreen";
import MangaCard from "../components/MangaCard";


interface LibraryPageProps {
  navigate: (page: PageType, data?: any) => void;
}


const LibraryPage = ({ navigate }: LibraryPageProps) => {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [status, setStatus] = useState('Reading');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLibrary();
  }, [status]);

  const loadLibrary = async () => {
    await draynorApi
      .library
      .getByStatus(status as any)
      .then(data => setMangas(data.results))
      .catch(err => console.error('Failed to load library:', err))
    setLoading(false)
  };

  const statuses = ['Reading', 'Completed', 'On Hold', 'Dropped', 'Plan to Read', 'Rereading'];

  return (
    <div className="library-page">
      <h1>Library</h1>
      
      <div className="status-tabs">
        {statuses.map(s => (
          <button
            key={s}
            className={status === s ? 'active' : ''}
            onClick={() => setStatus(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingScreen />
      ) : mangas.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={64} />
          <p>No manga in this category</p>
        </div>
      ) : (
        <div className="manga-grid">
          {mangas.map(manga => (
            <MangaCard key={manga.id} manga={manga} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
};


export default LibraryPage;