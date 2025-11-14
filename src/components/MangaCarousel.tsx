import { useState, useEffect } from "react";
import { useMangaCarousel } from "../context/MangaCarouselContext";
import { draynorApi } from "../api/draynor";
import "./MangaCarousel.css";
import type { PageType } from "../types";

// const IS_PRODUCTION = import.meta.env.VITE_ENV === "PROD";
// const CAROUSEL_TIMER = IS_PRODUCTION ? 8000 : 4000;

const CAROUSEL_TIMER = 8000;


interface MangaCarouselProps {
  navigate: (page: PageType, data?: any) => void
}


const MangaCarousel = ( { navigate }: MangaCarouselProps ) => {

  const { mangas, setMangas } = useMangaCarousel();
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const current = mangas.length > 0 ? mangas[currentIndex] : undefined;
  const authors = current
    ? current.authors.map((a) => a.author_name).join(", ")
    : [];

  useEffect(() => {
    const init = async () => {
      const data = await draynorApi.mangas.getCarrousel();
      setMangas(data.results);
    };
    if (mangas.length === 0) {
      init();
    }
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, CAROUSEL_TIMER);

    return () => clearInterval(timer);
  }, [currentIndex, mangas.length, isPaused]);

  const handlePause = () => setIsPaused(true);
  const handleResume = () => setIsPaused(false);

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) =>
        mangas.length === 0 ? 0 : (prev + 1) % mangas.length
      );
      setIsTransitioning(false);
    }, 300);
  };

  const handlePrev = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) =>
        mangas.length === 0 ? 0 : (prev - 1 + mangas.length) % mangas.length
      );
      setIsTransitioning(false);
    }, 300);
  };

  const handleDotClick = (index: number) => {
    if (index !== currentIndex) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(index);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const limitWords = (text: string | undefined | null, maxWords: number = 32): string => {
    if (!text) return "";

    const words = text.trim().split(/\s+/);

    if (words.length <= maxWords) return text;

    return words.slice(0, maxWords).join(" ") + "...";
  };  

  return (
    <div className="container">
      <div
        className="carousel"
        onMouseEnter={handlePause}
        onMouseLeave={handleResume}
        onTouchStart={handlePause}
        onTouchEnd={handleResume}
        onTouchCancel={handleResume}
      >
        <div className="dots dots-top">
          {mangas.map((_, index) => (
            <button
              key={index}
              className={`dot${index === currentIndex ? " dot-active" : ""}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <div className="mobile-action-container">
          <button
            className="nav-button nav-button-left carousel-nav-button carousel-nav-button-left"
            onClick={handlePrev}
          >
            ‹
          </button>

          <button
            className="nav-button nav-button-right carousel-nav-button carousel-nav-button-right"
            onClick={handleNext}
          >
            ›
          </button>
        </div>
        <div
          style={{
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? "translateY(20px)" : "translateY(0)",
          }}
          className="content carousel-content"
        >
          <div className="image-container carousel-image-container">
            <img
              src={current?.manga.cover_image_url}
              alt={current?.manga.title}
              className="image"
            />
            <div className="status-badge">{current?.manga.status}</div>
          </div>

          <div className="info">
            <h2 className="title carousel-title">{current?.manga.title}</h2>

            <div className="genres">
              {current?.genres.map((genre) => (
                <span key={genre.id} className="genre-tag">
                  {genre.genre}
                </span>
              ))}
            </div>

            <p className="description carousel-description">
              {limitWords(current?.manga.descr)}
            </p>

            <div className="authors">
              <span className="authors-label">By:</span> {authors}
            </div>

            <button 
              className="read-button carousel-read-button"
              onClick={() => navigate('manga', current?.manga)} >
              Read Now
            </button>
          </div>
        </div>

        <button
          className="nav-button nav-button-left carousel-nav-button carousel-nav-button-left desktop-nav-button"
          onClick={handlePrev}
          aria-label="Previous"
        >
          ‹
        </button>

        <button
          className="nav-button nav-button-right carousel-nav-button carousel-nav-button-right desktop-nav-button"
          onClick={handleNext}
          aria-label="Next"
        >
          ›
        </button>

        <div className="dots dots-bottom">
          {mangas.map((_, index) => (
            <button
              key={index}
              className={`dot${index === currentIndex ? " dot-active" : ""}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MangaCarousel;
