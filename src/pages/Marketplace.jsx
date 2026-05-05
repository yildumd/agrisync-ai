import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getListings, addListing, getFarmers } from '../firebase/firebase.services';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Package, Plus, Phone, MapPin, X, Search, Filter, Star, TrendingUp, Calendar, User } from 'lucide-react';
import { nigeriaStates, lgasByState, produceList } from '../data/nigeriaData';

const Marketplace = () => {
  const { currentUser } = useAuth();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    state: '',
    lga: '',
    produceType: '',
    minPrice: '',
    maxPrice: ''
  });
  const [availableLGAs, setAvailableLGAs] = useState([]);
  
  const [formData, setFormData] = useState({
    produceName: '',
    quantity: '',
    price: '',
    farmerId: '',
    contactPhone: '',
    description: '',
    quality: 'standard',
    harvestDate: ''
  });

  useEffect(() => {
    loadData();
  }, [currentUser]);

  useEffect(() => {
    applyFilters();
  }, [listings, filters, searchTerm]);

  const loadData = async () => {
    if (currentUser) {
      const listingsResult = await getListings();
      if (listingsResult.success) {
        setListings(listingsResult.listings);
        setFilteredListings(listingsResult.listings);
      }
      
      const farmersResult = await getFarmers(currentUser.uid);
      if (farmersResult.success) {
        setFarmers(farmersResult.farmers);
      }
      
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...listings];
    
    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(listing => 
        listing.produceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.farmer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // State filter
    if (filters.state) {
      filtered = filtered.filter(listing => 
        listing.farmer?.state === filters.state
      );
    }
    
    // LGA filter
    if (filters.lga) {
      filtered = filtered.filter(listing => 
        listing.farmer?.lga === filters.lga
      );
    }
    
    // Produce type filter
    if (filters.produceType) {
      filtered = filtered.filter(listing => 
        listing.produceName.toLowerCase() === filters.produceType.toLowerCase() ||
        listing.farmer?.mainProduce?.includes(filters.produceType)
      );
    }
    
    // Price range filter
    if (filters.minPrice) {
      filtered = filtered.filter(listing => 
        parseFloat(listing.price) >= parseFloat(filters.minPrice)
      );
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(listing => 
        parseFloat(listing.price) <= parseFloat(filters.maxPrice)
      );
    }
    
    setFilteredListings(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update LGAs when state changes
    if (name === 'state') {
      setAvailableLGAs(lgasByState[value] || []);
      setFilters(prev => ({ ...prev, lga: '' }));
    }
  };

  const clearFilters = () => {
    setFilters({
      state: '',
      lga: '',
      produceType: '',
      minPrice: '',
      maxPrice: ''
    });
    setSearchTerm('');
    setShowFilters(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.produceName || !formData.quantity || !formData.price || !formData.farmerId) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    const result = await addListing(formData, currentUser.uid, formData.farmerId);
    
    if (result.success) {
      toast.success('Listing added successfully!');
      setShowModal(false);
      setFormData({
        produceName: '',
        quantity: '',
        price: '',
        farmerId: '',
        contactPhone: '',
        description: '',
        quality: 'standard',
        harvestDate: ''
      });
      loadData();
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  const getQualityBadge = (quality) => {
    switch(quality) {
      case 'premium':
        return <span className="bg-gold-100 text-gold-700 px-2 py-1 rounded-full text-xs font-medium">⭐ Premium</span>;
      case 'organic':
        return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">🌱 Organic</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">Standard</span>;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
            <p className="text-gray-500 mt-1">Buy and sell farm produce directly from farmers</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
          >
            <Plus size={20} />
            Add Listing
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by produce name, farmer, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <Filter size={20} />
              Filters
              {(filters.state || filters.produceType || filters.minPrice) && (
                <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-0.5">Active</span>
              )}
            </button>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All States</option>
                    {nigeriaStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Local Government Area
                  </label>
                  <select
                    name="lga"
                    value={filters.lga}
                    onChange={handleFilterChange}
                    disabled={!filters.state}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                  >
                    <option value="">All LGAs</option>
                    {availableLGAs.map(lga => (
                      <option key={lga} value={lga}>{lga}</option>
                    ))}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Produce</option>
                    {produceList.map(produce => (
                      <option key={produce} value={produce}>{produce}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Price (₦)
                    </label>
                    <input
                      type="number"
                      name="minPrice"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Price (₦)
                    </label>
                    <input
                      type="number"
                      name="maxPrice"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Found {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
              {/* Listing Image/Header */}
              <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Package className="text-white opacity-50" size={48} />
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{listing.produceName}</h3>
                    {listing.quality && (
                      <div className="mt-1">{getQualityBadge(listing.quality)}</div>
                    )}
                  </div>
                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Available
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-gray-500">Quantity:</span>
                    <span className="font-semibold text-gray-900">{listing.quantity} kg</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-gray-500">Price:</span>
                    <span className="text-2xl font-bold text-green-600">₦{listing.price}<span className="text-sm font-normal text-gray-500">/kg</span></span>
                  </div>
                  {listing.harvestDate && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Calendar size={14} />
                        Harvest:
                      </span>
                      <span className="text-gray-700">{new Date(listing.harvestDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {listing.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{listing.description}</p>
                  )}
                </div>
                
                {listing.farmer && (
                  <div className="border-t pt-3 mt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <User size={14} />
                      <span className="font-medium">{listing.farmer.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <MapPin size={14} />
                      <span>{listing.farmer.village || listing.farmer.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{listing.farmer.lga}, {listing.farmer.state}</span>
                    </div>
                    {listing.farmer.totalCarbonScore && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                        <Leaf size={12} />
                        <span>Carbon Score: {listing.farmer.totalCarbonScore} pts</span>
                      </div>
                    )}
                    {listing.contactPhone && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} />
                        <span>{listing.contactPhone}</span>
                      </div>
                    )}
                  </div>
                )}
                
                <button
                  onClick={() => {
                    const phone = listing.contactPhone || listing.farmer?.phone;
                    if (phone) {
                      window.location.href = `tel:${phone}`;
                    } else {
                      toast.error('Contact number not available');
                    }
                  }}
                  className="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                >
                  <Phone size={16} />
                  Contact Seller
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 mb-4">No listings found matching your criteria</p>
            {(searchTerm || filters.state || filters.produceType) ? (
              <button
                onClick={clearFilters}
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                Create First Listing
              </button>
            )}
          </div>
        )}

        {/* Add Listing Modal - Keep your existing modal but add quality and harvestDate fields */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold">Add Marketplace Listing</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Farmer *
                  </label>
                  <select
                    name="farmerId"
                    required
                    value={formData.farmerId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select a farmer</option>
                    {farmers.map((farmer) => (
                      <option key={farmer.id} value={farmer.id}>
                        {farmer.name} - {farmer.village || farmer.location}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Produce Name *
                  </label>
                  <input
                    type="text"
                    name="produceName"
                    required
                    list="produceOptions"
                    value={formData.produceName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Cassava, Maize, Tomatoes"
                  />
                  <datalist id="produceOptions">
                    {produceList.map(produce => (
                      <option key={produce} value={produce} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quality Grade
                  </label>
                  <select
                    name="quality"
                    value={formData.quality}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium ⭐</option>
                    <option value="organic">Organic 🌱</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity (kg) *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    required
                    min="0"
                    step="0.1"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., 100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per kg (₦) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., 500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harvest Date
                  </label>
                  <input
                    type="date"
                    name="harvestDate"
                    value={formData.harvestDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Phone number for inquiries"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave blank to use farmer's registered phone</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Additional details about the produce (quality, packaging, delivery options, etc.)"
                  ></textarea>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Marketplace;