import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addActivity, updateFarmerCarbonScore, getFarmerById } from '../firebase/firebase.services';
import { calculateActivityScore } from '../utils/carbonScore';
import Layout from '../components/Layout/Layout';
import toast from 'react-hot-toast';
import { ArrowLeft, Leaf, Info } from 'lucide-react';

const ActivityLog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [farmerName, setFarmerName] = useState('');
  const [formData, setFormData] = useState({
    treesPlanted: '',
    fertilizerType: 'organic',
    bushBurning: 'no',
    farmingPractice: 'conventional'
  });

  useEffect(() => {
    loadFarmerName();
  }, [id]);

  const loadFarmerName = async () => {
    const result = await getFarmerById(id);
    if (result.success) {
      setFarmerName(result.farmer.name);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculatePreviewScore = () => {
    return calculateActivityScore({
      treesPlanted: parseInt(formData.treesPlanted) || 0,
      fertilizerType: formData.fertilizerType,
      bushBurning: formData.bushBurning,
      farmingPractice: formData.farmingPractice
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const treesPlantedNum = parseInt(formData.treesPlanted) || 0;
    const activityData = {
      ...formData,
      treesPlanted: treesPlantedNum,
      calculatedScore: calculatePreviewScore()
    };

    const result = await addActivity(activityData, id);
    
    if (result.success) {
      await updateFarmerCarbonScore(id, activityData.calculatedScore);
      toast.success(`Activity logged! +${activityData.calculatedScore} carbon points earned!`);
      navigate(`/farmers/${id}`);
    } else {
      toast.error(result.error);
    }

    setLoading(false);
  };

  const previewScore = calculatePreviewScore();

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(`/farmers/${id}`)}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={20} />
          Back to {farmerName || 'Farmer'}
        </button>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex items-center gap-2">
              <Leaf className="text-white" size={24} />
              <h1 className="text-2xl font-bold text-white">Log Carbon Activity</h1>
            </div>
            <p className="text-blue-100 text-sm mt-1">Track farming practices to calculate carbon score</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Trees Planted
              </label>
              <input
                type="number"
                name="treesPlanted"
                min="0"
                value={formData.treesPlanted}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter number of trees"
              />
              <p className="text-xs text-gray-500 mt-1">+10 points per tree</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fertilizer Type
              </label>
              <select
                name="fertilizerType"
                value={formData.fertilizerType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="organic">Organic (+20 points)</option>
                <option value="chemical">Chemical (+5 points)</option>
                <option value="none">None (0 points)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bush Burning
              </label>
              <select
                name="bushBurning"
                value={formData.bushBurning}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="no">No (0 points)</option>
                <option value="yes">Yes (-30 points)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farming Practice
              </label>
              <select
                name="farmingPractice"
                value={formData.farmingPractice}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="conventional">Conventional (0 points)</option>
                <option value="conservation_agriculture">Conservation Agriculture (+15 points)</option>
                <option value="agroforestry">Agroforestry (+25 points)</option>
                <option value="crop_rotation">Crop Rotation (+10 points)</option>
              </select>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="text-green-600 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-medium text-green-800">Carbon Score Impact</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {previewScore > 0 ? '+' : ''}{previewScore} points
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    This activity will {previewScore >= 0 ? 'increase' : 'decrease'} the farmer's total carbon score
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(`/farmers/${id}`)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Logging Activity...' : 'Log Activity'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ActivityLog;