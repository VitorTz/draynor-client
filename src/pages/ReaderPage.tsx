import type { PageType, ChapterImageList } from "../types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { draynorApi } from "../api/draynor";
import LoadingScreen from "../components/LoadingScreen";



interface ReaderPageProps {
  navigate: (page: PageType, data?: any) => void;
  chapterId: number;
}

const ReaderPage = ({ navigate, chapterId }: ReaderPageProps) => {
  const [chapterData, setChapterData] = useState<ChapterImageList | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChapter();
  }, [chapterId]);

  const loadChapter = async () => {
    await draynorApi
      .chapters
      .getChapterImages(chapterId)
      .then(data => setChapterData(data))
      .catch(err => console.error('Failed to load chapter:', err))
    setLoading(false)
  };

  const nextPage = () => {
    if (chapterData && currentPage < chapterData.images.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) return <LoadingScreen />;

  if (!chapterData || !chapterData.manga || !chapterData.chapter) {
    return <div>Chapter not found</div>;
  }

  const currentImage = chapterData.images[currentPage];

  return (
    <div className="reader-page">
      <div className="reader-header">
        <button onClick={() => navigate('manga', chapterData.manga!.id)}>
          <ChevronLeft size={20} /> Return
        </button>
        <h2>{chapterData.manga.title} - Chap. {chapterData.chapter.chapter_index}</h2>
        <span>{currentPage + 1} / {chapterData.images.length}</span>
      </div>

      <div className="reader-container">
        <button className="reader-nav prev" onClick={prevPage} disabled={currentPage === 0}>
          <ChevronLeft size={32} />
        </button>
        
        <img
          src={currentImage.image_url}
          alt={`Página ${currentPage + 1}`}
          className="reader-image"
        />
        
        <button
          className="reader-nav next"
          onClick={nextPage}
          disabled={currentPage === chapterData.images.length - 1}
        >
          <ChevronRight size={32} />
        </button>
      </div>

      <div className="reader-controls">
        <input
          type="range"
          min="0"
          max={chapterData.images.length - 1}
          value={currentPage}
          onChange={(e) => setCurrentPage(parseInt(e.target.value))}
          className="page-slider"
        />
      </div>
    </div>
  );
};


export default ReaderPage;