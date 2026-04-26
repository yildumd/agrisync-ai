import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../firebase/firebase.services';
import toast from 'react-hot-toast';
import { Leaf } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
    
    const result = await registerUser(formData.email, formData.password, {
      organizationName: formData.organizationName,
      role: 'cooperative_staff'
    });
    
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
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
            
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
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm"
                placeholder="e.g., Green Farmers Cooperative"
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
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm"
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
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm"
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