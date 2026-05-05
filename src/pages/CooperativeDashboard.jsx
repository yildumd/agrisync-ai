import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFarmers, getDashboardStats, getFarmerActivities } from '../firebase/firebase.services';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { Users, TreePine, Leaf, ShoppingBag, Plus, TrendingUp, Award, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const CooperativeDashboard = () => {
  const { currentUser } = useAuth();
  const [farmers, setFarmers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (currentUser) {
      const farmersResult = await getFarmers(currentUser.uid);
      if (farmersResult.success) {
        setFarmers(farmersResult.farmers);
      }
      
      const statsResult = await getDashboardStats(currentUser.uid);
      if (statsResult.success) {
        setStats(statsResult.stats);
      }
      
      setLoading(false);
    }
  };

  // Function to export carbon report
  const exportCarbonReport = async () => {
    if (farmers.length === 0) {
      toast.error('No farmers to export');
      return;
    }

    setExporting(true);
    toast.loading('Generating carbon report...', { id: 'export' });

    try {
      // Fetch activities for each farmer to calculate detailed carbon data
      const farmersWithActivities = await Promise.all(
        farmers.map(async (farmer) => {
          const activitiesResult = await getFarmerActivities(farmer.id);
          const activities = activitiesResult.success ? activitiesResult.activities : [];
          
          // Calculate totals from activities
          const totalTrees = activities.reduce((sum, act) => sum + (act.treesPlanted || 0), 0);
          const totalPoints = activities.reduce((sum, act) => sum + (act.calculatedScore || 0), 0);
          const co2Sequestered = totalTrees * 0.022;
          const estimatedCreditValue = co2Sequestered * 15; // $15 per ton
          
          return {
            name: farmer.name,
            phone: farmer.phone,
            state: farmer.state,
            lga: farmer.lga,
            village: farmer.village,
            farmSize: farmer.farmSize,
            carbonScore: farmer.totalCarbonScore || 0,
            totalTreesPlanted: totalTrees,
            totalCarbonPointsEarned: totalPoints,
            co2SequesteredTons: co2Sequestered.toFixed(2),
            estimatedCreditValueUSD: estimatedCreditValue.toFixed(2),
            activitiesCount: activities.length,
            lastActivityDate: farmer.lastActivityDate ? new Date(farmer.lastActivityDate.toDate()).toLocaleDateString() : 'Never',
            joinedDate: farmer.createdAt ? new Date(farmer.createdAt).toLocaleDateString() : 'N/A'
          };
        })
      );

      // Overall totals
      const overallTotals = farmersWithActivities.reduce((sum, f) => ({
        totalCarbonScore: sum.totalCarbonScore + f.carbonScore,
        totalTrees: sum.totalTrees + f.totalTreesPlanted,
        totalCO2: sum.totalCO2 + parseFloat(f.co2SequesteredTons),
        totalCreditValue: sum.totalCreditValue + parseFloat(f.estimatedCreditValueUSD),
        totalActivities: sum.totalActivities + f.activitiesCount
      }), { totalCarbonScore: 0, totalTrees: 0, totalCO2: 0, totalCreditValue: 0, totalActivities: 0 });

      // Prepare CSV rows
      const headers = [
        'Farmer Name',
        'Phone',
        'State',
        'LGA',
        'Village',
        'Farm Size (ha)',
        'Carbon Score',
        'Trees Planted',
        'Total Points Earned',
        'CO₂ Sequestered (tons)',
        'Est. Carbon Credit Value (USD)',
        'Activities Count',
        'Last Activity Date',
        'Joined Date'
      ];

      const rows = farmersWithActivities.map(f => [
        f.name,
        f.phone,
        f.state,
        f.lga,
        f.village,
        f.farmSize,
        f.carbonScore,
        f.totalTreesPlanted,
        f.totalCarbonPointsEarned,
        f.co2SequesteredTons,
        f.estimatedCreditValueUSD,
        f.activitiesCount,
        f.lastActivityDate,
        f.joinedDate
      ]);

      // Add summary row
      const summaryRow = [
        '===== SUMMARY =====',
        '',
        '',
        '',
        '',
        '',
        overallTotals.totalCarbonScore,
        overallTotals.totalTrees,
        overallTotals.totalActivities,
        overallTotals.totalCO2.toFixed(2),
        overallTotals.totalCreditValue.toFixed(2),
        '',
        '',
        ''
      ];

      const csvContent = [
        headers,
        ...rows,
        summaryRow
      ].map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ).join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `carbon_report_${new Date().toISOString().slice(0,19)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Carbon report exported successfully!', { id: 'export' });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to generate report', { id: 'export' });
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const totalCarbonScore = farmers.reduce((sum, f) => sum + (f.totalCarbonScore || 0), 0);
  const avgCarbonScore = farmers.length > 0 ? (totalCarbonScore / farmers.length).toFixed(0) : 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Cooperative Dashboard</h1>
              <p className="text-blue-100 mt-1">Manage your farmers and track carbon impact</p>
            </div>
            <button
              onClick={exportCarbonReport}
              disabled={exporting || farmers.length === 0}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Download size={18} />
              {exporting ? 'Exporting...' : 'Export Carbon Report'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Farmers</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalFarmers || 0}</p>
              </div>
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Trees Planted</p>
                <p className="text-2xl font-bold text-green-600">{stats?.totalTreesPlanted || 0}</p>
              </div>
              <TreePine className="text-green-600" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Avg Carbon Score</p>
                <p className="text-2xl font-bold text-green-600">{avgCarbonScore}</p>
              </div>
              <Leaf className="text-green-600" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Marketplace Listings</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalMarketplaceListings || 0}</p>
              </div>
              <ShoppingBag className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Link to="/farmers/add" className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 text-center">
              <Plus size={18} className="inline mr-1" />
              Add Farmer
            </Link>
            <Link to="/farmers" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-center">
              <Users size={18} className="inline mr-1" />
              View All Farmers
            </Link>
            <Link to="/marketplace" className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 text-center">
              <ShoppingBag size={18} className="inline mr-1" />
              Marketplace
            </Link>
          </div>
        </div>

        {/* Top Farmers Section */}
        {farmers.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award size={20} />
              Top Performing Farmers
            </h2>
            <div className="space-y-3">
              {farmers
                .sort((a, b) => (b.totalCarbonScore || 0) - (a.totalCarbonScore || 0))
                .slice(0, 5)
                .map((farmer, idx) => (
                  <Link to={`/farmers/${farmer.id}`} key={farmer.id}>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                        <div>
                          <p className="font-medium text-gray-900">{farmer.name}</p>
                          <p className="text-xs text-gray-500">{farmer.village || farmer.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{farmer.totalCarbonScore || 0} pts</p>
                        <p className="text-xs text-gray-500">Carbon Score</p>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CooperativeDashboard;