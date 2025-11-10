import type { Manga, PageType } from "../types";
import './MangaSection.css';
import './MangaCard.css';

interface MangaCardProps {
  manga: Manga;
  navigate: (page: PageType, data?: any) => void;
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Ongoing': return 'status-ongoing';
    case 'Completed': return 'status-completed';
    case 'Hiatus': return 'status-hiatus';
    case 'Cancelled': return 'status-cancelled';
    case 'Discontinued': return 'status-discontinued';
    case 'One-shot': return 'status-oneshot';
    case 'Upcoming': return 'status-upcoming';
    default: return '';
  }
};

const MangaCard = ({ manga, navigate }: MangaCardProps) => (
  <div className="manga-card" onClick={() => navigate('manga', manga)}>
    <div className="manga-cover">
      <img src={manga.cover_image_url} alt={manga.title} loading="lazy" />
      <div className={`manga-status-badge ${getStatusClass(manga.status)}`}>
        {manga.status}
      </div>
    </div>
    <div className="manga-info">
      <h3 className="manga-title">{manga.title}</h3>
      {manga.descr && (
        <p className="manga-description">
          {manga.descr.substring(0, 80)}...
        </p>
      )}
    </div>
  </div>
);

export default MangaCard;
