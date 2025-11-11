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
import BugReport from "../pages/BugReport";
import PopularMangasPage from "../pages/MostPopularMangasPage";
import LatestMangasPage from "../pages/LatestMangasPage";
import MangaRequest from "../pages/MangaRequestPage";


const Router = () => {
  const [currentPage, setCurrentPage] = useState<PageType>("home");
  const [pageData, setPageData] = useState<any>(null);

  const pageFromHash = (hash: string) => {
    if (!hash) return { page: "home" as PageType, data: null };
    const clean = hash.replace(/^#/, "");
    if (clean.startsWith("manga-")) {
      const id = parseInt(clean.split("-")[1], 10);
      return { page: "manga" as PageType, data: { id } };
    }
    if (clean.startsWith("reader-")) {
      const nums = clean.split("-").slice(1).map(i => parseInt(i))
      return { page: "reader" as PageType, data: {mangaId: nums[0], chapterId: nums[1], chapterIndex: nums[2]} };
    }
    if (clean === "library") return { page: "library" as PageType, data: null };
    if (clean === "login") return { page: "login" as PageType, data: null };
    if (clean === "signup") return { page: "signup" as PageType, data: null };
    if (clean === "search") return { page: "search" as PageType, data: null };
    return { page: "home" as PageType, data: null };
  };

  useEffect(() => {
    const initial = pageFromHash(window.location.hash);
    setCurrentPage(initial.page);
    setPageData(initial.data);

    window.history.replaceState(
      { page: initial.page, data: initial.data },
      "",
      window.location.href
    );

    const handlePop = (e: PopStateEvent) => {
      if (e.state && e.state.page) {
        setCurrentPage(e.state.page);
        setPageData(e.state.data ?? null);
      } else {
        const parsed = pageFromHash(window.location.hash);
        setCurrentPage(parsed.page);
        setPageData(parsed.data);
      }
      window.scrollTo(0, 0);
    };

    const handleHash = () => {
      const parsed = pageFromHash(window.location.hash);
      setCurrentPage(parsed.page);
      setPageData(parsed.data);
      window.history.replaceState(
        { page: parsed.page, data: parsed.data },
        "",
        window.location.href
      );
      window.scrollTo(0, 0);
    };

    window.addEventListener("popstate", handlePop);
    window.addEventListener("hashchange", handleHash);
    return () => {
      window.removeEventListener("popstate", handlePop);
      window.removeEventListener("hashchange", handleHash);
    };
  }, []);

  const navigate = (page: PageType, data: any = null) => {
    setCurrentPage(page);
    setPageData(data);
    window.scrollTo(0, 0);

    // build a unique hash for page+id
    let hash = `#${page}`;
    if (page === "manga" && data?.id) hash = `#manga-${data.id}`;
    if (page === "reader") hash = `#reader-${data.mangaId}-${data.chapterId}-${data.chapterIndex}`;

    // push a new history entry with state and unique URL
    window.history.pushState(
      { page, data },
      "",
      `${window.location.pathname}${hash}`
    );
  };
  
  const renderPage = () => {
    switch (currentPage) {
      case "account":
        return <UserProfilePage navigate={navigate} />;
      case "home":
        return <HomePage navigate={navigate} />;
      case "library":
        return <LibraryPage navigate={navigate} />;
      case "login":
        return <LoginPage navigate={navigate} />;
      case "signup":
        return <SignupPage navigate={navigate} />;
      case "manga":
        return <MangaPage navigate={navigate} manga_id={pageData.id} />;
      case "reader":
        return <MangaReader navigate={navigate} data={pageData} />;
      case "search":
        return <SearchPage navigate={navigate} />;
      case "most-popular":
        return <PopularMangasPage navigate={navigate} />;
      case "latest-mangas":
        return <LatestMangasPage navigate={navigate} />;
      case "bug":
        return <BugReport />;
      case "request":
        return <MangaRequest/>
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentPage]);

  return (
    <div className={currentPage != "reader" ? "app" : "app-reader"}>
      {currentPage != "reader" && <Header navigate={navigate} />}
      <main
        className={
          currentPage != "reader" ? "main-content" : "main-content-reader"
        }
      >
        {renderPage()}
      </main>
      {currentPage != "reader" && <Footer />}
    </div>
  );
};

export default Router;
