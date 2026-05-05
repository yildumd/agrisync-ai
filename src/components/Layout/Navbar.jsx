import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../firebase/firebase.services';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Leaf, Users, ShoppingBag, LogOut, Globe } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { language, setLanguage, t, languageOptions } = useLanguage();

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
    <nav className="bg-green-700 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold flex items-center gap-2">
            <Leaf className="inline" />
            AgriSync AI
          </Link>
          
          <div className="flex items-center space-x-6">
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;