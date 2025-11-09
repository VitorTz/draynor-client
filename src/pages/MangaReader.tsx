import { useState, useEffect } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { draynorApi } from "../api/draynor";
import type { ChapterImageList, PageType } from "../types";

interface MangaReaderProps {
  navigate: (page: PageType, data?: any) => void;
  chapterId: number;
}

const MangaReader = ({ navigate, chapterId }: MangaReaderProps) => {
  const [chapterData, setChapterData] = useState<ChapterImageList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetchChapterImages();
  }, [chapterId]);

  const fetchChapterImages = async () => {
    try {
      const data = await draynorApi.chapters.getChapterImages(chapterId);
      setChapterData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const closeDrawer = () => setDrawerOpen(false);

  if (loading)
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer as any}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading chapter...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer as any}>
          <p style={styles.errorText as any}>{error}</p>
          <button style={styles.retryButton} onClick={fetchChapterImages}>
            Try again
          </button>
        </div>
      </div>
    );

  if (!chapterData?.images?.length)
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer as any}>
          <p style={styles.errorText as any}>No images found</p>
        </div>
      </div>
    );

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header as any}>
        <div style={styles.headerContent as any}>
          <div style={styles.headerInfo}>
            {chapterData.manga && (
              <h1 style={styles.mangaTitle}>{chapterData.manga.title}</h1>
            )}
            {chapterData.chapter && (
              <p style={styles.chapterTitle}>
                Chapter - {chapterData.chapter.chapter_name}
              </p>
            )}
          </div>

          {/* Desktop Toolbar */}
          <div className="toolbar-desktop" style={styles.toolbarGroup}>
            <button
              style={styles.toolbarButton}
              onClick={() => navigate("manga", chapterData.manga)}
            >
              <ChevronLeft size={20} /> Return
            </button>
            <button
              style={styles.toolbarButton}
              onClick={handleZoomOut}
              disabled={zoom <= 50}
            >
              <ZoomOut size={20} />
            </button>
            <span style={styles.zoomText as any}>{zoom}%</span>
            <button
              style={styles.toolbarButton}
              onClick={handleZoomIn}
              disabled={zoom >= 200}
            >
              <ZoomIn size={20} />
            </button>
            <button style={styles.toolbarButton} onClick={toggleFullscreen}>
              <Maximize2 size={20} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="toolbar-mobile-btn"
            style={styles.menuButton}
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Drawer Overlay */}
      {drawerOpen && (
        <div style={styles.overlay} onClick={closeDrawer}></div>
      )}

      {/* Drawer */}
      <div
        style={{
          ...styles.drawer,
          transform: drawerOpen
            ? "translateX(0)"
            : "translateX(100%)",
        }}
      >
        <div style={styles.drawerHeader}>
          <h2 style={styles.drawerTitle}>Menu</h2>
          <button style={styles.closeButton} onClick={closeDrawer}>
            <X size={22} />
          </button>
        </div>

        <div style={styles.drawerContent}>
          <button
            style={styles.toolbarButton}
            onClick={() => {
              navigate("manga", chapterData.manga);
              closeDrawer();
            }}
          >
            <ChevronLeft size={20} /> Return
          </button>
          <button
            style={styles.toolbarButton}
            onClick={handleZoomOut}
            disabled={zoom <= 50}
          >
            <ZoomOut size={20} /> Zoom Out
          </button>
          <button
            style={styles.toolbarButton}
            onClick={handleZoomIn}
            disabled={zoom >= 200}
          >
            <ZoomIn size={20} /> Zoom In
          </button>
          <button style={styles.toolbarButton} onClick={toggleFullscreen}>
            <Maximize2 size={20} /> Fullscreen
          </button>
        </div>
      </div>

      {/* Reader */}
      <main style={styles.main}>
        <div style={styles.verticalContainer as any}>
          {chapterData.images.map((image, index) => (
            <div key={index} style={styles.verticalImageWrapper as any}>
              <img
                src={image.image_url}
                alt={`Page ${index + 1}`}
                style={{
                  ...styles.verticalImage,
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: "top center",
                }}
                loading="lazy"
              />
              {/* <div style={styles.pageNumber}>Page {index + 1}</div> */}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

const styles: Record<string, any> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#FFFAF7",
    fontFamily:
      "'League Spartan', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottom: "1px solid #F0E5DD",
    padding: "16px 24px",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 2px 8px rgba(232, 116, 79, 0.08)",
  },
  headerContent: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerInfo: { flex: 1, minWidth: "200px" },
  mangaTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#2B2118",
    margin: "0 0 4px 0",
  },
  chapterTitle: { fontSize: "14px", color: "#8C7A6B", margin: 0 },
  toolbarGroup: { display: "flex", gap: "8px", alignItems: "center" },
  toolbarButton: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #F0E5DD",
    borderRadius: "4px",
    padding: "8px 12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#3A2E26",
    fontSize: "14px",
    width: "100%",
    justifyContent: "flex-start",
  },
  menuButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "none",
  },
  zoomText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#3A2E26",
    minWidth: "50px",
    textAlign: "center",
  },
  main: { maxWidth: "1400px", margin: "0 auto", padding: "24px" },
  verticalContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px",
  },
  verticalImageWrapper: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  verticalImage: {
    display: "block",
    maxWidth: "100%",
    height: "auto",
    borderRadius: "4px",
    boxShadow: "0 4px 16px rgba(232, 116, 79, 0.12)",
    transition: "transform 0.2s ease",
  },
  pageNumber: {
    marginTop: "8px",
    fontSize: "14px",
    color: "#8C7A6B",
    fontWeight: "500",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.2)",
    zIndex: 150,
  },
  drawer: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "240px",
    height: "100vh",
    backgroundColor: "#FFFFFF",
    boxShadow: "-2px 0 8px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    zIndex: 200,
    transition: "transform 0.3s ease",
  },
  drawerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderBottom: "1px solid #F0E5DD",
  },
  drawerTitle: { fontSize: "16px", fontWeight: "600", color: "#2B2118" },
  closeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  drawerContent: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "16px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: "16px",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid #F0E5DD",
    borderTop: "4px solid #E8744F",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: { fontSize: "16px", color: "#8C7A6B" },
  errorContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: "16px",
    padding: "24px",
  },
  errorText: { fontSize: "16px", color: "#D4522A", textAlign: "center" },
  retryButton: {
    backgroundColor: "#E8744F",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "4px",
    padding: "12px 24px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

button:hover:not(:disabled) {
  background-color: #F4A261 !important;
  box-shadow: 0 4px 12px rgba(232, 116, 79, 0.2) !important;
}

button:active:not(:disabled) {
  transform: scale(0.98);
}

@media (max-width: 768px) {
  .toolbar-desktop { display: none !important; }
  .toolbar-mobile-btn { display: block !important; }
}
`;
document.head.appendChild(styleSheet);

export default MangaReader;
