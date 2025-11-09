import type { PageType, ChapterImageList } from "../types";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useState, useEffect } from "react";
import { draynorApi } from "../api/draynor";
import LoadingScreen from "../components/LoadingScreen";
import './ReaderPage.css';

interface ReaderPageProps {
  navigate: (page: PageType, data?: any) => void;
  chapterId: number;
}

const ReaderPage = ({ navigate, chapterId }: ReaderPageProps) => {
  const [chapterData, setChapterData] = useState<ChapterImageList | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    loadChapter();
  }, [chapterId]);

  const loadChapter = async () => {
    await draynorApi.chapters
      .getChapterImages(chapterId)
      .then((data) => setChapterData(data))
      .catch((err) => console.error("Failed to load chapter:", err));
    setLoading(false);
  };

  const nextPage = () => {
    if (chapterData && currentPage < chapterData.images.length - 1) {
      setCurrentPage((prev) => prev + 1);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.25, 1);
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextPage();
      if (e.key === "ArrowLeft") prevPage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (loading) return <LoadingScreen />;

  if (!chapterData || !chapterData.manga || !chapterData.chapter) {
    return <div>Chapter not found</div>;
  }

  const currentImage = chapterData.images[currentPage];

  return (
    <div className="reader-page">
      <div className="reader-header">
        <button onClick={() => navigate("manga", chapterData.manga)}>
          <ChevronLeft size={20} /> Return
        </button>
        <h2>
          Chapter {chapterData.chapter.chapter_index}
        </h2>
        <span>
          {currentPage + 1} / {chapterData.images.length}
        </span>
      </div>

      <div 
        className="reader-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <img
          src={currentImage.image_url}
          alt={`Página ${currentPage + 1}`}
          className="reader-image"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease',
          }}
          draggable={false}
        />
      </div>

      <div className="reader-controls">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="reader-btn"
        >
          <ChevronLeft size={28} />
        </button>

        <button
          onClick={zoomOut}
          disabled={zoom <= 1}
          className="reader-btn zoom-btn"
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>

        <input
          type="range"
          min="0"
          max={chapterData.images.length - 1}
          value={currentPage}
          onChange={(e) => {
            setCurrentPage(parseInt(e.target.value));
            setZoom(1);
            setPosition({ x: 0, y: 0 });
          }}
          className="page-slider"
        />

        <button
          onClick={zoomIn}
          disabled={zoom >= 3}
          className="reader-btn zoom-btn"
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>

        <button
          onClick={nextPage}
          disabled={currentPage === chapterData.images.length - 1}
          className="reader-btn"
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </div>
  );
};

export default ReaderPage;