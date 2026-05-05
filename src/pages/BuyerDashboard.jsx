import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getListings } from '../firebase/firebase.services';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { ShoppingBag, Package, MapPin, Phone, TrendingUp } from 'lucide-react';

const BuyerDashboard = () => {
  const { currentUser } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (currentUser) {
      const listingsResult = await getListings();
      if (listingsResult.success) {
        setListings(listingsResult.listings);
      }
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const recentListings = listings.slice(0, 6);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow-md p-6 text-white">
          <h1 className="text-2xl font-bold">Buyer Dashboard</h1>
          <p className="text-purple-100 mt-1">Discover fresh produce from local farmers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Available Listings</p>
                <p className="text-2xl font-bold text-purple-600">{listings.length}</p>
              </div>
              <Package className="text-purple-600" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Farmers Selling</p>
                <p className="text-2xl font-bold text-green-600">{new Set(listings.map(l => l.farmerId)).size}</p>
              </div>
              <ShoppingBag className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        {/* Quick Action */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <Link
            to="/marketplace"
            className="block bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 text-center"
          >
            Browse Marketplace →
          </Link>
        </div>

        {/* Recent Listings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Recent Listings
          </h2>
          {recentListings.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No listings available yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentListings.map((listing) => (
                <Link to="/marketplace" key={listing.id}>
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{listing.produceName}</h3>
                      <span className="text-green-600 font-bold">₦{listing.price}/kg</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <MapPin size={14} />
                      <span>{listing.farmer?.village || listing.farmer?.location}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{listing.quantity} kg available</span>
                      <span className="text-green-600">{listing.farmer?.totalCarbonScore || 0} carbon pts</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BuyerDashboard;