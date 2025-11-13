import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./MangaCarousel.css";
import type { PageType, Manga } from "../types";
import { draynorApi } from "../api/draynor";
import { useMangaCarousel } from "../context/MangaCarouselContext";

/* Icons (kept inline to avoid extra deps) */
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

/* Small utility: choose readable text color for a hex background */
const getContrastColor = (hexColor?: string): string => {
  if (!hexColor) return "#ffffff";
  const hex = hexColor.replace("#", "");
  if (hex.length < 6) return "#ffffff";
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#111" : "#fff";
};

interface MangaCarouselProps {
  navigate: (pageType: PageType, data?: any) => void;
}

const Slide = React.memo(function Slide({
  pageData,
  index,
  activeIndex,
  onNavigate,
  truncate,
}: {
  pageData: any;
  index: number;
  activeIndex: number;
  onNavigate: (m: Manga) => void;
  truncate: (s?: string, n?: number) => string;
}) {
  const isActive = index === activeIndex;
  const isAdjacent = Math.abs(index - activeIndex) <= 1;
  const shouldLoad = isActive || isAdjacent;

  return (
    <div
      className={`manga-slide ${isActive ? "active" : ""}`}
      data-index={index}
      role="button"
      tabIndex={0}
      onClick={() => onNavigate(pageData.manga)}
      onKeyDown={(e) => { if (e.key === "Enter") onNavigate(pageData.manga); }}
    >
      <div
        className="slide-background"
        aria-hidden
        style={{
          backgroundImage: shouldLoad ? `url(${pageData.manga.cover_image_url})` : undefined,
        }}
      />
      <div className="slide-overlay" />
      <div className="slide-content">
        <div className="slide-cover">
          {shouldLoad && (
            <img
              src={pageData.manga.cover_image_url}
              alt={pageData.manga.title}
              loading={isAdjacent ? "lazy" : "eager"}
            />
          )}
        </div>

        <div className="slide-info">
          <h2>{pageData.manga.title}</h2>

          {pageData.authors?.length > 0 && (
            <div className="slide-meta">
              <span>{pageData.authors.map((a: any) => `${a.author_name} (${a.role})`).join(", ")}</span>
            </div>
          )}

          <div className="slide-genres">
            {pageData.genres?.slice(0, 5).map((genre: any) => (
              <span
                key={genre.id}
                className="genre-tag"
                style={{
                  backgroundColor: pageData.manga.color || "#2b2b2b",
                  color: getContrastColor(pageData.manga.color),
                }}
              >
                {genre.genre}
              </span>
            ))}
          </div>

          <p className="slide-description">{pageData.manga.descr ? truncate(pageData.manga.descr, 180) : ""}</p>
        </div>
      </div>
    </div>
  );
});

const MangaCarousel: React.FC<MangaCarouselProps> = ({ navigate }) => {
  const { mangas, setMangas } = useMangaCarousel();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const autoplayRef = useRef<number | null>(null);
  const interactionRef = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const lastInteractionAt = useRef<number>(0);

  /* fetch */
  useEffect(() => {
    if (mangas.length > 0) {
      setIsLoading(false);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const data = await draynorApi.mangas.getCarrousel();
        if (!mounted) return;
        setMangas(data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [mangas.length, setMangas]);

  /* IntersectionObserver to update activeIndex */
  useEffect(() => {
    const root = viewportRef.current;
    if (!root) return;
    const slides = Array.from(root.querySelectorAll(".manga-slide"));
    if (!slides.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-index"));
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        });
      },
      { root, threshold: 0.6 }
    );

    slides.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [mangas.length]);

  /* scroll to a slide (smooth) */
  const scrollTo = useCallback((index: number) => {
    const root = viewportRef.current;
    if (!root) return;
    const width = root.clientWidth;
    const target = width * Math.max(0, Math.min(index, mangas.length - 1));
    root.scrollTo({ left: target, behavior: "smooth" });
    lastInteractionAt.current = Date.now();
  }, [mangas.length]);

  /* navigation handlers */
  const handleNext = useCallback(() => {
    if (interactionRef.current || mangas.length === 0) return;
    const next = (activeIndex + 1) % mangas.length;
    scrollTo(next);
    setActiveIndex(next);
  }, [activeIndex, mangas.length, scrollTo]);

  const handlePrev = useCallback(() => {
    if (interactionRef.current || mangas.length === 0) return;
    const prev = (activeIndex - 1 + mangas.length) % mangas.length;
    scrollTo(prev);
    setActiveIndex(prev);
  }, [activeIndex, mangas.length, scrollTo]);

  /* autoplay (pauses during interaction or recent interaction) */
  useEffect(() => {
    if (autoplayRef.current) {
      window.clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
    if (mangas.length === 0) return;
    const interval = window.setInterval(() => {
      const since = Date.now() - lastInteractionAt.current;
      if (interactionRef.current || since < 3000) return; // don't autoplay right after interaction
      handleNext();
    }, 4000);
    autoplayRef.current = interval;
    return () => {
      if (autoplayRef.current) window.clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    };
  }, [handleNext, mangas.length]);

  /* swipe handling: small threshold (15% of width) for easier mobile swaps */
  useEffect(() => {
    const root = viewportRef.current;
    if (!root) return;

    const onPointerDown = (e: PointerEvent) => {
      interactionRef.current = true;
      touchStartX.current = e.clientX;
      root.setPointerCapture?.((e as any).pointerId);
    };
    const onPointerMove = () => { /* no-op to keep capture active */ };
    const onPointerUp = (e: PointerEvent) => {
      const startX = touchStartX.current;
      if (startX == null) {
        interactionRef.current = false;
        return;
      }
      const dx = e.clientX - startX;
      const threshold = root.clientWidth * 0.15;
      if (dx > threshold) {
        handlePrev();
      } else if (dx < -threshold) {
        handleNext();
      } else {
        /* small tap or minor move -> snap to nearest (IntersectionObserver will update too) */
        scrollTo(activeIndex);
      }
      touchStartX.current = null;
      interactionRef.current = false;
      lastInteractionAt.current = Date.now();
    };

    root.addEventListener("pointerdown", onPointerDown, { passive: true });
    root.addEventListener("pointermove", onPointerMove, { passive: true });
    root.addEventListener("pointerup", onPointerUp);
    root.addEventListener("pointercancel", onPointerUp);

    /* also pause autoplay while pressing */
    const onPointerEnter = () => { interactionRef.current = true; };
    const onPointerLeave = () => { interactionRef.current = false; lastInteractionAt.current = Date.now(); };

    root.addEventListener("mouseenter", onPointerEnter);
    root.addEventListener("mouseleave", onPointerLeave);

    return () => {
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerup", onPointerUp);
      root.removeEventListener("pointercancel", onPointerUp);
      root.removeEventListener("mouseenter", onPointerEnter);
      root.removeEventListener("mouseleave", onPointerLeave);
    };
  }, [activeIndex, handleNext, handlePrev, scrollTo]);

  const handleDotClick = useCallback((i: number) => {
    scrollTo(i);
    setActiveIndex(i);
    lastInteractionAt.current = Date.now();
  }, [scrollTo]);

  const handleNavigate = useCallback((m: Manga) => {
    navigate("manga", m);
  }, [navigate]);

  const truncate = useCallback((text?: string, max = 200) => {
    if (!text) return "";
    if (text.length <= max) return text;
    const t = text.slice(0, max);
    const last = t.lastIndexOf(" ");
    return last > 0 ? `${t.slice(0, last)}...` : `${t}...`;
  }, []);

  const slides = useMemo(() => (
    mangas.map((m: any, i: number) => (
      <Slide
        key={m.manga.id}
        pageData={m}
        index={i}
        activeIndex={activeIndex}
        onNavigate={handleNavigate}
        truncate={truncate}
      />
    ))
  ), [mangas, activeIndex, handleNavigate, truncate]);

  if (isLoading) return <div className="manga-carousel-container manga-carousel-loading" />;

  if (!mangas.length) return null;

  return (
    <div className="manga-carousel-container" aria-roledescription="carousel">
      <div
        className="manga-carousel-viewport"
        ref={viewportRef}
        /* disable native smooth to avoid double-throttling on mobile */
        style={{ scrollBehavior: "auto" }}
      >
        <div className="manga-carousel-slider">{slides}</div>
      </div>

      {/* arrows visible on non-mobile via CSS */}
      <button className="carousel-arrow prev" onClick={handlePrev} aria-label="Previous slide"><ArrowLeft/></button>
      <button className="carousel-arrow next" onClick={handleNext} aria-label="Next slide"><ArrowRight/></button>

      <div className="carousel-dots" role="tablist" aria-label="Slides">
        {mangas.map((_: any, idx: number) => (
          <button
            key={idx}
            className={`carousel-dot ${idx === activeIndex ? "active" : ""}`}
            onClick={() => handleDotClick(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            aria-selected={idx === activeIndex}
          />
        ))}
      </div>
    </div>
  );
};

export default MangaCarousel;
