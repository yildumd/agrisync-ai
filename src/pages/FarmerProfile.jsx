import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFarmerById, getFarmerActivities } from '../firebase/firebase.services';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { getCarbonRating } from '../utils/carbonScore';
import { ArrowLeft, Leaf, MapPin, Phone, Calendar, TrendingUp, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const FarmerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [farmer, setFarmer] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFarmerData();
  }, [id]);

  const loadFarmerData = async () => {
    if (currentUser && id) {
      const farmerResult = await getFarmerById(id);
      if (farmerResult.success) {
        setFarmer(farmerResult.farmer);
        
        const activitiesResult = await getFarmerActivities(id);
        if (activitiesResult.success) {
          setActivities(activitiesResult.activities);
        }
      } else {
        toast.error('Farmer not found');
        navigate('/farmers');
      }
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!farmer) return null;

  const carbonRating = getCarbonRating(farmer.totalCarbonScore || 0);
  const totalTrees = activities.reduce((sum, act) => sum + (act.treesPlanted || 0), 0);
  const totalActivities = activities.length;

  return (
    <Layout>
      <div className="space-y-6">
        <button
          onClick={() => navigate('/farmers')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={20} />
          Back to Farmers
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-white">{farmer.name}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-green-100">
                    <MapPin size={16} />
                    {farmer.location}
                  </span>
                  <span className="flex items-center gap-1 text-green-100">
                    <Phone size={16} />
                    {farmer.phone}
                  </span>
                </div>
              </div>
              <div className={`${carbonRating.bg} px-4 py-2 rounded-lg text-center`}>
                <Leaf className={`inline ${carbonRating.color}`} size={20} />
                <div className={`text-2xl font-bold ${carbonRating.color}`}>
                  {farmer.totalCarbonScore || 0}
                </div>
                <div className={`text-sm ${carbonRating.color}`}>Carbon Score</div>
                <div className={`text-xs font-medium ${carbonRating.color}`}>{carbonRating.label}</div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{farmer.farmSize}</div>
                <div className="text-sm text-gray-500">Hectares</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{totalTrees}</div>
                <div className="text-sm text-gray-500">Trees Planted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{totalActivities}</div>
                <div className="text-sm text-gray-500">Activities Logged</div>
              </div>
            </div>
          </div>
        </div>

        <Link
          to={`/farmers/${id}/activity`}
          className="block bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition text-center"
        >
          <Plus className="inline mr-2" size={20} />
          Log New Activity
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Activity History
          </h2>
          
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No activities logged yet</p>
              <Link
                to={`/farmers/${id}/activity`}
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Log First Activity
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {new Date(activity.date?.toDate()).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      Score: +{activity.calculatedScore || 0}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {activity.treesPlanted > 0 && (
                      <div>
                        <span className="text-gray-500">Trees Planted:</span>
                        <span className="ml-2 font-medium">{activity.treesPlanted}</span>
                      </div>
                    )}
                    {activity.fertilizerType && (
                      <div>
                        <span className="text-gray-500">Fertilizer:</span>
                        <span className="ml-2 font-medium capitalize">{activity.fertilizerType}</span>
                      </div>
                    )}
                    {activity.farmingPractice && (
                      <div>
                        <span className="text-gray-500">Practice:</span>
                        <span className="ml-2 font-medium capitalize">
                          {activity.farmingPractice.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FarmerProfile;