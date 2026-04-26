import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFarmers } from '../firebase/firebase.services';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { getCarbonRating } from '../utils/carbonScore';
import { Plus, MapPin, Phone, Search, Leaf } from 'lucide-react';

const Farmers = () => {
  const { currentUser } = useAuth();
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadFarmers();
  }, [currentUser]);

  const loadFarmers = async () => {
    if (currentUser) {
      const result = await getFarmers(currentUser.uid);
      if (result.success) {
        setFarmers(result.farmers);
      }
      setLoading(false);
    }
  };

  const filteredFarmers = farmers.filter(farmer =>
    farmer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.phone?.includes(searchTerm)
  );

  if (loading) return <LoadingSpinner />;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Farmers</h1>
          <Link
            to="/farmers/add"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Plus size={20} />
            Add Farmer
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search farmers by name, location, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarmers.map((farmer) => {
            const carbonRating = getCarbonRating(farmer.totalCarbonScore || 0);
            return (
              <Link to={`/farmers/${farmer.id}`} key={farmer.id}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{farmer.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">ID: {farmer.id.slice(0, 8)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${carbonRating.bg} ${carbonRating.color}`}>
                      <Leaf size={12} className="inline mr-1" />
                      {carbonRating.label}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span className="text-sm">{farmer.location || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      <span className="text-sm">{farmer.phone}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Farm Size:</span>
                      <span className="font-medium">{farmer.farmSize} hectares</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">Carbon Score:</span>
                      <span className="font-medium text-green-600">{farmer.totalCarbonScore || 0} pts</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredFarmers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 mb-4">No farmers found</p>
            {searchTerm ? (
              <button 
                onClick={() => setSearchTerm('')}
                className="text-green-600 hover:text-green-700"
              >
                Clear search
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