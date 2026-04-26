import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getListings, addListing, getFarmers } from '../firebase/firebase.services';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Package, Plus, Phone, MapPin, X } from 'lucide-react';

const Marketplace = () => {
  const { currentUser } = useAuth();
  const [listings, setListings] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    produceName: '',
    quantity: '',
    price: '',
    farmerId: '',
    contactPhone: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (currentUser) {
      const listingsResult = await getListings();
      if (listingsResult.success) {
        setListings(listingsResult.listings);
      }
      
      const farmersResult = await getFarmers(currentUser.uid);
      if (farmersResult.success) {
        setFarmers(farmersResult.farmers);
      }
      
      setLoading(false);
    }
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
        description: ''
      });
      loadData();
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
          >
            <Plus size={20} />
            Add Listing
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{listing.produceName}</h3>
                <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Quantity:</span>
                  <span className="font-medium">{listing.quantity} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Price:</span>
                  <span className="font-medium text-green-600">₦{listing.price}/kg</span>
                </div>
                {listing.description && (
                  <p className="text-sm text-gray-600 mt-2">{listing.description}</p>
                )}
              </div>
              
              {listing.farmer && (
                <div className="border-t pt-3 mt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <MapPin size={14} />
                    <span>{listing.farmer.location}</span>
                  </div>
                  {listing.contactPhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} />
                      <span>{listing.contactPhone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {listings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 mb-4">No marketplace listings yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Create First Listing
            </button>
          </div>
        )}

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
                        {farmer.name} - {farmer.location}
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
                    value={formData.produceName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Cassava, Maize, Tomatoes"
                  />
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
                    placeholder="Additional details about the produce"
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