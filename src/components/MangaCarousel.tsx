import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import "./MangaCarousel.css";
import type { PageType, Manga } from "../types";
import { draynorApi } from "../api/draynor";
import { useMangaCarousel } from "../context/MangaCarouselContext";

const ArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const ArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const IS_PRODUCTION = import.meta.env.VITE_ENV === "PROD"


interface MangaCarouselProps {
  navigate: (pageType: PageType, data?: any) => void;
}

const MangaCarousel = ({ navigate }: MangaCarouselProps) => {
  const { mangas, setMangas } = useMangaCarousel();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sliderRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<any>(null);

  // Load data
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
      } catch (err) {
        console.error(err);
        if (isMounted) setIsLoading(false);
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, [mangas.length, setMangas]);

  // Core navigation logic
  const scrollToSlide = useCallback((index: number) => {
    const slider = sliderRef.current;
    if (!slider) return;
    slider.style.transform = `translateX(-${index * 100}%)`;
    setActiveIndex(index);
  }, []);

  const handleNext = useCallback(() => {
    if (mangas.length === 0) return;
    const newIndex = (activeIndex + 1) % mangas.length;
    scrollToSlide(newIndex);
  }, [activeIndex, mangas.length, scrollToSlide]);

  const handlePrev = useCallback(() => {
    if (mangas.length === 0) return;
    const newIndex = (activeIndex - 1 + mangas.length) % mangas.length;
    scrollToSlide(newIndex);
  }, [activeIndex, mangas.length, scrollToSlide]);

  const handleDotClick = useCallback((index: number) => {
    scrollToSlide(index);
  }, [scrollToSlide]);

  const handleNavigate = useCallback((manga: Manga) => {
    navigate("manga", manga);
  }, [navigate]);

  // Touch swipe control
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      slider.style.transition = "none";
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      slider.style.transform = `translateX(calc(-${activeIndex * 100}% + ${diff}px))`;
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      slider.style.transition = "transform 0.4s ease";
      const diff = currentX - startX;
      const threshold = 50;

      if (Math.abs(diff) > threshold) {
        if (diff > 0) handlePrev();
        else handleNext();
      } else {
        scrollToSlide(activeIndex);
      }
    };

    slider.addEventListener("touchstart", handleTouchStart, { passive: true });
    slider.addEventListener("touchmove", handleTouchMove, { passive: true });
    slider.addEventListener("touchend", handleTouchEnd);

    return () => {
      slider.removeEventListener("touchstart", handleTouchStart);
      slider.removeEventListener("touchmove", handleTouchMove);
      slider.removeEventListener("touchend", handleTouchEnd);
    };
  }, [activeIndex, handleNext, handlePrev, scrollToSlide]);

  // Autoplay
  useEffect(() => {
    if (isHovering || mangas.length === 0) {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      return;
    }

    autoplayRef.current = setInterval(() => {
      handleNext();
    }, 4000);

    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [isHovering, handleNext, mangas.length]);

  const truncateDescription = useCallback((text: string, maxLength = 200) => {
    return text.length <= maxLength ? text : `${text.substring(0, maxLength)}...`;
  }, []);

  const slides = useMemo(() => {
    return mangas.map((pageData) => (
      <div
        key={pageData.manga.id}
        className="manga-slide"
        onClick={() => handleNavigate(pageData.manga)}
      >
        <div
          className="slide-background"
          style={{ backgroundImage: `url(${pageData.manga.cover_image_url})` }}
        />
        <div className="slide-overlay" />
        <div className="slide-content">
          <div className="slide-cover">
            <img src={pageData.manga.cover_image_url} alt={pageData.manga.title} loading="lazy" />
          </div>
          <div className="slide-info">
            <h2>{pageData.manga.title}</h2>
            {pageData.authors.length > 0 && (
              <div className="slide-meta">
                <span>{pageData.authors.map((a) => a.author_name).join(", ")}</span>
              </div>
            )}
            <div className="slide-genres">
              {pageData.genres.slice(0, 5).map((genre) => (
                <span key={genre.id} className="genre-tag" style={{ backgroundColor: pageData.manga.color }}>
                  {genre.genre}
                </span>
              ))}
            </div>
            <p className="slide-description">
              {pageData.manga.descr
                ? truncateDescription(pageData.manga.descr)
                : "Sem descrição disponível."}
            </p>
          </div>
        </div>
      </div>
    ));
  }, [mangas, handleNavigate, truncateDescription]);

  if (isLoading) return <div className="manga-carousel-container manga-carousel-loading" />;
  if (mangas.length === 0) return null;

  return (
    <div
      className="manga-carousel-container"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="manga-carousel-viewport">
        <div className="manga-carousel-slider" ref={sliderRef}>
          {slides}
        </div>
      </div>

      <button className="carousel-arrow prev" onClick={handlePrev} aria-label="Slide anterior">
        <ArrowLeft />
      </button>
      <button className="carousel-arrow next" onClick={handleNext} aria-label="Próximo slide">
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
