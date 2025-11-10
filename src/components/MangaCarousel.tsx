import { useEffect, useState, useRef, useCallback } from "react";
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

  const viewportRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Busca de dados
  useEffect(() => {
    const init = async () => {
      await draynorApi.mangas
        .getCarrousel()
        .then((data) => setMangas(data.results))
        .catch(console.error);
    };

    if (mangas.length > 0) {
      return;
    }
    init();
  }, []);

  // Sincroniza o scroll manual com os "dots"
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let scrollTimeout: any;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const newIndex = Math.round(viewport.scrollLeft / viewport.clientWidth);
        if (newIndex !== activeIndex) {
          setActiveIndex(newIndex);
        }
      }, 100);
    };

    viewport.addEventListener("scroll", handleScroll);
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [activeIndex]);

  const scrollToSlide = useCallback((index: number) => {
    const viewport = viewportRef.current;
    const slider = sliderRef.current;
    if (!viewport || !slider || !slider.children[index]) return;

    const slide = slider.children[index] as HTMLElement;
    const scrollLeft = slide.offsetLeft;

    viewport.scrollTo({
      left: scrollLeft,
      behavior: "smooth",
    });

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

  const handleDotClick = (index: number) => {
    scrollToSlide(index);
  };

  useEffect(() => {
    if (isHovering || mangas.length === 0) {
      return;
    }

    const timer = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(timer);
  }, [isHovering, handleNext, mangas.length]);

  const handleNavigate = (manga: Manga) => {
    navigate("manga", manga);
  };

  const truncateDescription = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  if (mangas.length === 0) {
    return (
      <div className="manga-carousel-container manga-carousel-loading"></div>
    );
  }

  return (
    <div
      className="manga-carousel-container"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="manga-carousel-viewport" ref={viewportRef}>
        <div className="manga-carousel-slider" ref={sliderRef}>
          {mangas.map((pageData) => (
            <div
              key={pageData.manga.id}
              className="manga-slide"
              onClick={() => handleNavigate(pageData.manga)}
            >
              <div
                className="slide-background"
                style={{
                  backgroundImage: `url(${pageData.manga.cover_image_url})`,
                }}
              ></div>
              <div className="slide-overlay"></div>
              <div className="slide-content">
                <div className="slide-cover">
                  <img
                    src={pageData.manga.cover_image_url}
                    alt={pageData.manga.title}
                  />
                </div>
                <div className="slide-info">
                  <h2>{pageData.manga.title}</h2>
                  <div className="slide-meta">
                    {pageData.authors.length > 0 && (
                      <>
                        <span>
                          {pageData.authors
                            .map((a) => a.author_name)
                            .join(", ")}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="slide-genres">
                    {pageData.genres.slice(0, 5).map((genre) => (
                      <span key={genre.id} className="genre-tag">
                        {genre.genre}
                      </span>
                    ))}
                  </div>
                  <p className="slide-description">
                    {pageData.manga.descr
                      ? truncateDescription(pageData.manga.descr)
                      : "Sem descrição disponível."}
                  </p>
                  <button
                    className="slide-read-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigate(pageData.manga);
                    }}
                  >
                    Read
                  </button>
                </div>
              </div>
            </div>
          ))}
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
