import { useState, useEffect } from "react";
import type { Manga, PageType } from "../types";
import { draynorApi } from "../api/draynor";
import LoadingScreen from "../components/LoadingScreen";
import MangaSection from "../components/MangaSection";


const PAGE_LIMIT = 12

interface HomePageProps {
  navigate: (page: PageType, data?: any) => void;
}

const HomePage = ({ navigate }: HomePageProps) => {

  const [popularMangas, setPopularMangas] = useState<Manga[]>([]);
  const [latestMangas, setLatestMangas] = useState<Manga[]>([]);
  const [randomMangas, setRandomMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [popularRes, latestRes, randomRes] = await Promise.all([
        draynorApi.mangas.getPopular(PAGE_LIMIT),
        draynorApi.mangas.getLatest(PAGE_LIMIT),
        draynorApi.mangas.getRandom(PAGE_LIMIT)
      ]);
      
      setPopularMangas(popularRes.results || []);
      setLatestMangas(latestRes.results || []);
      setRandomMangas(randomRes.results || [])
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="home-page">
      <MangaSection title="Most Popular" mangas={popularMangas} navigate={navigate} />
      <MangaSection title="Latest Updates" mangas={latestMangas} navigate={navigate} />
      <MangaSection title="Random" mangas={randomMangas} navigate={navigate} />
    </div>
  );
};


export default HomePage;