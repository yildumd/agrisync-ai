import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addFarmer } from '../firebase/firebase.services';
import Layout from '../components/Layout/Layout';
import toast from 'react-hot-toast';
import { UserPlus, ArrowLeft, Camera } from 'lucide-react';
import { nigeriaStates, lgasByState, produceList } from '../data/nigeriaData';

// Farmer groups/clusters data (can be moved to Firebase later)
const farmerGroups = [
  "Kaduna North Women Farmers Cooperative",
  "Zaria Youth Agric Initiative",
  "Lagos Urban Farmers Association",
  "Benue Rice Farmers Union",
  "Kano Tomato Growers Association",
  "Ogun Cassava Processors Cooperative",
  "Plateau Potato Farmers Group",
  "Delta Fish Farmers Association",
  "Enugu Poultry Farmers Cooperative",
  "Niger State Shea Butter Producers"
];

const AddFarmer = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [availableLGAs, setAvailableLGAs] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    state: '',
    lga: '',
    village: '',
    farmSize: '',
    preferredLanguage: 'english',
    farmerGroup: '',
    profilePhoto: null,
    profilePhotoURL: '',
    mainProduce: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update LGAs when state changes
    if (name === 'state') {
      setAvailableLGAs(lgasByState[value] || []);
      setFormData(prev => ({ ...prev, lga: '' }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Photo size should be less than 2MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData(prev => ({
          ...prev,
          profilePhoto: file,
          profilePhotoURL: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProduceChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      mainProduce: selectedOptions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.phone || !formData.state || !formData.lga || !formData.village || !formData.farmSize) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);

    // Combine location from state, lga, and village
    const fullLocation = `${formData.village}, ${formData.lga}, ${formData.state}`;
    
    const farmerData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email || '',
      location: fullLocation,
      state: formData.state,
      lga: formData.lga,
      village: formData.village,
      farmSize: parseFloat(formData.farmSize),
      preferredLanguage: formData.preferredLanguage,
      farmerGroup: formData.farmerGroup || '',
      mainProduce: formData.mainProduce,
      profilePhotoURL: formData.profilePhotoURL || '',
      createdAt: new Date().toISOString()
    };

    const result = await addFarmer(farmerData, currentUser.uid);

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
      <div className="max-w-3xl mx-auto">
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
            {/* Profile Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farmer Photo
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="h-20 w-20 rounded-full object-cover" />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <Camera className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Max 2MB. JPG, PNG or GIF</p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address (Optional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="farmer@example.com"
              />
            </div>

            {/* Location Information */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Location Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select State</option>
                    {nigeriaStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Local Government Area *
                  </label>
                  <select
                    name="lga"
                    required
                    value={formData.lga}
                    onChange={handleChange}
                    disabled={!formData.state}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                  >
                    <option value="">Select LGA</option>
                    {availableLGAs.map(lga => (
                      <option key={lga} value={lga}>{lga}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Village/Town *
                  </label>
                  <input
                    type="text"
                    name="village"
                    required
                    value={formData.village}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Village or town name"
                  />
                </div>
              </div>
            </div>

            {/* Farm Information */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Farm Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Farmer Group / Cooperative
                  </label>
                  <select
                    name="farmerGroup"
                    value={formData.farmerGroup}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Group (Optional)</option>
                    {farmerGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Assign farmer to an existing cooperative or group</p>
                </div>
              </div>
            </div>

            {/* Main Produce */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Produce (Select multiple for marketplace)
              </label>
              <select
                multiple
                name="mainProduce"
                value={formData.mainProduce}
                onChange={handleProduceChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 h-32"
              >
                {produceList.map(produce => (
                  <option key={produce} value={produce}>{produce}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple. This helps buyers find your produce.</p>
            </div>

            {/* Preferences */}
            <div className="border-t pt-4">
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

            {/* Submit Buttons */}
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