import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../firebase/firebase.services';
import toast from 'react-hot-toast';
import { Leaf } from 'lucide-react';
import { nigeriaStates, lgasByState } from '../data/nigeriaData';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'cooperative',
    organizationName: '',
    // Farmer fields
    farmerName: '',
    farmerPhone: '',
    farmerState: '',
    farmerLga: '',
    farmerVillage: '',
    farmerFarmSize: '',
    // Buyer fields
    buyerBusinessName: '',
    buyerPhone: '',
    buyerAddress: ''
  });
  const [availableLGAs, setAvailableLGAs] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update LGAs when state changes
    if (name === 'farmerState') {
      setAvailableLGAs(lgasByState[value] || []);
      setFormData(prev => ({ ...prev, farmerLga: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    // Prepare user data based on role
    let userData = {
      role: formData.role,
    };
    
    if (formData.role === 'cooperative') {
      userData = {
        ...userData,
        organizationName: formData.organizationName,
        type: 'cooperative'
      };
    } else if (formData.role === 'farmer') {
      // Combine location from state, lga, and village
      const fullLocation = `${formData.farmerVillage}, ${formData.farmerLga}, ${formData.farmerState}`;
      
      userData = {
        ...userData,
        name: formData.farmerName,
        phone: formData.farmerPhone,
        location: fullLocation,
        state: formData.farmerState,
        lga: formData.farmerLga,
        village: formData.farmerVillage,
        farmSize: parseFloat(formData.farmerFarmSize) || 0,
        type: 'individual',
        totalCarbonScore: 0
      };
    } else if (formData.role === 'buyer') {
      userData = {
        ...userData,
        businessName: formData.buyerBusinessName,
        phone: formData.buyerPhone,
        address: formData.buyerAddress,
        type: 'buyer'
      };
    }
    
    const result = await registerUser(formData.email, formData.password, userData);
    
    if (result.success) {
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <Leaf className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join the carbon-first agriculture movement
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                I am a... *
              </label>
              <select
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="cooperative">Cooperative / NGO (Manage farmers)</option>
                <option value="farmer">Individual Farmer (Sell & track carbon)</option>
                <option value="buyer">Buyer (Purchase produce)</option>
              </select>
            </div>

            {/* Cooperative Fields */}
            {formData.role === 'cooperative' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization/Cooperative Name *
                </label>
                <input
                  type="text"
                  name="organizationName"
                  required
                  value={formData.organizationName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Green Farmers Cooperative"
                />
              </div>
            )}

            {/* Farmer Fields with State and LGA Dropdowns */}
            {formData.role === 'farmer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="farmerName"
                    required
                    value={formData.farmerName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="farmerPhone"
                    required
                    value={formData.farmerPhone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., +234 801 234 5678"
                  />
                </div>

                {/* State Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <select
                    name="farmerState"
                    required
                    value={formData.farmerState}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select State</option>
                    {nigeriaStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                {/* LGA Dropdown - updates based on state */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Local Government Area *
                  </label>
                  <select
                    name="farmerLga"
                    required
                    value={formData.farmerLga}
                    onChange={handleChange}
                    disabled={!formData.farmerState}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                  >
                    <option value="">Select LGA</option>
                    {availableLGAs.map(lga => (
                      <option key={lga} value={lga}>{lga}</option>
                    ))}
                  </select>
                </div>

                {/* Village/Town */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Village/Town *
                  </label>
                  <input
                    type="text"
                    name="farmerVillage"
                    required
                    value={formData.farmerVillage}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Zaria City"
                  />
                </div>

                {/* Farm Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Farm Size (hectares)
                  </label>
                  <input
                    type="number"
                    name="farmerFarmSize"
                    step="0.1"
                    value={formData.farmerFarmSize}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 2.5"
                  />
                </div>
              </>
            )}

            {/* Buyer Fields */}
            {formData.role === 'buyer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="buyerBusinessName"
                    required
                    value={formData.buyerBusinessName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Your business name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="buyerPhone"
                    required
                    value={formData.buyerPhone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Contact number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="buyerAddress"
                    required
                    value={formData.buyerAddress}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Business address"
                  />
                </div>
              </>
            )}

            {/* Common Auth Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Minimum 6 characters"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </div>
          
          <div className="text-center">
            <Link to="/login" className="text-sm text-green-600 hover:text-green-500">
              Already have an account? Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;