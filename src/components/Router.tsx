import { useState, useEffect } from "react";
import type { PageType } from "../types";
import HomePage from "../pages/HomePage";
import MangaPage from "../pages/MangaPage";
import LibraryPage from "../pages/LibraryPage";
import SearchPage from "../pages/SearchPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignUpPage";
import Header from "./Header";
import Footer from "./Footer";
import UserProfilePage from "../pages/AccountPage";
import MangaReader from "../pages/MangaReader";


const Router = () => {
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
      case 'account': return <UserProfilePage navigate={navigate} />;
      case 'home': return <HomePage navigate={navigate} />;
      case 'library': return <LibraryPage navigate={navigate} />;
      case 'login': return <LoginPage navigate={navigate} />;
      case 'signup': return <SignupPage navigate={navigate} />;
      case 'manga': return <MangaPage navigate={navigate} manga_id={pageData.id} />;
      case 'reader': return <MangaReader navigate={navigate} chapterId={pageData} />;
      case 'search': return <SearchPage navigate={navigate} />;
      default: return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="app">
      {currentPage != 'reader' && <Header navigate={navigate} />}      
      <main className={currentPage != 'reader' ? "main-content" : "main-content-reader"}>
        {renderPage()}
      </main>
      {currentPage != 'reader' && <Footer />}      
    </div>
  );
};



export default Router;