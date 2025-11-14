import { ChevronRight } from 'lucide-react';
import { useState, useEffect } from "react";
import { type Genre, type MangaAuthor, type Manga, type PageType } from "../types";
import { useAuth } from "../context/AuthContext";
import { draynorApi } from "../api/draynor";
import LoadingScreen from '../components/LoadingScreen';
import './MangaPage.css';
import { useChapterList } from '../context/ChapterListContext';
import Comments from '../components/Comments';

interface MangaPageProps {
  navigate: (page: PageType, data?: any) => void;
  manga_id: number;
}

const MangaPage = ({ navigate, manga_id }: MangaPageProps) => {
  const { chapters, setChapters, setIndex, setManga: setCurrentManga } = useChapterList();
  const [manga, setManga] = useState<Manga | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [authors, setAuthors] = useState<MangaAuthor[]>([]);
  const [readingStatus, setReadingStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 40;
  const totalPages = Math.ceil(chapters.length / itemsPerPage);

  useEffect(() => {
    loadMangaData();
  }, [manga_id]);

  const loadMangaData = async () => {
    try {
      const pageData = await draynorApi.mangas.getPageData(manga_id);
      setManga(pageData.manga);
      setCurrentManga(pageData.manga)
      setReadingStatus(pageData.reading_status ?? null);
      setGenres(pageData.genres);
      setAuthors(pageData.authors);
      setChapters(pageData.chapters);
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to load manga:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReadingStatus = async (status: string) => {
    if (!manga) return;
    try {
      await draynorApi.library.createReadingStatus(manga.id, status);
      loadMangaData();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!manga) return <div>Mangá não encontrado</div>;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleChapters = chapters.slice(startIndex, endIndex);

  return (
    <div className="manga-page" style={{ '--manga-color': manga.color } as React.CSSProperties}>
      <div className="manga-header">
        <div className="manga-cover-wrapper">
          <img 
            src={manga.cover_image_url} 
            alt={manga.title} 
            className="manga-cover-large" />
        </div>

        <div className="manga-details">
          <h1>{manga.title}</h1>

          <div className="manga-meta">
            <span className="badge manga-badge">{manga.status}</span>
            <span>{chapters.length} chapters</span>
          </div>

          {authors.length > 0 && (
            <div className="manga-authors">
              <strong>Authors:</strong>{" "}
              {authors.map((a, i) => (
                <span key={a.author_id}>
                  {a.author_name} ({a.role})
                  {i < authors.length - 1 && ", "}
                </span>
              ))}
            </div>
          )}

          {genres.length > 0 && (
            <div className="manga-genres">
              <strong>Genres:</strong>{" "}
              {genres.map((g, i) => (
                <span key={g.id}>
                  {g.genre}
                  {i < genres.length - 1 && ", "}
                </span>
              ))}
            </div>
          )}

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
        <h2>Chapters</h2>
        {visibleChapters.map((chapter, index) => (
          <div
            key={index}
            className="chapter-item"
            onClick={() => {
              setIndex(startIndex + index);
              navigate('reader', {chapterIndex: startIndex + index, mangaId: manga.id, chapterId: chapter.id});
            }}
          >
            <span>Chapter {chapter.chapter_name}</span>
            <ChevronRight size={20} className="chapter-chevron" />
          </div>
        ))}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            >
              Next
            </button>
          </div>
        )}
      </div>
      {/* <Comments manga_id={manga_id} /> */}
    </div>
  );
};

export default MangaPage;
