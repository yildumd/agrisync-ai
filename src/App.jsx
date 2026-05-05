import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { getUserRole } from './firebase/firebase.services';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import CooperativeDashboard from './pages/CooperativeDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import Farmers from './pages/Farmers';
import AddFarmer from './pages/AddFarmer';
import FarmerProfile from './pages/FarmerProfile';
import ActivityLog from './pages/ActivityLog';
import Marketplace from './pages/Marketplace';
import LoadingSpinner from './components/Common/LoadingSpinner';

function App() {
  const { currentUser, loading } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (currentUser) {
        const role = await getUserRole(currentUser.uid);
        setUserRole(role);
      }
      setRoleLoading(false);
    };
    fetchUserRole();
  }, [currentUser]);

  if (loading || roleLoading) {
    return React.createElement(LoadingSpinner, null);
  }

  // Role-based dashboard component
  const getDashboard = () => {
    if (!currentUser) return React.createElement(Navigate, { to: "/login" });
    
    switch(userRole) {
      case 'farmer':
        return React.createElement(FarmerDashboard, null);
      case 'cooperative':
        return React.createElement(CooperativeDashboard, null);
      case 'buyer':
        return React.createElement(BuyerDashboard, null);
      default:
        return React.createElement(CooperativeDashboard, null);
    }
  };

  // Role-based access to farmer management pages
  const canAccessFarmerManagement = () => {
    return userRole === 'cooperative';
  };

  return React.createElement(Routes, null,
    // Public routes
    React.createElement(Route, { path: "/login", element: !currentUser ? React.createElement(Login, null) : React.createElement(Navigate, { to: "/" }) }),
    React.createElement(Route, { path: "/register", element: !currentUser ? React.createElement(Register, null) : React.createElement(Navigate, { to: "/" }) }),
    
    // Dashboard (role-based)
    React.createElement(Route, { path: "/", element: getDashboard() }),
    
    // Farmer management (only cooperatives)
    React.createElement(Route, { path: "/farmers", element: canAccessFarmerManagement() ? React.createElement(Farmers, null) : React.createElement(Navigate, { to: "/" }) }),
    React.createElement(Route, { path: "/farmers/add", element: canAccessFarmerManagement() ? React.createElement(AddFarmer, null) : React.createElement(Navigate, { to: "/" }) }),
    React.createElement(Route, { path: "/farmers/:id", element: currentUser ? React.createElement(FarmerProfile, null) : React.createElement(Navigate, { to: "/login" }) }),
    React.createElement(Route, { path: "/farmers/:id/activity", element: currentUser ? React.createElement(ActivityLog, null) : React.createElement(Navigate, { to: "/login" }) }),
    
    // Marketplace (all authenticated users)
    React.createElement(Route, { path: "/marketplace", element: currentUser ? React.createElement(Marketplace, null) : React.createElement(Navigate, { to: "/login" }) })
  );
}

export default App;