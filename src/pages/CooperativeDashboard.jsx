import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFarmers, getDashboardStats } from '../firebase/firebase.services';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { Users, TreePine, Leaf, ShoppingBag, Plus, TrendingUp, Award } from 'lucide-react';

const CooperativeDashboard = () => {
  const { currentUser } = useAuth();
  const [farmers, setFarmers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (currentUser) {
      const farmersResult = await getFarmers(currentUser.uid);
      if (farmersResult.success) {
        setFarmers(farmersResult.farmers);
      }
      
      const statsResult = await getDashboardStats(currentUser.uid);
      if (statsResult.success) {
        setStats(statsResult.stats);
      }
      
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const totalCarbonScore = farmers.reduce((sum, f) => sum + (f.totalCarbonScore || 0), 0);
  const avgCarbonScore = farmers.length > 0 ? (totalCarbonScore / farmers.length).toFixed(0) : 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md p-6 text-white">
          <h1 className="text-2xl font-bold">Cooperative Dashboard</h1>
          <p className="text-blue-100 mt-1">Manage your farmers and track carbon impact</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Farmers</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalFarmers || 0}</p>
              </div>
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Trees Planted</p>
                <p className="text-2xl font-bold text-green-600">{stats?.totalTreesPlanted || 0}</p>
              </div>
              <TreePine className="text-green-600" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Avg Carbon Score</p>
                <p className="text-2xl font-bold text-green-600">{avgCarbonScore}</p>
              </div>
              <Leaf className="text-green-600" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Marketplace Listings</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalMarketplaceListings || 0}</p>
              </div>
              <ShoppingBag className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Link to="/farmers/add" className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 text-center">
              <Plus size={18} className="inline mr-1" />
              Add Farmer
            </Link>
            <Link to="/farmers" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-center">
              <Users size={18} className="inline mr-1" />
              View All Farmers
            </Link>
            <Link to="/marketplace" className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 text-center">
              <ShoppingBag size={18} className="inline mr-1" />
              Marketplace
            </Link>
          </div>
        </div>

        {/* Top Farmers Section */}
        {farmers.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award size={20} />
              Top Performing Farmers
            </h2>
            <div className="space-y-3">
              {farmers
                .sort((a, b) => (b.totalCarbonScore || 0) - (a.totalCarbonScore || 0))
                .slice(0, 5)
                .map((farmer, idx) => (
                  <Link to={`/farmers/${farmer.id}`} key={farmer.id}>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                        <div>
                          <p className="font-medium text-gray-900">{farmer.name}</p>
                          <p className="text-xs text-gray-500">{farmer.village || farmer.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{farmer.totalCarbonScore || 0} pts</p>
                        <p className="text-xs text-gray-500">Carbon Score</p>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CooperativeDashboard;