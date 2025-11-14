import { useState, useEffect } from "react";
import type { Manga, PageType } from "../types";
import { draynorApi } from "../api/draynor";
import LoadingScreen from "../components/LoadingScreen";
import MangaSection from "../components/MangaSection";
import RandomMangaSection from "../components/RandomMangaSection";
import MangaCarousel from "../components/MangaCarousel";


const PAGE_LIMIT = 12

interface HomePageProps {
  navigate: (page: PageType, data?: any) => void;
}

const HomePage = ({ navigate }: HomePageProps) => {

  const [popularMangas, setPopularMangas] = useState<Manga[]>([]);
  const [latestMangas, setLatestMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [popularRes, latestRes] = await Promise.all([
        draynorApi.mangas.getPopular(PAGE_LIMIT),
        draynorApi.mangas.getLatest(PAGE_LIMIT)
      ]);
      
      setPopularMangas(popularRes.results || []);
      setLatestMangas(latestRes.results || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="home-page">
      <MangaCarousel navigate={navigate} />
      <MangaSection title="Most Popular" mangas={popularMangas} navigate={navigate} viewAllPage="most-popular" />
      <MangaSection title="Latest Updates" mangas={latestMangas} navigate={navigate} viewAllPage="latest-mangas" />
      <RandomMangaSection navigate={navigate} />
    </div>
  );
};


export default HomePage;