import { Search, BookOpen, User, LogOut, Menu, X, Home, Library, Bug, Speaker, Phone } from 'lucide-react';
import type { PageType } from "../types";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";


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


export default Header;