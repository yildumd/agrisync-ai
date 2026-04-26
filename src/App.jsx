import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Farmers from './pages/Farmers';
import AddFarmer from './pages/AddFarmer';
import FarmerProfile from './pages/FarmerProfile';
import ActivityLog from './pages/ActivityLog';
import Marketplace from './pages/Marketplace';
import LoadingSpinner from './components/Common/LoadingSpinner';

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return React.createElement(LoadingSpinner, null);
  }

  return React.createElement(Routes, null,
    React.createElement(Route, { path: "/login", element: !currentUser ? React.createElement(Login, null) : React.createElement(Navigate, { to: "/" }) }),
    React.createElement(Route, { path: "/register", element: !currentUser ? React.createElement(Register, null) : React.createElement(Navigate, { to: "/" }) }),
    React.createElement(Route, { path: "/", element: currentUser ? React.createElement(Dashboard, null) : React.createElement(Navigate, { to: "/login" }) }),
    React.createElement(Route, { path: "/farmers", element: currentUser ? React.createElement(Farmers, null) : React.createElement(Navigate, { to: "/login" }) }),
    React.createElement(Route, { path: "/farmers/add", element: currentUser ? React.createElement(AddFarmer, null) : React.createElement(Navigate, { to: "/login" }) }),
    React.createElement(Route, { path: "/farmers/:id", element: currentUser ? React.createElement(FarmerProfile, null) : React.createElement(Navigate, { to: "/login" }) }),
    React.createElement(Route, { path: "/farmers/:id/activity", element: currentUser ? React.createElement(ActivityLog, null) : React.createElement(Navigate, { to: "/login" }) }),
    React.createElement(Route, { path: "/marketplace", element: currentUser ? React.createElement(Marketplace, null) : React.createElement(Navigate, { to: "/login" }) })
  );
}

export default App;