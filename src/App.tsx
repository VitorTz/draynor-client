// src/App.tsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Search, BookOpen, User, LogOut, Menu, X, Home, Library, ChevronLeft, ChevronRight } from 'lucide-react';
import type { 
  User as DraynorUser, 
  AuthContextType,
  ChapterImageList,
  Manga
} from './types';
import './App.css';
import { draynorApi } from './api/draynor';


// Context
const AuthContext = createContext<AuthContextType | null>(null);

const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};


// Main App Component
const App = () => {
  const [user, setUser] = useState<DraynorUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    await draynorApi
      .auth
      .me()
      .then(user => setUser(user))
      .catch(err => console.log(err))
    setLoading(false)
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    return await draynorApi
      .auth
      .login(email, password)
      .then(user => {setUser(user); return true})
      .catch(err => {console.error('Login failed:', err); return false})
  };

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    return await draynorApi
      .auth
      .signup(username, email, password)
      .then(() => {return true})
      .catch(err => {console.error('Signup failed:', err); return false;})
  };

  const logout = async () => {
    await draynorApi
      .auth
      .logout()
      .then(() => setUser(null))
      .catch(err => console.error('Logout failed:', err))
  };

  if (loading) { return <LoadingScreen />; }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      <Router />
    </AuthContext.Provider>
  );
};

// Router Component
type PageType = 'home' | 'library' | 'login' | 'signup' | 'manga' | 'reader' | 'search';

const Router: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [pageData, setPageData] = useState<any>(null);

  // helper to decode hash like "#manga-123" or "#reader-456"
  const pageFromHash = (hash: string) => {
    if (!hash) return { page: 'home' as PageType, data: null };
    const clean = hash.replace(/^#/, '');
    if (clean.startsWith('manga-')) {
      const id = parseInt(clean.split('-')[1], 10);
      return { page: 'manga' as PageType, data: { id } };
    }
    if (clean.startsWith('reader-')) {
      const id = parseInt(clean.split('-')[1], 10);
      return { page: 'reader' as PageType, data: id };
    }
    if (clean === 'library') return { page: 'library' as PageType, data: null };
    if (clean === 'login') return { page: 'login' as PageType, data: null };
    if (clean === 'signup') return { page: 'signup' as PageType, data: null };
    if (clean === 'search') return { page: 'search' as PageType, data: null };
    return { page: 'home' as PageType, data: null };
  };

  useEffect(() => {
    // init from current hash if present
    const initial = pageFromHash(window.location.hash);
    setCurrentPage(initial.page);
    setPageData(initial.data);

    // ensure the initial history entry has a useful state object
    window.history.replaceState({ page: initial.page, data: initial.data }, '', window.location.href);

    const handlePop = (e: PopStateEvent) => {
      if (e.state && e.state.page) {
        setCurrentPage(e.state.page);
        setPageData(e.state.data ?? null);
      } else {
        // fallback to hash parsing when state is null
        const parsed = pageFromHash(window.location.hash);
        setCurrentPage(parsed.page);
        setPageData(parsed.data);
      }
      window.scrollTo(0, 0);
    };

    const handleHash = () => {
      // hashchange fires when user uses back/forward on hashes
      const parsed = pageFromHash(window.location.hash);
      setCurrentPage(parsed.page);
      setPageData(parsed.data);
      // sync history state so future popstate has state
      window.history.replaceState({ page: parsed.page, data: parsed.data }, '', window.location.href);
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePop);
    window.addEventListener('hashchange', handleHash);
    return () => {
      window.removeEventListener('popstate', handlePop);
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);

  const navigate = (page: PageType, data: any = null) => {
    setCurrentPage(page);
    setPageData(data);
    window.scrollTo(0, 0);

    // build a unique hash for page+id
    let hash = `#${page}`;
    if (page === 'manga' && data?.id) hash = `#manga-${data.id}`;
    if (page === 'reader' && typeof data === 'number') hash = `#reader-${data}`;

    // push a new history entry with state and unique URL
    window.history.pushState({ page, data }, '', `${window.location.pathname}${hash}`);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage navigate={navigate} />;
      case 'library': return <LibraryPage navigate={navigate} />;
      case 'login': return <LoginPage navigate={navigate} />;
      case 'signup': return <SignupPage navigate={navigate} />;
      case 'manga': return <MangaPage navigate={navigate} manga_id={pageData} />;
      case 'reader': return <ReaderPage navigate={navigate} chapterId={pageData} />;
      case 'search': return <SearchPage navigate={navigate} />;
      default: return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="app">
      <Header navigate={navigate} currentPage={currentPage} />
      <main className="main-content">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};


// Header Component
interface HeaderProps {
  navigate: (page: PageType, data?: any) => void;
  currentPage: PageType;
}

const Header = ({ navigate, currentPage }: HeaderProps) => {

  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('search', { query: searchQuery });
      setSearchQuery('');
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo" onClick={() => navigate('home')}>
          <BookOpen size={32} />
          <span>Draynor</span>
        </div>

        <form className="header-search" onSubmit={handleSearch}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search Mangas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <nav className="header-nav desktop">
          <button
            className={currentPage === 'home' ? 'active' : ''}
            onClick={() => navigate('home')}
          >
            <Home size={20} />
            Home
          </button>
          {user && (
            <button
              className={currentPage === 'library' ? 'active' : ''}
              onClick={() => navigate('library')}
            >
              <Library size={20} />
              Library
            </button>
          )}
          {user ? (
            <div className="user-menu">
              <button className="user-button">
                <User size={20} />
                {user.username}
              </button>
              <div className="user-dropdown">
                <button onClick={logout}>
                  <LogOut size={18} />
                  Sair
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => navigate('login')}>
              <User size={20} />
              Entrar
            </button>
          )}
        </nav>

        <button className="menu-toggle mobile" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="mobile-menu">
          <button onClick={() => { navigate('home'); setMenuOpen(false); }}>
            <Home size={20} /> Início
          </button>
          {user && (
            <button onClick={() => { navigate('library'); setMenuOpen(false); }}>
              <Library size={20} /> Biblioteca
            </button>
          )}
          {user ? (
            <>
              <div className="mobile-user">
                <User size={20} /> {user.username}
              </div>
              <button onClick={() => { logout(); setMenuOpen(false); }}>
                <LogOut size={20} /> Sair
              </button>
            </>
          ) : (
            <button onClick={() => { navigate('login'); setMenuOpen(false); }}>
              <User size={20} /> Entrar
            </button>
          )}
        </nav>
      )}
    </header>
  );
};

// HomePage Component
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
        draynorApi.mangas.getPopular(10),
        draynorApi.mangas.getLatest(10),
        draynorApi.mangas.getRandom(10)
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

// MangaSection Component
interface MangaSectionProps {
  title: string;
  mangas: Manga[];
  navigate: (page: PageType, data?: any) => void;
}

const MangaSection: React.FC<MangaSectionProps> = ({ title, mangas, navigate }) => (
  <section className="manga-section">
    <h2>{title}</h2>
    <div className="manga-grid">
      {mangas.map(manga => (
        <MangaCard key={manga.id} manga={manga} navigate={navigate} />
      ))}
    </div>
  </section>
);

// MangaCard Component
interface MangaCardProps {
  manga: Manga;
  navigate: (page: PageType, data?: any) => void;
}

const MangaCard: React.FC<MangaCardProps> = ({ manga, navigate }) => (
  <div className="manga-card" onClick={() => navigate('manga', manga.id)}>
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

// MangaPage Component
interface MangaPageProps {
  navigate: (page: PageType, data?: any) => void;
  manga_id: number
}

const MangaPage = ({ navigate, manga_id }: MangaPageProps) => {
  
  const [chapters, setChapters] = useState<{id: number, chapter_name: string}[]>([]);
  const [manga, setManga] = useState<Manga | null>(null)
  const [readingStatus, setReadingStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadMangaData();
  }, [manga_id]);

  const loadMangaData = async () => {
    try {
      const pageData = await draynorApi.mangas.getPageData(manga_id)
      setManga(pageData.manga)
      setReadingStatus(pageData.reading_status ?? null)
      setChapters(pageData.chapters)
    } catch (error) {
      console.error('Failed to load manga:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReadingStatus = async (status: string) => {
    if (!manga) { return }
    try {
      await draynorApi.library.createReadingStatus(manga.id, status)
      loadMangaData();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!manga) return <div>Mangá não encontrado</div>;

  return (
    <div className="manga-page">
      <div className="manga-header">
        <img src={manga.cover_image_url} alt={manga.title} className="manga-cover-large" />
        <div className="manga-details">
          <h1>{manga.title}</h1>
          <div className="manga-meta">
            <span className="badge">{manga.status}</span>
            <span>{chapters.length} chatpers</span>
          </div>
          {manga.descr && <p className="manga-description">{manga.descr}</p>}
          
          {user && (
            <div className="reading-status-buttons">
              <select
                value={readingStatus || ''}
                onChange={(e) => updateReadingStatus(e.target.value)}
              >
                <option value="">Add to Library</option>
                <option value="Reading">Reading</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Dropped">Dropped</option>
                <option value="Plan to Read">Plan to Read</option>
                <option value="Rereading">Rereading</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="chapters-list">
        <h2>Capítulos</h2>
        {chapters.map(chapter => (
          <div
            key={chapter.id}
            className="chapter-item"
            onClick={() => navigate('reader', chapter.id)}
          >
            <span>Chapter {chapter.chapter_name}</span>
            <ChevronRight size={20} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ReaderPage Component
interface ReaderPageProps {
  navigate: (page: PageType, data?: any) => void;
  chapterId: number;
}

const ReaderPage: React.FC<ReaderPageProps> = ({ navigate, chapterId }) => {
  const [chapterData, setChapterData] = useState<ChapterImageList | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChapter();
  }, [chapterId]);

  const loadChapter = async () => {
    await draynorApi
      .chapters
      .getChapterImages(chapterId)
      .then(data => setChapterData(data))
      .catch(err => console.error('Failed to load chapter:', err))
    setLoading(false)
  };

  const nextPage = () => {
    if (chapterData && currentPage < chapterData.images.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) return <LoadingScreen />;

  if (!chapterData || !chapterData.manga || !chapterData.chapter) {
    return <div>Chapter not found</div>;
  }

  const currentImage = chapterData.images[currentPage];

  return (
    <div className="reader-page">
      <div className="reader-header">
        <button onClick={() => navigate('manga', chapterData.manga!.id)}>
          <ChevronLeft size={20} /> Return
        </button>
        <h2>{chapterData.manga.title} - Chap. {chapterData.chapter.chapter_index}</h2>
        <span>{currentPage + 1} / {chapterData.images.length}</span>
      </div>

      <div className="reader-container">
        <button className="reader-nav prev" onClick={prevPage} disabled={currentPage === 0}>
          <ChevronLeft size={32} />
        </button>
        
        <img
          src={currentImage.image_url}
          alt={`Página ${currentPage + 1}`}
          className="reader-image"
        />
        
        <button
          className="reader-nav next"
          onClick={nextPage}
          disabled={currentPage === chapterData.images.length - 1}
        >
          <ChevronRight size={32} />
        </button>
      </div>

      <div className="reader-controls">
        <input
          type="range"
          min="0"
          max={chapterData.images.length - 1}
          value={currentPage}
          onChange={(e) => setCurrentPage(parseInt(e.target.value))}
          className="page-slider"
        />
      </div>
    </div>
  );
};

// LibraryPage Component
interface LibraryPageProps {
  navigate: (page: PageType, data?: any) => void;
}

const LibraryPage = ({ navigate }: LibraryPageProps) => {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [status, setStatus] = useState('Reading');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLibrary();
  }, [status]);

  const loadLibrary = async () => {
    await draynorApi
      .library
      .getByStatus(status as any)
      .then(data => setMangas(data.results))
      .catch(err => console.error('Failed to load library:', err))
    setLoading(false)
  };

  const statuses = ['Reading', 'Completed', 'On Hold', 'Dropped', 'Plan to Read', 'Rereading'];

  return (
    <div className="library-page">
      <h1>Library</h1>
      
      <div className="status-tabs">
        {statuses.map(s => (
          <button
            key={s}
            className={status === s ? 'active' : ''}
            onClick={() => setStatus(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingScreen />
      ) : mangas.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={64} />
          <p>No manga in this category</p>
        </div>
      ) : (
        <div className="manga-grid">
          {mangas.map(manga => (
            <MangaCard key={manga.id} manga={manga} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
};

// SearchPage Component
interface SearchPageProps {
  navigate: (page: PageType, data?: any) => void;
}

const SearchPage = ({ navigate }: SearchPageProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    await draynorApi
      .mangas
      .getByTitle(query)
      .then(data => setResults(data.results))
      .catch(err => console.error('Search failed:', err))

    setLoading(false)  
  };

  return (
    <div className="search-page">
      <h1>Buscar Mangás</h1>
      
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Digite o nome do mangá..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {loading ? (
        <LoadingScreen />
      ) : (
        <div className="manga-grid">
          {results.map(manga => (
            <MangaCard key={manga.id} manga={manga} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
};

// LoginPage Component
interface LoginPageProps {
  navigate: (page: PageType, data?: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await login(email, password);
    if (success) {
      navigate('home');
    } else {
      setError('Email ou senha inválidos');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Entrar</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="error-message">{error}</div>}
          <button type="submit">Entrar</button>
        </form>
        <p>
          Não tem uma conta?{' '}
          <a onClick={() => navigate('signup')}>Cadastre-se</a>
        </p>
      </div>
    </div>
  );
};

// SignupPage Component
interface SignupPageProps {
  navigate: (page: PageType, data?: any) => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ navigate }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await signup(username, email, password);
    if (success) {
      navigate('login');
    } else {
      setError('Erro ao criar conta');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Cadastre-se</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nome de usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="error-message">{error}</div>}
          <button type="submit">Cadastrar</button>
        </form>
        <p>
          Já tem uma conta?{' '}
          <a onClick={() => navigate('login')}>Entre</a>
        </p>
      </div>
    </div>
  );
};

// LoadingScreen Component
const LoadingScreen: React.FC = () => (
  <div className="loading-screen">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

// Footer Component
const Footer: React.FC = () => (
  <footer className="footer">
    <p>&copy; 2025 Draynor</p>
  </footer>
);

export default App;