import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFarmerById, updateFarmer } from '../firebase/firebase.services';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Camera, X } from 'lucide-react';
import { nigeriaStates, lgasByState, produceList } from '../data/nigeriaData';

const EditFarmer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    mainProduce: [],
    profilePhotoURL: ''
  });

  useEffect(() => {
    loadFarmerData();
  }, [id]);

  const loadFarmerData = async () => {
    if (currentUser && id) {
      const result = await getFarmerById(id);
      if (result.success && result.farmer) {
        const farmer = result.farmer;
        setFormData({
          name: farmer.name || '',
          phone: farmer.phone || '',
          email: farmer.email || '',
          state: farmer.state || '',
          lga: farmer.lga || '',
          village: farmer.village || '',
          farmSize: farmer.farmSize || '',
          preferredLanguage: farmer.preferredLanguage || 'english',
          farmerGroup: farmer.farmerGroup || '',
          mainProduce: farmer.mainProduce || [],
          profilePhotoURL: farmer.profilePhotoURL || ''
        });
        setPhotoPreview(farmer.profilePhotoURL || null);
        if (farmer.state) {
          setAvailableLGAs(lgasByState[farmer.state] || []);
        }
      } else {
        toast.error('Farmer not found');
        navigate('/farmers');
      }
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'state') {
      setAvailableLGAs(lgasByState[value] || []);
      setFormData(prev => ({ ...prev, lga: '' }));
    }
  };

  const handleProduceChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, mainProduce: selectedOptions }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Photo size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData(prev => ({ ...prev, profilePhotoURL: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.state || !formData.lga || !formData.village || !formData.farmSize) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setSaving(true);
    const fullLocation = `${formData.village}, ${formData.lga}, ${formData.state}`;
    const updatedData = {
      ...formData,
      location: fullLocation,
      farmSize: parseFloat(formData.farmSize),
      updatedAt: new Date().toISOString()
    };
    
    const result = await updateFarmer(id, updatedData);
    if (result.success) {
      toast.success('Farmer updated successfully!');
      navigate(`/farmers/${id}`);
    } else {
      toast.error(result.error);
    }
    setSaving(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(`/farmers/${id}`)}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={20} />
          Back to Profile
        </button>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Edit Farmer</h1>
            <p className="text-blue-100 text-sm mt-1">Update farmer information</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Farmer Photo</label>
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
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="w-full text-sm" />
                </div>
              </div>
            </div>

            {/* Basic fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="name" placeholder="Full Name *" value={formData.name} onChange={handleChange} className="border p-2 rounded" required />
              <input name="phone" placeholder="Phone *" value={formData.phone} onChange={handleChange} className="border p-2 rounded" required />
            </div>
            <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full border p-2 rounded" />

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select name="state" value={formData.state} onChange={handleChange} className="border p-2 rounded" required>
                <option value="">Select State</option>
                {nigeriaStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select name="lga" value={formData.lga} onChange={handleChange} disabled={!formData.state} className="border p-2 rounded" required>
                <option value="">Select LGA</option>
                {availableLGAs.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <input name="village" placeholder="Village/Town *" value={formData.village} onChange={handleChange} className="border p-2 rounded" required />
            </div>

            {/* Farm info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="farmSize" type="number" step="0.1" placeholder="Farm Size (hectares) *" value={formData.farmSize} onChange={handleChange} className="border p-2 rounded" required />
              <input name="farmerGroup" placeholder="Farmer Group" value={formData.farmerGroup} onChange={handleChange} className="border p-2 rounded" />
            </div>

            {/* Main Produce */}
            <div>
              <label className="block text-sm font-medium mb-1">Main Produce (multiple)</label>
              <select multiple value={formData.mainProduce} onChange={handleProduceChange} className="w-full border p-2 rounded h-32">
                {produceList.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Language */}
            <select name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange} className="w-full border p-2 rounded">
              <option value="english">English</option>
              <option value="hausa">Hausa</option>
              <option value="yoruba">Yoruba</option>
              <option value="igbo">Igbo</option>
            </select>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => navigate(`/farmers/${id}`)} className="flex-1 border p-2 rounded">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white p-2 rounded flex items-center justify-center gap-2">
                <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditFarmer;