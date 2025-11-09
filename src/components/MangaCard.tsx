import type { Manga, PageType } from "../types";


interface MangaCardProps {
  manga: Manga;
  navigate: (page: PageType, data?: any) => void;
}

const MangaCard = ({ manga, navigate }: MangaCardProps) => (
  <div className="manga-card" onClick={() => navigate('manga', manga)}>
    <div className="manga-cover">
      <img src={manga.cover_image_url} alt={manga.title} />
      <div className="manga-overlay">
        <span className="manga-status">{manga.status}</span>
      </div>
    </div>
    <div className="manga-info">
      <h3>{manga.title}</h3>
      {manga.descr && <p>{manga.descr.substring(0, 80)}...</p>}
    </div>
  </div>
);



export default MangaCard;