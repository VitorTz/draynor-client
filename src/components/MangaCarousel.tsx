import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import "./MangaCarousel.css";
import type { PageType, Manga } from "../types";
import { draynorApi } from "../api/draynor";
import { useMangaCarousel } from "../context/MangaCarouselContext";

const ArrowLeft = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={3}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5L8.25 12l7.5-7.5"
    />
  </svg>
);

const ArrowRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={3}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 4.5l7.5 7.5-7.5 7.5"
    />
  </svg>
);


interface MangaCarouselProps {
  navigate: (pageType: PageType, data?: any) => void;
}

const MangaCarousel = ({ navigate }: MangaCarouselProps) => {
  const { mangas, setMangas } = useMangaCarousel();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const viewportRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<any>(null);
  const autoplayTimerRef = useRef<any>(null);
  const isScrollingRef = useRef(false);

  // Fetch mangas
  useEffect(() => {
    if (mangas.length > 0) {
      setIsLoading(false);
      return;
    }
    let isMounted = true;

    const init = async () => {
      try {
        const data = await draynorApi.mangas.getCarrousel();
        if (isMounted) {
          setMangas(data.results);
          setIsLoading(false);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, [mangas.length, setMangas]);

  // Scroll detection otimizado
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleScroll = () => {
      isScrollingRef.current = true;
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        const scrollLeft = viewport.scrollLeft;
        const slideWidth = viewport.clientWidth;
        const newIndex = Math.round(scrollLeft / slideWidth);
        
        if (newIndex !== activeIndex && newIndex >= 0 && newIndex < mangas.length) {
          setActiveIndex(newIndex);
        }
        
        isScrollingRef.current = false;
      }, 150);
    };

    viewport.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      viewport.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [activeIndex, mangas.length]);

  // Scroll para slide específico
  const scrollToSlide = useCallback((index: number) => {
    const viewport = viewportRef.current;
    if (!viewport || index < 0 || index >= mangas.length) return;
    
    const slideWidth = viewport.clientWidth;
    const targetScroll = index * slideWidth;
    
    viewport.scrollTo({ 
      left: targetScroll, 
      behavior: "smooth" 
    });
  }, [mangas.length]);

  // Navegação
  const handleNext = useCallback(() => {
    if (mangas.length === 0 || isScrollingRef.current) return;
    const newIndex = (activeIndex + 1) % mangas.length;
    scrollToSlide(newIndex);
    setActiveIndex(newIndex);
  }, [activeIndex, mangas.length, scrollToSlide]);

  const handlePrev = useCallback(() => {
    if (mangas.length === 0 || isScrollingRef.current) return;
    const newIndex = (activeIndex - 1 + mangas.length) % mangas.length;
    scrollToSlide(newIndex);
    setActiveIndex(newIndex);
  }, [activeIndex, mangas.length, scrollToSlide]);

  const handleDotClick = useCallback((index: number) => {
    scrollToSlide(index);
    setActiveIndex(index);
  }, [scrollToSlide]);

  // Autoplay otimizado
  useEffect(() => {
    if (isHovering || mangas.length === 0 || isScrollingRef.current) {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
      return;
    }

    autoplayTimerRef.current = setInterval(handleNext, 4000);

    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
    };
  }, [isHovering, handleNext, mangas.length]);

  // Handlers memoizados
  const handleNavigate = useCallback((manga: Manga) => {
    navigate("manga", manga);
  }, [navigate]);

  const truncateDescription = useCallback((text: string, maxLength: number = 200) => {
    if (!text || text.length <= maxLength) return text;    
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');    
    return lastSpace > 0 
      ? `${truncated.substring(0, lastSpace)}...`
      : `${truncated}...`;
  }, []);


  const getContrastColor = useCallback((hexColor: string): string => {
    if (!hexColor) return "#ffffff";
    
    // Remove # se existir
    const hex = hexColor.replace("#", "");
    
    // Converte para RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calcula luminosidade relativa (fórmula WCAG)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Se a cor for clara (luminosidade > 0.5), usa texto escuro
    // Se for escura, usa texto branco
    return luminance > 0.5 ? "#1e1e1e" : "#ffffff";
  }, []);

  // Slides memoizados com otimização
  const slides = useMemo(() => {
    return mangas.map((pageData, index) => {
      const isActive = index === activeIndex;
      const isAdjacent = Math.abs(index - activeIndex) <= 1;
      const shouldLoad = isActive || isAdjacent || index < 2;

      return (
        <div
          key={pageData.manga.id}
          className="manga-slide"
          onClick={() => handleNavigate(pageData.manga)}
        >
          <div
            className="slide-background"
            style={{
              backgroundImage: shouldLoad 
                ? `url(${pageData.manga.cover_image_url})` 
                : undefined
            }}
          />
          <div className="slide-overlay" />
          <div className="slide-content">
            <div className="slide-cover">
              <img
                src={pageData.manga.cover_image_url}
                alt={pageData.manga.title}
                loading={index < 2 ? "eager" : "lazy"}
              />
            </div>
            <div className="slide-info">
              <h2>{pageData.manga.title}</h2>
              {pageData.authors.length > 0 && (
                <div className="slide-meta">
                  <span>
                    {pageData.authors.map((a) => a.author_name).join(", ")}
                  </span>
                </div>
              )}
              <div className="slide-genres">
                {pageData.genres.slice(0, 5).map((genre) => (
                  <span
                    key={genre.id}
                    className="genre-tag"
                    style={{ 
                      backgroundColor: pageData.manga.color,
                      color: getContrastColor(pageData.manga.color)
                    }}
                  >
                    {genre.genre}
                  </span>
                ))}
              </div>
              <p className="slide-description">
                {pageData.manga.descr ? truncateDescription(pageData.manga.descr) : ""}
              </p>
            </div>
          </div>
        </div>
      );
    });
  }, [mangas, activeIndex, handleNavigate, truncateDescription]);

  if (isLoading) {
    return <div className="manga-carousel-container manga-carousel-loading" />;
  }

  if (mangas.length === 0) {
    return null;
  }

  return (
    <div
      className="manga-carousel-container"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="manga-carousel-viewport" ref={viewportRef}>
        <div className="manga-carousel-slider" ref={sliderRef}>
          {slides}
        </div>
      </div>
      <button
        className="carousel-arrow prev"
        onClick={handlePrev}
        aria-label="Slide anterior"
      >
        <ArrowLeft />
      </button>
      <button
        className="carousel-arrow next"
        onClick={handleNext}
        aria-label="Próximo slide"
      >
        <ArrowRight />
      </button>
      <div className="carousel-dots">
        {mangas.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === activeIndex ? "active" : ""}`}
            onClick={() => handleDotClick(index)}
            aria-label={`Ir para o slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default MangaCarousel;