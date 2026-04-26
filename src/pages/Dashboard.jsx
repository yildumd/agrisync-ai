import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../firebase/firebase.services';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { Trees, Users, ShoppingBag, Leaf, Plus, Eye, Store } from 'lucide-react';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, [currentUser]);

  const loadDashboardStats = async () => {
    if (currentUser) {
      const result = await getDashboardStats(currentUser.uid);
      if (result.success) {
        setStats(result.stats);
      }
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const statCards = [
    {
      title: 'Total Farmers',
      value: stats?.totalFarmers || 0,
      icon: Users,
      color: 'bg-blue-500',
      onClick: () => navigate('/farmers')
    },
    {
      title: 'Trees Planted',
      value: stats?.totalTreesPlanted || 0,
      icon: Trees,
      color: 'bg-green-500',
      onClick: () => navigate('/farmers')
    },
    {
      title: 'Avg Carbon Score',
      value: stats?.averageCarbonScore || 0,
      icon: Leaf,
      color: 'bg-yellow-500',
      suffix: ' pts',
      onClick: () => navigate('/farmers')
    },
    {
      title: 'Marketplace Listings',
      value: stats?.totalMarketplaceListings || 0,
      icon: ShoppingBag,
      color: 'bg-purple-500',
      onClick: () => navigate('/marketplace')
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="text-sm text-gray-500">
            Welcome back, {currentUser?.email}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div 
              key={index} 
              onClick={stat.onClick}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}{stat.suffix || ''}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <stat.icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/farmers/add')}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add New Farmer
              </button>
              <button 
                onClick={() => navigate('/marketplace')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Store size={20} />
                View Marketplace
              </button>
              <button 
                onClick={() => navigate('/farmers')}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2"
              >
                <Eye size={20} />
                Manage Farmers
              </button>
            </div>
          </div>

          <div className="md:col-span-2 bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-md p-6 text-white">
            <h2 className="text-xl font-semibold mb-3">Carbon Impact</h2>
            <p className="text-lg mb-2">
              Total Carbon Sequestration Potential
            </p>
            <p className="text-3xl font-bold">
              {Math.round((stats?.totalTreesPlanted || 0) * 0.022)} tons CO₂e
            </p>
            <p className="text-sm mt-2 opacity-90">
              Based on average of 22kg CO₂ per tree per year
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;