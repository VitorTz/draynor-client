import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { draynorApi } from "../api/draynor";
import type { ChapterImageList, PageType } from "../types";
import { useChapterList } from "../context/ChapterListContext";
import "./MangaReader.css";

interface MangaReaderProps {
  navigate: (page: PageType, data?: any) => void;
  chapter_index: number;
}

const LoadingScreen = () => (
  <div className="loading-container">
    <div className="spinner" />
    <p className="loading-text">Loading chapter...</p>
  </div>
);

const ErrorScreen = ({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) => (
  <div className="error-container">
    <p className="error-text">{message}</p>
    {retry && (
      <button className="retry-button" onClick={retry}>
        Try again
      </button>
    )}
  </div>
);

const MangaReader = ({ navigate, chapter_index }: MangaReaderProps) => {
  const { chapters } = useChapterList();
  const [chapterData, setChapterData] = useState<ChapterImageList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chapterIndex, setChapterIndex] = useState(chapter_index);

  const currentChapter = chapters[chapterIndex] || null;
  const hasPrev = chapterIndex > 0;
  const hasNext = chapterIndex < chapters.length - 1;

  const fetchChapterImages = useCallback(async () => {
    if (!currentChapter) return;
    setLoading(true);
    try {
      const data = await draynorApi.chapters.getChapterImages(currentChapter.id);
      setChapterData(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentChapter]);

  useEffect(() => {
    fetchChapterImages();
  }, [fetchChapterImages]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const nextChapter = useCallback(() => {
    if (hasNext) setChapterIndex((i) => i + 1);
  }, [hasNext]);

  const prevChapter = useCallback(() => {
    if (hasPrev) setChapterIndex((i) => i - 1);
  }, [hasPrev]);

  const handleZoomIn = useCallback(
    () => setZoom((z) => Math.min(z + 25, 200)),
    []
  );
  const handleZoomOut = useCallback(
    () => setZoom((z) => Math.max(z - 25, 50)),
    []
  );

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const imageElements = useMemo(() => {
    if (!chapterData?.images) return null;
    return chapterData.images.map((img, i) => (
      <div key={i} className="vertical-image-wrapper">
        <img
          className="vertical-image"
          src={img.image_url}
          alt={`Page ${i + 1}`}
          style={{ width: `${zoom}%`, height: "auto" }}
          loading="lazy"
        />
      </div>
    ));
  }, [chapterData, zoom]);

  if (loading)
    return (
      <div className="manga-reader-page">
        <LoadingScreen />
      </div>
    );

  if (error)
    return (
      <div className="manga-reader-page">
        <ErrorScreen message={error} retry={fetchChapterImages} />
      </div>
    );

  if (!chapterData?.images?.length)
    return (
      <div className="manga-reader-page">
        <ErrorScreen message="No images found" />
      </div>
    );

  return (
    <div className="manga-reader-page">
      <header className="manga-reader-header">
        <div className="manga-reader-header-content">
          <div className="manga-reader-header-info">
            {chapterData.manga && (
              <h2 className="manga-reader-manga-title">
                {chapterData.manga.title}
              </h2>
            )}
            {chapterData.chapter && (
              <p className="manga-reader-manga-title chapter-title">
                Chapter - {chapterData.chapter.chapter_name}
              </p>
            )}
          </div>

          <div className="toolbar-desktop toolbar-group">
            <button
              className="toolbar-button"
              onClick={() => navigate("manga", chapterData.manga)}
            >
              <ChevronLeft size={20} /> Return
            </button>

            <button
              className="toolbar-button"
              onClick={prevChapter}
              disabled={!hasPrev}
            >
              <ChevronLeft size={20} /> Prev
            </button>

            <button
              className="toolbar-button"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
            >
              <ZoomOut size={20} />
            </button>

            <span className="zoom-text">{zoom}%</span>

            <button
              className="toolbar-button"
              onClick={handleZoomIn}
              disabled={zoom >= 100}
            >
              <ZoomIn size={20} />
            </button>

            <button
              className="toolbar-button"
              onClick={nextChapter}
              disabled={!hasNext}
            >
              Next <ChevronRight size={20} />
            </button>

            <button className="toolbar-button" onClick={toggleFullscreen}>
              <Maximize2 size={20} />
            </button>
          </div>

          <div
            className="toolbar-mobile-btn menu-button"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={22} />
          </div>
        </div>
      </header>

      {drawerOpen && <div className="overlay" onClick={() => setDrawerOpen(false)} />}

      <div className={`drawer ${drawerOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <h2 className="drawer-title">Menu</h2>
          <div className="close-button" onClick={() => setDrawerOpen(false)}>
            <X size={22} />
          </div>
        </div>

        <div className="drawer-content">
          <button
            className="toolbar-button"
            onClick={() => {
              navigate("manga", chapterData.manga);
              setDrawerOpen(false);
            }}
          >
            <ChevronLeft size={20} /> Return
          </button>

          <button
            className="toolbar-button"
            onClick={prevChapter}
            disabled={!hasPrev}
          >
            <ChevronLeft size={20} /> Previous Chapter
          </button>

          <button
            className="toolbar-button"
            onClick={nextChapter}
            disabled={!hasNext}
          >
            <ChevronRight size={20} /> Next Chapter
          </button>

          <button
            className="toolbar-button"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
          >
            <ZoomOut size={20} /> Zoom Out
          </button>

          <button
            className="toolbar-button"
            onClick={handleZoomIn}
            disabled={zoom >= 100}
          >
            <ZoomIn size={20} /> Zoom In
          </button>

          <button className="toolbar-button" onClick={toggleFullscreen}>
            <Maximize2 size={20} /> Fullscreen
          </button>
        </div>
      </div>

      <main className="main">
        <div className="vertical-container">{imageElements}</div>
      </main>
    </div>
  );
};

export default MangaReader;
