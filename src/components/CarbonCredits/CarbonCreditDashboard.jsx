import React, { useEffect, useState } from 'react';
import { calculateAggregateCarbonCredits, calculateFarmerCarbonEarnings } from '../../services/carbonCreditService';
import { TrendingUp, DollarSign, Tree, Leaf, Users, BarChart3, Download, Shield } from 'lucide-react';

const CarbonCreditDashboard = ({ farmers, activities, onGenerateReport }) => {
  const [carbonData, setCarbonData] = useState(null);
  const [totalFarmerEarnings, setTotalFarmerEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (farmers && farmers.length > 0) {
      // Calculate total trees planted across all farmers
      const farmersWithTrees = farmers.map(farmer => ({
        ...farmer,
        totalTreesPlanted: farmer.totalTreesPlanted || 0
      }));
      
      const aggregateData = calculateAggregateCarbonCredits(farmersWithTrees);
      setCarbonData(aggregateData);
      
      // Calculate total potential farmer earnings
      const totalTrees = farmers.reduce((sum, f) => sum + (f.totalTreesPlanted || 0), 0);
      const earnings = calculateFarmerCarbonEarnings(totalTrees);
      setTotalFarmerEarnings(earnings);
      
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [farmers]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

  if (!carbonData || carbonData.totalTrees === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <Leaf className="mx-auto text-gray-400 mb-3" size={48} />
        <h3 className="text-lg font-semibold text-gray-700">No Carbon Data Yet</h3>
        <p className="text-gray-500 mt-2">
          Start logging farmer activities (tree planting, organic farming) to generate carbon credits.
        </p>
      </div>
    );
  }

  const metrics = [
    {
      title: "Total Farmers",
      value: carbonData.totalFarmers,
      icon: Users,
      color: "bg-blue-500",
      suffix: ""
    },
    {
      title: "Trees Planted",
      value: carbonData.treesPlanted,
      icon: Tree,
      color: "bg-green-500",
      suffix: ""
    },
    {
      title: "Carbon Credits",
      value: carbonData.carbonCredits,
      icon: Leaf,
      color: "bg-emerald-500",
      suffix: " credits"
    },
    {
      title: "Market Value",
      value: `₦${Math.round(carbonData.valueNGN).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-yellow-500",
      suffix: ""
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-800 rounded-lg shadow-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield size={24} />
              <h2 className="text-2xl font-bold">Carbon Credit Dashboard</h2>
            </div>
            <p className="text-green-100 text-sm">
              Verified Carbon Standard (VCS) compliant • Real-time tracking
            </p>
          </div>
          <button
            onClick={onGenerateReport}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`${metric.color} p-2 rounded-lg`}>
                <metric.icon size={18} className="text-white" />
              </div>
              <TrendingUp size={16} className="text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
            <div className="text-sm text-gray-500 mt-1">{metric.title}</div>
          </div>
        ))}
      </div>

      {/* Environmental Impact */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-green-600" />
          Environmental Impact Equivalents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{carbonData.carbonEquivalent?.carsOffRoad || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Cars off the road per year</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{carbonData.carbonEquivalent?.homesEnergy || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Homes powered per year</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{carbonData.carbonEquivalent?.smartphonesCharged?.toLocaleString() || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Smartphones charged</div>
          </div>
        </div>
      </div>

      {/* Revenue Distribution */}
      {totalFarmerEarnings && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Farmer Share (80%)</span>
                <span className="font-semibold text-green-600">
                  ₦{Math.round(totalFarmerEarnings.farmerShareNGN).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>NGO/Cooperative Share (20%)</span>
                <span className="font-semibold text-blue-600">
                  ₦{Math.round(totalFarmerEarnings.ngoShareNGN).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Current Carbon Price</span>
              <span className="text-sm font-medium">${totalFarmerEarnings.pricePerCreditUSD} USD per credit</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-gray-500">Exchange Rate (USD/NGN)</span>
              <span className="text-sm font-medium">₦1,500 / $1 USD</span>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="text-xs text-gray-400 text-center">
        *Carbon credit calculations based on Verified Carbon Standard (VCS) methodology. 
        Actual value depends on market conditions and third-party verification.
      </div>
    </div>
  );
};

export default CarbonCreditDashboard;
