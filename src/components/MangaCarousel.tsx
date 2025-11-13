import React, { useState, useEffect } from 'react';
import './MangaCarousel.css'
import { useMangaCarousel } from '../context/MangaCarouselContext';
import { draynorApi } from '../api/draynor';


const MangaCarousel: React.FC = () => {
  const { mangas, setMangas } = useMangaCarousel()
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const init = async () => {
      const data = await draynorApi.mangas.getCarrousel()
      setMangas(data.results)
    }
    if (mangas.length === 0) {
      init()
    }
  }, [mangas])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % mangas.length);
      setIsTransitioning(false);
    }, 300);
  };

  const handlePrev = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + mangas.length) % mangas.length);
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

  const current = mangas[currentIndex];
  const authors = current.authors.map(a => a.author_name).join(', ');

  return (
    <div className='container'>
      <div className='carousel'>        
      <div className='dots dots-top'>
        {mangas.map((_, index) => (
          <button
            key={index}
            className={`dot${index === currentIndex ? ' dot-active' : ''}`}
            onClick={() => handleDotClick(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
        <div style={{
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? 'translateY(20px)' : 'translateY(0)',
        }} className="content carousel-content">
          <div className="image-container carousel-image-container">
            <img 
              src={current.manga.cover_image_url} 
              alt={current.manga.title}
              className='image'
            />
            <div className='status-badge'>
              {current.manga.status}
            </div>
          </div>
          
          <div className='info'>
            <h2 className="title carousel-title">{current.manga.title}</h2>
            
            <div className='genres'>
              {current.genres.map((genre) => (
                <span key={genre.id} className='genre-tag'>
                  {genre.genre}
                </span>
              ))}
            </div>
            
            <p className="description carousel-description">
              {current && current.manga.descr!.length > 280 ? current.manga.descr!.substring(0, 280) + '...'  : current.manga.descr}
            </p>
            
            <div className='authors'>
              <span className='authors-label'>By:</span> {authors}
            </div>
            
            <button className="read-button carousel-read-button">
              Read Now
            </button>
          </div>
        </div>

        <button 
          className="nav-button nav-button-left carousel-nav-button carousel-nav-button-left"
          onClick={handlePrev}
          aria-label="Previous"
        >
          ‹
        </button>
        
        <button 
          className="nav-button nav-button-right carousel-nav-button carousel-nav-button-right"
          onClick={handleNext}
          aria-label="Next"
        >
          ›
        </button>

        <div className='dots dots-bottom'>
          {mangas.map((_, index) => (
            <button
              key={index}
              className={`dot${index === currentIndex ? ' dot-active' : ''}`}
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