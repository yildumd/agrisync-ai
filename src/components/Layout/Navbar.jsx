import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../firebase/firebase.services';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Leaf, Users, ShoppingBag, LogOut, Globe, Menu, X } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { language, setLanguage, t, languageOptions } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      navigate('/login');
    }
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  if (!currentUser) return null;

  return (
    <nav className="bg-green-700 text-white shadow-lg relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3 md:py-4">
          {/* Logo */}
          <Link to="/" className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Leaf className="inline" size={24} />
            <span className="hidden sm:inline">AgriSync AI</span>
            <span className="sm:hidden">AgriSync</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-green-200 transition">{t('dashboard')}</Link>
            <Link to="/farmers" className="hover:text-green-200 transition flex items-center gap-1">
              <Users size={18} />
              {t('farmers')}
            </Link>
            <Link to="/marketplace" className="hover:text-green-200 transition flex items-center gap-1">
              <ShoppingBag size={18} />
              {t('marketplace')}
            </Link>

            {/* Language Selector */}
            <div className="relative flex items-center gap-1">
              <Globe size={18} />
              <select
                value={language}
                onChange={handleLanguageChange}
                className="bg-green-700 text-white border border-green-500 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
              >
                {languageOptions.map(opt => (
                  <option key={opt.code} value={opt.code}>
                    {opt.nativeName}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={handleLogout} className="hover:text-green-200 transition flex items-center gap-1">
              <LogOut size={18} />
              {t('logout')}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-green-600 transition"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-green-700 border-t border-green-600 shadow-lg z-40">
            <div className="flex flex-col space-y-3 py-4 px-4">
              <Link
                to="/"
                className="hover:text-green-200 transition py-2"
                onClick={() => setIsOpen(false)}
              >
                {t('dashboard')}
              </Link>
              <Link
                to="/farmers"
                className="hover:text-green-200 transition flex items-center gap-2 py-2"
                onClick={() => setIsOpen(false)}
              >
                <Users size={18} />
                {t('farmers')}
              </Link>
              <Link
                to="/marketplace"
                className="hover:text-green-200 transition flex items-center gap-2 py-2"
                onClick={() => setIsOpen(false)}
              >
                <ShoppingBag size={18} />
                {t('marketplace')}
              </Link>

              {/* Language Selector in mobile */}
              <div className="relative flex items-center gap-2 py-2">
                <Globe size={18} />
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="bg-green-700 text-white border border-green-500 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                >
                  {languageOptions.map(opt => (
                    <option key={opt.code} value={opt.code}>
                      {opt.nativeName}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="hover:text-green-200 transition flex items-center gap-2 py-2 text-left"
              >
                <LogOut size={18} />
                {t('logout')}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;