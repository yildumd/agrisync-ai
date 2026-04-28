import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addListing } from '../../firebase/firebase.services';
import { Package, Upload, X, Camera, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const AddProduce = ({ farmerId, farmerName, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    produceName: '',
    quantity: '',
    price: '',
    unit: 'kg',
    harvestDate: '',
    quality: 'standard',
    description: '',
    contactPhone: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.produceName || !formData.quantity || !formData.price) {
      toast.error('Please fill in produce name, quantity, and price');
      return;
    }
    
    setLoading(true);
    
    const listingData = {
      ...formData,
      farmerId: farmerId,
      farmerName: farmerName,
      source: 'farmer_direct',
      status: 'pending_approval',
      createdAt: new Date()
    };

    const result = await addListing(listingData, currentUser.uid, farmerId);
    
    if (result.success) {
      toast.success('Your produce has been listed! An NGO will review it soon.');
      onSuccess();
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Package className="text-green-600" size={24} />
            <h2 className="text-xl font-semibold">List Your Produce</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        {/* Steps indicator */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                {step > 1 ? <Check size={14} /> : "1"}
              </div>
              <span className="ml-2 text-sm">Details</span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                {step > 2 ? <Check size={14} /> : "2"}
              </div>
              <span className="ml-2 text-sm">Review</span>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {step === 1 && (
            <>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Cassava, Maize, Tomatoes, Yams"
                  list="produce-suggestions"
                />
                <datalist id="produce-suggestions">
                  <option>Cassava</option>
                  <option>Maize</option>
                  <option>Tomatoes</option>
                  <option>Yams</option>
                  <option>Rice</option>
                  <option>Beans</option>
                  <option>Groundnuts</option>
                  <option>Plantain</option>
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    required
                    step="0.1"
                    min="0"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="bunch">Bunch</option>
                    <option value="piece">Piece</option>
                    <option value="bag">Bag (50kg)</option>
                    <option value="tonne">Tonne (1000kg)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price per {formData.unit} (₦) *
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  step="10"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., 500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quality Grade
                </label>
                <select
                  name="quality"
                  value={formData.quality}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="premium">Premium 💎 (highest price)</option>
                  <option value="standard">Standard ⭐</option>
                  <option value="economy">Economy 💰 (best value)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Harvest Date
                </label>
                <input
                  type="date"
                  name="harvestDate"
                  value={formData.harvestDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone (for buyers)
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Phone number for buyer inquiries"
                />
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Continue to Review
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900">Review Your Listing</h3>
                <div className="border-t pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Produce:</span>
                    <span className="font-medium">{formData.produceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Quantity:</span>
                    <span>{formData.quantity} {formData.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Price:</span>
                    <span>₦{formData.price} per {formData.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Value:</span>
                    <span className="font-semibold text-green-600">
                      ₦{parseInt(formData.quantity) * parseInt(formData.price) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Quality:</span>
                    <span className="capitalize">{formData.quality}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
                <p>📋 Your listing will be reviewed by an NGO before going live. This ensures quality and fair pricing for everyone.</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Listing'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddProduce;
