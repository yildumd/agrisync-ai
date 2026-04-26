import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addFarmer } from '../firebase/firebase.services';
import Layout from '../components/Layout/Layout';
import toast from 'react-hot-toast';
import { UserPlus, ArrowLeft } from 'lucide-react';

const AddFarmer = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    farmSize: '',
    preferredLanguage: 'english'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.location || !formData.farmSize) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);

    const result = await addFarmer(formData, currentUser.uid);

    if (result.success) {
      toast.success('Farmer added successfully!');
      navigate('/farmers');
    } else {
      toast.error(result.error);
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/farmers')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={20} />
          Back to Farmers
        </button>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-600 px-6 py-4">
            <div className="flex items-center gap-2">
              <UserPlus className="text-white" size={24} />
              <h1 className="text-2xl font-bold text-white">Add New Farmer</h1>
            </div>
            <p className="text-green-100 text-sm mt-1">Enter farmer details to begin tracking carbon data</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Farmer's full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., +234 801 234 5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Village, State, Nigeria"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farm Size (hectares) *
              </label>
              <input
                type="number"
                name="farmSize"
                required
                step="0.1"
                min="0"
                value={formData.farmSize}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Language
              </label>
              <select
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="english">English</option>
                <option value="hausa">Hausa</option>
                <option value="yoruba">Yoruba</option>
                <option value="igbo">Igbo</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/farmers')}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? 'Adding Farmer...' : 'Add Farmer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddFarmer;