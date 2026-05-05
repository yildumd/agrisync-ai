import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFarmerById, getFarmerActivities, deleteFarmer } from '../firebase/firebase.services';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { getCarbonRating } from '../utils/carbonScore';
import { 
  ArrowLeft, Leaf, MapPin, Phone, Mail, Calendar, TrendingUp, 
  Plus, Package, Users, Map, Award, Clock, Camera, 
  Briefcase, ShoppingBag, ChevronRight, CheckCircle, Trash2, X, Filter, CalendarDays
} from 'lucide-react';
import toast from 'react-hot-toast';

const FarmerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [farmer, setFarmer] = useState(null);
  const [allActivities, setAllActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFullPhoto, setShowFullPhoto] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Date filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);

  useEffect(() => {
    loadFarmerData();
  }, [id]);

  useEffect(() => {
    applyDateFilter();
  }, [allActivities, startDate, endDate]);

  const loadFarmerData = async () => {
    if (currentUser && id) {
      const farmerResult = await getFarmerById(id);
      if (farmerResult.success) {
        setFarmer(farmerResult.farmer);
        
        const activitiesResult = await getFarmerActivities(id);
        if (activitiesResult.success) {
          setAllActivities(activitiesResult.activities);
          setFilteredActivities(activitiesResult.activities);
        }
      } else {
        toast.error('Farmer not found');
        navigate('/farmers');
      }
      setLoading(false);
    }
  };

  const applyDateFilter = () => {
    if (!startDate && !endDate) {
      setFilteredActivities(allActivities);
      return;
    }

    let filtered = [...allActivities];
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(activity => {
        const activityDate = activity.date?.toDate();
        return activityDate >= start;
      });
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(activity => {
        const activityDate = activity.date?.toDate();
        return activityDate <= end;
      });
    }
    
    setFilteredActivities(filtered);
  };

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setShowDateFilter(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const result = await deleteFarmer(id);
    if (result.success) {
      toast.success('Farmer deleted successfully');
      navigate('/farmers');
    } else {
      toast.error(result.error);
      setShowDeleteModal(false);
    }
    setDeleting(false);
  };

  if (loading) return <LoadingSpinner />;
  if (!farmer) return null;

  const carbonRating = getCarbonRating(farmer.totalCarbonScore || 0);
  const totalTrees = allActivities.reduce((sum, act) => sum + (act.treesPlanted || 0), 0);
  const totalActivities = allActivities.length;
  const filteredCount = filteredActivities.length;
  
  // Use filtered activities for display
  const displayActivities = filteredActivities;
  const recentActivities = displayActivities.slice(0, 5);
  
  // Total carbon from filtered activities
  const totalCarbonFromFiltered = displayActivities.reduce((sum, act) => sum + (act.calculatedScore || 0), 0);

  return (
    <Layout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/farmers')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={20} />
          Back to Farmers
        </button>

        {/* Header Section with Photo */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                {/* Farmer Photo */}
                <div className="relative">
                  {farmer.profilePhotoURL ? (
                    <img
                      src={farmer.profilePhotoURL}
                      alt={farmer.name}
                      className="h-24 w-24 rounded-full object-cover border-4 border-white cursor-pointer hover:opacity-90 transition"
                      onClick={() => setShowFullPhoto(true)}
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-green-500 flex items-center justify-center border-4 border-white">
                      <Camera className="h-10 w-10 text-white" />
                    </div>
                  )}
                </div>
                
                <div>
                  <h1 className="text-3xl font-bold text-white">{farmer.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-green-100 text-sm">
                      <MapPin size={14} />
                      {farmer.village || farmer.location}
                    </span>
                    <span className="flex items-center gap-1 text-green-100 text-sm">
                      <Phone size={14} />
                      {farmer.phone}
                    </span>
                    {farmer.email && (
                      <span className="flex items-center gap-1 text-green-100 text-sm">
                        <Mail size={14} />
                        {farmer.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Carbon Score Card */}
              <div className={`${carbonRating.bg} px-6 py-3 rounded-lg text-center min-w-[140px]`}>
                <Leaf className={`inline ${carbonRating.color}`} size={24} />
                <div className={`text-3xl font-bold ${carbonRating.color}`}>
                  {farmer.totalCarbonScore || 0}
                </div>
                <div className={`text-sm font-medium ${carbonRating.color}`}>Carbon Score</div>
                <div className={`text-xs font-medium ${carbonRating.color} mt-1`}>{carbonRating.label}</div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="p-6 border-b">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{totalCarbonFromFiltered}</div>
                <div className="text-sm text-gray-500">Filtered Points</div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Location Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Map size={20} />
                Location Details
              </h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">State</p>
                    <p className="font-medium text-gray-900">{farmer.state || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Local Government Area</p>
                    <p className="font-medium text-gray-900">{farmer.lga || 'Not specified'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Village/Town</p>
                  <p className="font-medium text-gray-900">{farmer.village || farmer.location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Full Address</p>
                  <p className="text-sm text-gray-600">{farmer.location}</p>
                </div>
              </div>
            </div>

            {/* Organization Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase size={20} />
                Organization & Groups
              </h2>
              <div className="space-y-3">
                {farmer.farmerGroup ? (
                  <div>
                    <p className="text-xs text-gray-500">Farmer Group / Cooperative</p>
                    <p className="font-medium text-green-600 flex items-center gap-2">
                      <Users size={16} />
                      {farmer.farmerGroup}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Not assigned to any group yet</p>
                )}
                <div>
                  <p className="text-xs text-gray-500">Joined Date</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <Calendar size={16} />
                    {farmer.createdAt ? new Date(farmer.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Produce */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag size={20} />
                Main Produce
              </h2>
              {farmer.mainProduce && farmer.mainProduce.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {farmer.mainProduce.map((produce, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {produce}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No produce listed yet</p>
              )}
            </div>

            {/* Activity History with Date Filter */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp size={20} />
                  Activity History
                  {filteredCount !== allActivities.length && (
                    <span className="text-sm font-normal text-gray-500">
                      ({filteredCount} of {allActivities.length} shown)
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => setShowDateFilter(!showDateFilter)}
                  className={`text-sm flex items-center gap-1 px-3 py-1 rounded-lg transition ${
                    showDateFilter || startDate || endDate
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <Filter size={14} />
                  Filter by date
                  {(startDate || endDate) && (
                    <span className="ml-1 w-2 h-2 bg-green-600 rounded-full"></span>
                  )}
                </button>
              </div>

              {/* Date Filter Controls */}
              {showDateFilter && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={clearDateFilter}
                      className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      <X size={14} /> Clear filters
                    </button>
                  </div>
                </div>
              )}
              
              {displayActivities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    {allActivities.length === 0 
                      ? 'No activities logged yet' 
                      : 'No activities in selected date range'}
                  </p>
                  {allActivities.length === 0 && (
                    <Link
                      to={`/farmers/${id}/activity`}
                      className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Log First Activity
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start mb-2">
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
                      <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                        {activity.treesPlanted > 0 && (
                          <div>
                            <span className="text-gray-500">🌳 Trees Planted:</span>
                            <span className="ml-2 font-medium">{activity.treesPlanted}</span>
                          </div>
                        )}
                        {activity.fertilizerType && (
                          <div>
                            <span className="text-gray-500">🧑‍🌾 Fertilizer:</span>
                            <span className="ml-2 font-medium capitalize">{activity.fertilizerType}</span>
                          </div>
                        )}
                        {activity.farmingPractice && activity.farmingPractice !== 'conventional' && (
                          <div className="col-span-2">
                            <span className="text-gray-500">🌱 Practice:</span>
                            <span className="ml-2 font-medium capitalize">
                              {activity.farmingPractice.replace('_', ' ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {displayActivities.length > 5 && (
                    <button 
                      onClick={() => {
                        // Optionally expand view or navigate to dedicated page
                        toast.info('Showing 5 most recent. Adjust date range for more.');
                      }}
                      className="w-full text-center text-green-600 hover:text-green-700 text-sm font-medium py-2"
                    >
                      Showing 5 of {displayActivities.length} activities. Adjust date range to see more.
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Actions & Badges */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to={`/farmers/${id}/activity`}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Log New Activity
                </Link>
                <Link
                  to="/marketplace"
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                >
                  <Package size={20} />
                  Add Marketplace Listing
                </Link>
                <button
                  onClick={() => navigate(`/farmers/${id}/edit`)}
                  className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2"
                >
                  <Users size={20} />
                  Edit Farmer Details
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                >
                  <Trash2 size={20} />
                  Delete Farmer
                </button>
              </div>
            </div>

            {/* Achievements / Badges */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award size={20} />
                Achievements
              </h2>
              <div className="space-y-2">
                {totalTrees >= 100 && (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle size={18} />
                    <span className="text-sm">🌳 Tree Champion (100+ trees)</span>
                  </div>
                )}
                {farmer.totalCarbonScore >= 500 && (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle size={18} />
                    <span className="text-sm">💚 Carbon Hero (500+ points)</span>
                  </div>
                )}
                {totalActivities >= 10 && (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle size={18} />
                    <span className="text-sm">📊 Active Farmer (10+ activities)</span>
                  </div>
                )}
                {farmer.farmerGroup && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Users size={18} />
                    <span className="text-sm">🤝 Cooperative Member</span>
                  </div>
                )}
                {farmer.mainProduce && farmer.mainProduce.length >= 3 && (
                  <div className="flex items-center gap-2 text-purple-600">
                    <ShoppingBag size={18} />
                    <span className="text-sm">🌾 Diverse Producer</span>
                  </div>
                )}
                
                {(totalTrees < 100 && farmer.totalCarbonScore < 500 && totalActivities < 10) && (
                  <p className="text-gray-500 italic text-sm">Complete more activities to earn badges!</p>
                )}
              </div>
            </div>

            {/* Carbon Impact Summary */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-6 border border-green-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Leaf size={20} className="text-green-600" />
                Carbon Impact
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total CO₂ Sequestered:</span>
                  <span className="font-bold text-green-600">
                    {(totalTrees * 0.022).toFixed(2)} tons
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Carbon Credit Value:</span>
                  <span className="font-bold text-green-600">
                    ${(totalTrees * 0.022 * 15).toFixed(2)} (est.)
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  * Based on 22kg CO₂ per tree/year at $15/ton carbon credit
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Delete Farmer</h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{farmer.name}</strong>? This action cannot be undone. 
              All activities and marketplace listings associated with this farmer will also be removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Photo Modal */}
      {showFullPhoto && farmer.profilePhotoURL && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowFullPhoto(false)}
        >
          <div className="max-w-2xl max-h-[90vh]">
            <img 
              src={farmer.profilePhotoURL} 
              alt={farmer.name}
              className="w-full h-auto rounded-lg"
            />
            <button
              onClick={() => setShowFullPhoto(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default FarmerProfile;