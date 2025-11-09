import {ChevronRight } from 'lucide-react';
import { useState, useEffect } from "react";
import type { Manga, PageType } from "../types";
import { useAuth } from "../context/AuthContext";
import { draynorApi } from "../api/draynor";
import LoadingScreen from '../components/LoadingScreen';


interface MangaPageProps {
  navigate: (page: PageType, data?: any) => void;
  manga_id: number
}

const MangaPage = ({ navigate, manga_id }: MangaPageProps) => {
  
  const [chapters, setChapters] = useState<{id: number, chapter_name: string}[]>([]);
  const [manga, setManga] = useState<Manga | null>(null)
  const [readingStatus, setReadingStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadMangaData();
  }, [manga_id]);

  const loadMangaData = async () => {
    try {
      const pageData = await draynorApi.mangas.getPageData(manga_id)
      setManga(pageData.manga)
      setReadingStatus(pageData.reading_status ?? null)
      setChapters(pageData.chapters)
    } catch (error) {
      console.error('Failed to load manga:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReadingStatus = async (status: string) => {
    if (!manga) { return }
    try {
      await draynorApi.library.createReadingStatus(manga.id, status)
      loadMangaData();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!manga) return <div>Mangá não encontrado</div>;

  return (
    <div className="manga-page">
      <div className="manga-header">
        <img src={manga.cover_image_url} alt={manga.title} className="manga-cover-large" />
        <div className="manga-details">
          <h1>{manga.title}</h1>
          <div className="manga-meta">
            <span className="badge">{manga.status}</span>
            <span>{chapters.length} chapters</span>
          </div>
          {manga.descr && <p className="manga-description">{manga.descr}</p>}
          
          {user && (
            <div className="reading-status-buttons">
              <select
                value={readingStatus || ''}
                onChange={(e) => updateReadingStatus(e.target.value)}
              >
                <option value="">Add to Library</option>
                <option value="Reading">Reading</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Dropped">Dropped</option>
                <option value="Plan to Read">Plan to Read</option>
                <option value="Rereading">Rereading</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="chapters-list">
        <h2>Capítulos</h2>
        {chapters.map(chapter => (
          <div
            key={chapter.id}
            className="chapter-item"
            onClick={() => navigate('reader', chapter.id)}
          >
            <span>Chapter {chapter.chapter_name}</span>
            <ChevronRight size={20} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MangaPage;