import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFarmers } from '../firebase/firebase.services';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { getCarbonRating } from '../utils/carbonScore';
import { 
  Plus, MapPin, Phone, Search, Leaf, Filter, 
  Users, Camera, ChevronDown, X, Grid3x3, List,
  Award, TrendingUp, Package
} from 'lucide-react';
import { nigeriaStates, produceList } from '../data/nigeriaData';

const Farmers = () => {
  const { currentUser } = useAuth();
  const [farmers, setFarmers] = useState([]);
  const [filteredFarmers, setFilteredFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  
  // Filter states
  const [filters, setFilters] = useState({
    state: '',
    farmerGroup: '',
    minCarbonScore: '',
    produceType: ''
  });

  // Get unique farmer groups from data
  const farmerGroups = [...new Set(farmers.map(f => f.farmerGroup).filter(Boolean))];

  useEffect(() => {
    loadFarmers();
  }, [currentUser]);

  useEffect(() => {
    applyFilters();
  }, [farmers, searchTerm, filters]);

  const loadFarmers = async () => {
    if (currentUser) {
      const result = await getFarmers(currentUser.uid);
      if (result.success) {
        setFarmers(result.farmers);
        setFilteredFarmers(result.farmers);
      }
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...farmers];
    
    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(farmer =>
        farmer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.phone?.includes(searchTerm) ||
        farmer.village?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.farmerGroup?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // State filter
    if (filters.state) {
      filtered = filtered.filter(farmer => farmer.state === filters.state);
    }
    
    // Farmer group filter
    if (filters.farmerGroup) {
      filtered = filtered.filter(farmer => farmer.farmerGroup === filters.farmerGroup);
    }
    
    // Carbon score filter
    if (filters.minCarbonScore) {
      filtered = filtered.filter(farmer => 
        (farmer.totalCarbonScore || 0) >= parseInt(filters.minCarbonScore)
      );
    }
    
    // Produce type filter
    if (filters.produceType) {
      filtered = filtered.filter(farmer =>
        farmer.mainProduce?.includes(filters.produceType)
      );
    }
    
    setFilteredFarmers(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      state: '',
      farmerGroup: '',
      minCarbonScore: '',
      produceType: ''
    });
    setSearchTerm('');
    setShowFilters(false);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.state) count++;
    if (filters.farmerGroup) count++;
    if (filters.minCarbonScore) count++;
    if (filters.produceType) count++;
    if (searchTerm) count++;
    return count;
  };

  // Calculate stats
  const totalFarmers = filteredFarmers.length;
  const totalCarbonScore = filteredFarmers.reduce((sum, f) => sum + (f.totalCarbonScore || 0), 0);
  const avgCarbonScore = totalFarmers > 0 ? (totalCarbonScore / totalFarmers).toFixed(0) : 0;
  const totalTreesPlanted = filteredFarmers.reduce((sum, f) => sum + (f.totalTreesPlanted || 0), 0);
  const farmersWithPhotos = filteredFarmers.filter(f => f.profilePhotoURL).length;

  if (loading) return <LoadingSpinner />;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Farmers</h1>
            <p className="text-gray-500 mt-1">Manage and track your registered farmers</p>
          </div>
          <Link
            to="/farmers/add"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Plus size={20} />
            Add Farmer
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Farmers</p>
                <p className="text-2xl font-bold text-gray-900">{totalFarmers}</p>
              </div>
              <Users className="text-green-600" size={24} />
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
                <p className="text-xs text-gray-500">Trees Planted</p>
                <p className="text-2xl font-bold text-gray-900">{totalTreesPlanted}</p>
              </div>
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">With Photos</p>
                <p className="text-2xl font-bold text-gray-900">{farmersWithPhotos}</p>
              </div>
              <Camera className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, location, phone, village, or group..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 border rounded-lg transition flex items-center gap-2 ${
                  showFilters || getActiveFilterCount() > 0
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter size={20} />
                Filters
                {getActiveFilterCount() > 0 && (
                  <span className="bg-green-600 text-white text-xs rounded-full px-2 py-0.5">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-white text-gray-600'}`}
                >
                  <Grid3x3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-green-600 text-white' : 'bg-white text-gray-600'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <select
                    name="state"
                    value={filters.state}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All States</option>
                    {nigeriaStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Farmer Group
                  </label>
                  <select
                    name="farmerGroup"
                    value={filters.farmerGroup}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Groups</option>
                    {farmerGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Carbon Score
                  </label>
                  <select
                    name="minCarbonScore"
                    value={filters.minCarbonScore}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Any Score</option>
                    <option value="100">100+ points</option>
                    <option value="200">200+ points</option>
                    <option value="500">500+ points</option>
                    <option value="1000">1000+ points</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Produce Type
                  </label>
                  <select
                    name="produceType"
                    value={filters.produceType}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Produce</option>
                    {produceList.slice(0, 20).map(produce => (
                      <option key={produce} value={produce}>{produce}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <X size={14} />
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Showing {filteredFarmers.length} of {farmers.length} farmers
          </p>
        </div>

        {/* Farmers Grid/List View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFarmers.map((farmer) => {
              const carbonRating = getCarbonRating(farmer.totalCarbonScore || 0);
              return (
                <Link to={`/farmers/${farmer.id}`} key={farmer.id}>
                  <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden group">
                    {/* Photo Header */}
                    <div className="h-32 bg-gradient-to-r from-green-600 to-green-700 relative">
                      {farmer.profilePhotoURL ? (
                        <img
                          src={farmer.profilePhotoURL}
                          alt={farmer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Camera className="text-white opacity-50" size={48} />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${carbonRating.bg} ${carbonRating.color}`}>
                          <Leaf size={10} className="inline mr-1" />
                          {carbonRating.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition">
                          {farmer.name}
                        </h3>
                        {farmer.farmerGroup && (
                          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <Users size={12} />
                            {farmer.farmerGroup}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-gray-600 mt-3">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin size={14} className="text-gray-400" />
                          <span>{farmer.village || farmer.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={14} className="text-gray-400" />
                          <span>{farmer.phone}</span>
                        </div>
                      </div>
                      
                      {/* Produce Badges */}
                      {farmer.mainProduce && farmer.mainProduce.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {farmer.mainProduce.slice(0, 2).map((produce, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                              {produce}
                            </span>
                          ))}
                          {farmer.mainProduce.length > 2 && (
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                              +{farmer.mainProduce.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Farm Size:</span>
                          <span className="font-medium">{farmer.farmSize} ha</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-500">Carbon Score:</span>
                          <span className={`font-bold ${farmer.totalCarbonScore >= 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {farmer.totalCarbonScore || 0} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredFarmers.map((farmer) => {
                const carbonRating = getCarbonRating(farmer.totalCarbonScore || 0);
                return (
                  <Link to={`/farmers/${farmer.id}`} key={farmer.id}>
                    <div className="p-4 hover:bg-gray-50 transition flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Photo */}
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {farmer.profilePhotoURL ? (
                            <img src={farmer.profilePhotoURL} alt={farmer.name} className="h-full w-full object-cover" />
                          ) : (
                            <Camera size={20} className="text-green-600" />
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">{farmer.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${carbonRating.bg} ${carbonRating.color}`}>
                              {carbonRating.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {farmer.village || farmer.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone size={12} />
                              {farmer.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Leaf size={12} />
                              {farmer.totalCarbonScore || 0} pts
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronDown size={18} className="text-gray-400 transform -rotate-90" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredFarmers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 mb-4">No farmers found</p>
            {searchTerm || getActiveFilterCount() > 0 ? (
              <button 
                onClick={clearFilters}
                className="text-green-600 hover:text-green-700"
              >
                Clear all filters
              </button>
            ) : (
              <Link
                to="/farmers/add"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Add Your First Farmer
              </Link>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Farmers;