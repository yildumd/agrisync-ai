import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../firebase/firebase.services';
import { useAuth } from '../../context/AuthContext';
import { Leaf, Users, ShoppingBag, LogOut } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      navigate('/login');
    }
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
          
          <div className="flex space-x-6">
            <Link to="/" className="hover:text-green-200 transition">Dashboard</Link>
            <Link to="/farmers" className="hover:text-green-200 transition flex items-center gap-1">
              <Users size={18} />
              Farmers
            </Link>
            <Link to="/marketplace" className="hover:text-green-200 transition flex items-center gap-1">
              <ShoppingBag size={18} />
              Marketplace
            </Link>
            <button onClick={handleLogout} className="hover:text-green-200 transition flex items-center gap-1">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;