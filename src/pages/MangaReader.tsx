import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ArrowUp,  
  Book,  
} from "lucide-react";
import { draynorApi } from "../api/draynor";
import type {
  Chapter,
  ChapterImageList,
  ChapterImage,
  PageType,
} from "../types";
import "./MangaReader.css";

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
  retry?: () => any;
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

interface OptimizedImageProps {
  img: ChapterImage;
  alt: string;
  zoom: number;
  index: number;
  preload: boolean;
}

// Componente otimizado para cada imagem individual
const OptimizedImage = React.memo(
  ({ img, alt, zoom, index, preload = false }: OptimizedImageProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleLoad = useCallback(() => {
      setIsLoaded(true);
      setHasError(false);
    }, []);

    const handleError = useCallback(() => {
      setHasError(true);
      console.error(`Failed to load image ${index}:`, img.image_url);
    }, [index, img.image_url]);

    return (
      <div className="vertical-image-wrapper">
        {!isLoaded && !hasError && (
          <div
            className="vertical-image"
            style={{
              width: `${zoom}%`,
              height: "500px",
            }}
          >
            <div className="skeleton-shimmer" />
          </div>
        )}
        {hasError ? (
          <div className="image-error" style={{ width: `${zoom}%` }}>
            <p>Failed to load image {index + 1}</p>
            <button
              className="retry-image-button"
              onClick={() => {
                setHasError(false);
                setIsLoaded(false);
              }}
            >
              Retry
            </button>
          </div>
        ) : (
          <img
            className="vertical-image"
            src={img.image_url}
            alt={alt}
            style={{
              width: `${zoom}%`,
              height: "auto",
              opacity: isLoaded ? 1 : 0,
              transition: "opacity 0.3s",
            }}
            onLoad={handleLoad}
            onError={handleError}
            loading={index < 3 ? "eager" : "lazy"}
          />
        )}
      </div>
    );
  }
);

interface MangaReaderProps {
  navigate: (pageType: PageType, data?: any) => void;
  data: { mangaId: number; chapterId: number; chapterIndex: number };
}

const MangaReader = ({ navigate, data }: MangaReaderProps) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [pageData, setPageData] = useState<ChapterImageList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const hasPrev = data.chapterIndex > 0;
  const hasNext = data.chapterIndex < chapters.length - 1;

  // Preload de imagens adjacentes
  useEffect(() => {
    if (!pageData?.images) return;

    const preloadImages = pageData.images.slice(0, 6).map((img) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = img.image_url;
      return link;
    });

    preloadImages.forEach((link) => document.head.appendChild(link));

    return () => {
      preloadImages.forEach((link) => document.head.removeChild(link));
    };
  }, [pageData]);

  useEffect(() => {
    const getChapters = async () => {
      await draynorApi.chapters
        .getChaptersByMangaId(data.mangaId)
        .then((c) => setChapters(c.chapters))
        .catch((err) => console.error("Error loading chapters:", err));
    };
    if (chapters.length === 0) {
      getChapters();
    }
  }, [chapters.length, data.mangaId]);

  useEffect(() => {
    const init = async () => {
      await draynorApi.chapters
        .getChapterImages(data.chapterId)
        .then((d) => {
          if (isMounted) {
            setPageData(d);
            setError(null);
          }
        })
        .catch((err) => {
          if (isMounted) setError(err.message);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    };
    let isMounted = true;
    setLoading(true);
    init();
    return () => {
      isMounted = false;
    };
  }, [data.chapterId]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const handleZoomIn = useCallback(
    () => setZoom((z) => Math.min(z + 25, 100)),
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

  const toggleDrawer = useCallback(() => setDrawerOpen((o) => !o), []);

  const nextChapter = useCallback(() => {
    if (!hasNext) return;
    const next = chapters[data.chapterIndex + 1];
    if (!next) return;
    navigate("reader", {
      mangaId: data.mangaId,
      chapterId: next.id,
      chapterIndex: data.chapterIndex + 1,
    });
  }, [hasNext, data, chapters, navigate]);

  const prevChapter = useCallback(() => {
    if (!hasPrev) return;
    const prev = chapters[data.chapterIndex - 1];
    if (!prev) return;
    navigate("reader", {
      mangaId: data.mangaId,
      chapterId: prev.id,
      chapterIndex: data.chapterIndex - 1,
    });
  }, [hasPrev, data, chapters, navigate]);

  // Memoizar elementos de imagem com otimizações
  const imageElements = useMemo(() => {
    if (!pageData?.images) return null;

    return pageData.images.map((img, i) => (
      <OptimizedImage
        key={`${data.chapterId}-${i}`}
        img={img}
        alt={`Page ${i + 1}`}
        zoom={zoom}
        index={i}
        preload={i < 2}
      />
    ));
  }, [pageData?.images, zoom, data.chapterId]);

  if (loading) {
    return (
      <div className="manga-reader-page">
        <LoadingScreen />
      </div>
    );
  }

  if (error) {
    return (
      <div className="manga-reader-page">
        <ErrorScreen message={error} retry={() => window.location.reload()} />
      </div>
    );
  }

  if (!pageData?.images.length) {
    return (
      <div className="manga-reader-page">
        <ErrorScreen message="No images found" />
      </div>
    );
  }

  return (
    <div className="manga-reader-page">
      <header className="manga-reader-header">
        <div className="manga-reader-header-content">
          <div className="manga-reader-header-info">
            {pageData.manga && (
              <h2 className="manga-reader-manga-title">
                {pageData.manga.title}
              </h2>
            )}
            {pageData.chapter && (
              <p className="manga-reader-manga-title chapter-title">
                Chapter - {pageData.chapter.chapter_name}
              </p>
            )}
          </div>

          <div className="toolbar-desktop toolbar-group">
            <button
              className="toolbar-button"
              onClick={() => navigate("manga", pageData.manga)}
            >
              <Book size={20} /> Manga Page
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
            onClick={toggleDrawer}
          >
            <Menu size={22} />
          </div>
        </div>
      </header>

      {drawerOpen && <div className="overlay" onClick={toggleDrawer} />}

      <div className={`drawer ${drawerOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <h2 className="drawer-title">Menu</h2>
          <div className="close-button" onClick={toggleDrawer}>
            <X size={22} />
          </div>
        </div>

        <div className="drawer-content">
          <button
            className="toolbar-button"
            onClick={() => {
              navigate("manga", pageData.manga);
              setDrawerOpen(false);
            }}
          >
            Manga Page <Book size={20} />
          </button>

          <button
            className="toolbar-button"
            onClick={prevChapter}
            disabled={!hasPrev}
          >
            Previous Chapter <ChevronLeft size={20} />
          </button>

          <button
            className="toolbar-button"
            onClick={nextChapter}
            disabled={!hasNext}
          >
            Next Chapter <ChevronRight size={20} />
          </button>

          <button
            className="toolbar-button"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
          >
            Zoom Out <ZoomOut size={20} />
          </button>

          <button
            className="toolbar-button"
            onClick={handleZoomIn}
            disabled={zoom >= 100}
          >
            Zoom In <ZoomIn size={20} />
          </button>
        </div>
      </div>

      <main className="main">
        <div className="vertical-container">{imageElements}</div>
      </main>
      <button
        className="scroll-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowUp size={16}/>
      </button>
    </div>
  );
};

export default MangaReader;
