import { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { draynorApi } from '../api/draynor';
import type { ChapterImageList, PageType } from '../types';


interface MangaReaderProps {
  navigate: (page: PageType, data?: any) => void;
  chapterId: number
}


const MangaReader = ({ navigate, chapterId }: MangaReaderProps) => {
  const [chapterData, setChapterData] = useState<ChapterImageList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetchChapterImages();
  }, [chapterId]);

  const fetchChapterImages = async () => {
    await draynorApi
        .chapters
        .getChapterImages(chapterId)
        .then(data => setChapterData(data))
        .catch(err => setError(err.message))
    setLoading(false)    
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 25, 50));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };


  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer as any}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer as any}>
          <p style={styles.errorText as any}>{error}</p>
          <button style={styles.retryButton} onClick={fetchChapterImages}>
            Return
          </button>
          <button style={styles.retryButton} onClick={fetchChapterImages}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!chapterData || !chapterData.images || chapterData.images.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer as any}>
          <p style={styles.errorText as any}>No images found</p>
        </div>
      </div>
    );
  }

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
        </div>
      </header>

      {/* Toolbar */}
      <div style={styles.toolbar as any}>
        <div style={styles.toolbarGroup}>
          <button
            style={styles.toolbarButton}
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            title="Zoom out"
          >
            <ZoomOut size={20} />
          </button>
          <span style={styles.zoomText as any}>{zoom}%</span>
          <button
            style={styles.toolbarButton}
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            title="Zoom in"
          >
            <ZoomIn size={20} />
          </button>
          <button
            style={styles.toolbarButton}
            onClick={toggleFullscreen}
            title="Fullscreen"
          >
            <Maximize2 size={20} />
          </button>
        </div>
      </div>

      {/* Reader Content */}
      <main style={styles.main}>
          <div style={styles.verticalContainer as any}>
            {chapterData.images.map((image, index) => (
              <div key={index} style={styles.verticalImageWrapper as any}>
                <img
                  src={image.image_url}
                  alt={`Page ${index + 1}`}
                  style={{
                    ...styles.verticalImage,
                    width: `${zoom}%`
                  }}
                  loading="lazy"
                />
                <div style={styles.pageNumber}>Page {index + 1}</div>
              </div>
            ))}
          </div>
      </main>

    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#FFFAF7',
    fontFamily: "'League Spartan', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #F0E5DD',
    padding: '16px 24px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(232, 116, 79, 0.08)',
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  headerInfo: {
    flex: 1,
    minWidth: '200px',
  },
  mangaTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2B2118',
    margin: '0 0 4px 0',
  },
  chapterTitle: {
    fontSize: '14px',
    color: '#8C7A6B',
    margin: 0,
  },
  pageCounter: {
    backgroundColor: '#FFF4ED',
    padding: '8px 16px',
    borderRadius: '4px',
    border: '1px solid #F0E5DD',
  },
  toolbar: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #F0E5DD',
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    position: 'sticky',
    top: '73px',
    zIndex: 99,
  },
  toolbarGroup: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  toolbarButton: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #F0E5DD',
    borderRadius: '4px',
    padding: '8px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#3A2E26',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  toolbarButtonActive: {
    backgroundColor: '#E8744F',
    color: '#FFFFFF',
    borderColor: '#E8744F',
  },
  toolbarButtonText: {
    fontSize: '14px',
    fontWeight: '500',
  },
  zoomText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#3A2E26',
    minWidth: '50px',
    textAlign: 'center',
  },
  main: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px',
  },
  imageContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'auto',
    maxHeight: 'calc(100vh - 250px)',
  },
  image: {
    display: 'block',
    height: 'auto',
    objectFit: 'contain',
    borderRadius: '4px',
    boxShadow: '0 4px 16px rgba(232, 116, 79, 0.12)',
  },
  verticalContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
  },
  verticalImageWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  verticalImage: {
    display: 'block',
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '4px',
    boxShadow: '0 4px 16px rgba(232, 116, 79, 0.12)',
  },
  pageNumber: {
    marginTop: '8px',
    fontSize: '14px',
    color: '#8C7A6B',
    fontWeight: '500',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '16px',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #F0E5DD',
    borderTop: '4px solid #E8744F',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '16px',
    color: '#8C7A6B',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '16px',
    padding: '24px',
  },
  errorText: {
    fontSize: '16px',
    color: '#D4522A',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#E8744F',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    padding: '12px 24px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
};

// Add keyframe animation for spinner
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
`;
document.head.appendChild(styleSheet);

export default MangaReader;