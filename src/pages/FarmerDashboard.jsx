import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFarmerByUserId, getFarmerActivities } from '../firebase/firebase.services';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { getCarbonRating } from '../utils/carbonScore';
import { 
  Leaf, TrendingUp, Package, Calendar, Award, 
  Plus, ShoppingBag, Users, MapPin, Phone,
  CheckCircle, TreePine, Sprout, Truck
} from 'lucide-react';
import toast from 'react-hot-toast';

const FarmerDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentListings, setRecentListings] = useState([]);

  useEffect(() => {
    loadFarmerData();
  }, [currentUser]);

  const loadFarmerData = async () => {
    if (currentUser) {
      // Get farmer profile linked to this user
      const farmerResult = await getFarmerByUserId(currentUser.uid);
      if (farmerResult.success && farmerResult.farmer) {
        setFarmer(farmerResult.farmer);
        
        // Get farmer's activities
        const activitiesResult = await getFarmerActivities(farmerResult.farmer.id);
        if (activitiesResult.success) {
          setActivities(activitiesResult.activities);
        }
      }
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!farmer) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Leaf className="mx-auto text-green-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to AgriSync AI</h2>
          <p className="text-gray-600 mb-6">Complete your farmer profile to start tracking carbon</p>
          <button
            onClick={() => navigate('/farmers/add')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Complete Your Profile
          </button>
        </div>
      </Layout>
    );
  }

  const carbonRating = getCarbonRating(farmer.totalCarbonScore || 0);
  const totalTrees = activities.reduce((sum, act) => sum + (act.treesPlanted || 0), 0);
  const totalActivities = activities.length;
  const recentActivities = activities.slice(0, 3);
  
  // Calculate carbon impact
  const co2Sequestrated = (totalTrees * 0.022).toFixed(2);
  const carbonCreditValue = (totalTrees * 0.022 * 15).toFixed(2);

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-md p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {farmer.name}!</h1>
              <p className="text-green-100 mt-1">Track your carbon impact and grow your farm</p>
            </div>
            <div className={`${carbonRating.bg} px-4 py-2 rounded-lg text-center`}>
              <Leaf className={`inline ${carbonRating.color}`} size={20} />
              <div className={`text-2xl font-bold ${carbonRating.color}`}>
                {farmer.totalCarbonScore || 0}
              </div>
              <div className={`text-xs ${carbonRating.color}`}>Carbon Score</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Farm Size</p>
                <p className="text-xl font-bold text-gray-900">{farmer.farmSize} ha</p>
              </div>
              <MapPin className="text-green-600" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Trees Planted</p>
                <p className="text-xl font-bold text-green-600">{totalTrees}</p>
              </div>
              <TreePine className="text-green-600" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Activities</p>
                <p className="text-xl font-bold text-gray-900">{totalActivities}</p>
              </div>
              <Calendar className="text-green-600" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">CO₂ Captured</p>
                <p className="text-xl font-bold text-green-600">{co2Sequestrated} tons</p>
              </div>
              <Leaf className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Activities & Carbon */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to={`/farmers/${farmer.id}/activity`}
                  className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Log Activity
                </Link>
                <Link
                  to="/marketplace"
                  className="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={18} />
                  Sell Produce
                </Link>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={20} />
                Recent Activities
              </h2>
              {recentActivities.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-3">No activities logged yet</p>
                  <Link
                    to={`/farmers/${farmer.id}/activity`}
                    className="text-green-600 hover:text-green-700 text-sm"
                  >
                    Log your first activity →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="border border-gray-100 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {new Date(activity.date?.toDate()).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-green-600">
                          +{activity.calculatedScore || 0} pts
                        </span>
                      </div>
                      <div className="mt-2 text-sm">
                        {activity.treesPlanted > 0 && (
                          <span className="text-gray-600">🌳 Planted {activity.treesPlanted} trees</span>
                        )}
                        {activity.fertilizerType && activity.fertilizerType !== 'none' && (
                          <span className="text-gray-600 ml-3">🧑‍🌾 {activity.fertilizerType} fertilizer</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Profile & Impact */}
          <div className="space-y-6">
            {/* Farmer Profile Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                {farmer.profilePhotoURL ? (
                  <img src={farmer.profilePhotoURL} alt={farmer.name} className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{farmer.name}</h3>
                  <p className="text-sm text-gray-500">{farmer.village}, {farmer.state}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={14} />
                  <span>{farmer.phone}</span>
                </div>
                {farmer.farmerGroup && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={14} />
                    <span>{farmer.farmerGroup}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Carbon Impact Summary */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-6 border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Leaf size={18} className="text-green-600" />
                Your Carbon Impact
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">CO₂ Sequestered:</span>
                  <span className="font-bold text-green-600">{co2Sequestrated} tons</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Carbon Credit Value:</span>
                  <span className="font-bold text-green-600">${carbonCreditValue}</span>
                </div>
                <div className="mt-3 pt-2 border-t border-green-200">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Good (100-500 pts)</span>
                    <span>Excellent (500+ pts)</span>
                  </div>
                  <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-600 rounded-full"
                      style={{ width: `${Math.min((farmer.totalCarbonScore || 0) / 10, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Award size={18} />
                Your Badges
              </h3>
              <div className="flex flex-wrap gap-2">
                {totalTrees >= 100 && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">🌳 Tree Champion</span>
                )}
                {farmer.totalCarbonScore >= 500 && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">💚 Carbon Hero</span>
                )}
                {totalActivities >= 10 && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">📊 Active Farmer</span>
                )}
                {farmer.mainProduce && farmer.mainProduce.length >= 3 && (
                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">🌾 Diverse Producer</span>
                )}
                {(totalTrees < 100 && farmer.totalCarbonScore < 500 && totalActivities < 10) && (
                  <p className="text-gray-500 text-sm">Log activities to earn badges!</p>
                )}
              </div>
            </div>

            {/* Main Produce */}
            {farmer.mainProduce && farmer.mainProduce.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <ShoppingBag size={18} />
                  What I Grow
                </h3>
                <div className="flex flex-wrap gap-2">
                  {farmer.mainProduce.map((produce, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                      {produce}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FarmerDashboard;