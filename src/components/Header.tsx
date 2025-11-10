import { Search, User, LogOut, Menu, X, Library, Bug, Mail } from 'lucide-react';
import type { PageType, Manga } from "../types";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { draynorApi } from "../api/draynor";
import './Header.css';


interface HeaderProps {
  navigate: (page: PageType, data?: any) => void;
}


const Header = ({ navigate }: HeaderProps) => {
  const { user, logout } = useAuth();
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Manga[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const hamburgerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<any | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hamburgerRef.current && !hamburgerRef.current.contains(event.target as Node)) {
        setHamburgerOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await draynorApi.mangas.getByTitle(searchQuery, 6);
        setSearchResults(res.results);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('search', { query: searchQuery });
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo" onClick={() => navigate('home')}>
          <img src="draynor-lodestone.webp" alt="" width={32} height={32} />
          <span>Draynor</span>
        </div>

        {/* Search */}
        <div className="header-search-container">
          <form className="header-search" onSubmit={handleSearch}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Search Mangas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Search Results Dropdown */}
          {searchQuery && searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((manga) => (
                <div
                  key={manga.id}
                  className="search-result-item"
                  onClick={() => {
                    navigate('manga', manga);
                    setSearchResults([]);
                    setSearchQuery('');
                  }}
                >
                  <img src={manga.cover_image_url} alt={manga.title} />
                  <div>
                    <h4>{manga.title}</h4>
                    <span>{manga.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isSearching && <div className="search-loading">Searching...</div>}
        </div>

        {/* Navigation */}
        <nav className="header-nav">
          <div className="hamburger-menu" ref={hamburgerRef}>
            <button className="hamburger-button" onClick={() => setHamburgerOpen(!hamburgerOpen)}>
              {hamburgerOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className={`hamburger-dropdown ${hamburgerOpen ? 'open' : ''}`}>
              <button onClick={() => { navigate('library'); setHamburgerOpen(false); }}>
                <Library size={18} /> Library
              </button>
              <button onClick={() => { navigate('search'); setHamburgerOpen(false); }}>
                <Search size={18} /> Search Mangas
              </button>
              <button onClick={() => { navigate('bug'); setHamburgerOpen(false); }}>
                <Bug size={18} /> Bug Report
              </button>
              <button onClick={() => { navigate('request'); setHamburgerOpen(false); }}>
                <Mail size={18} /> Request Manga
              </button>
            </div>
          </div>

          {user ? (
            <div className="user-menu" ref={userMenuRef}>
              <button className="user-button" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                {user.username}
              </button>
              <div className={`user-dropdown ${userMenuOpen ? 'open' : ''}`}>
                <button onClick={() => { navigate('account'); setUserMenuOpen(false); }}>
                  <User size={18} /> Profile
                </button>
                <button onClick={() => { logout(); setUserMenuOpen(false); }}>
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => navigate('login')}>
              <User size={20} />
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
