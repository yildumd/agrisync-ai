// Carbon credit conversion rates based on verified standards
// Data source: World Bank Carbon Pricing Dashboard 2024-2025

const CARBON_RATES = {
  // Trees: average 22kg CO2 per tree per year (based on UNFCCC standards)
  CO2_PER_TREE_KG: 22,
  
  // 1 carbon credit = 1 metric ton (1000kg) of CO2
  KG_PER_CREDIT: 1000,
  
  // Current market price per credit (USD) - Verified Carbon Standard (VCS)
  // Range: $10-50, using conservative $15 for MVP
  PRICE_PER_CREDIT_USD: 15,
  
  // NGN to USD rate (current official rate)
  USD_TO_NGN: 1500
};

/**
 * Calculate carbon credits from tree planting
 * @param {number} treesPlanted - Number of trees planted
 * @returns {Object} Carbon credit calculations
 */
export const calculateCarbonCredits = (treesPlanted) => {
  // Calculate total CO2 captured in kg
  const totalCO2Kg = treesPlanted * CARBON_RATES.CO2_PER_TREE_KG;
  
  // Calculate carbon credits (1 credit = 1000kg CO2)
  const credits = totalCO2Kg / CARBON_RATES.KG_PER_CREDIT;
  
  // Calculate financial value
  const valueUSD = credits * CARBON_RATES.PRICE_PER_CREDIT_USD;
  const valueNGN = valueUSD * CARBON_RATES.USD_TO_NGN;
  
  return {
    treesPlanted: treesPlanted,
    totalCO2Kg: parseFloat(totalCO2Kg.toFixed(2)),
    carbonCredits: parseFloat(credits.toFixed(4)),
    valueUSD: parseFloat(valueUSD.toFixed(2)),
    valueNGN: parseFloat(valueNGN.toFixed(2)),
    pricePerCreditUSD: CARBON_RATES.PRICE_PER_CREDIT_USD
  };
};

/**
 * Calculate farmer's share of carbon earnings
 * Standard split: 80% farmer, 20% NGO/cooperative
 * @param {number} treesPlanted - Total trees planted by farmer
 * @returns {Object} Earnings breakdown
 */
export const calculateFarmerCarbonEarnings = (treesPlanted) => {
  const carbonData = calculateCarbonCredits(treesPlanted);
  
  // Standard revenue split (80/20)
  const FARMER_SHARE_PERCENT = 80;
  const NGO_SHARE_PERCENT = 20;
  
  const farmerShareUSD = carbonData.valueUSD * (FARMER_SHARE_PERCENT / 100);
  const ngoShareUSD = carbonData.valueUSD * (NGO_SHARE_PERCENT / 100);
  
  return {
    ...carbonData,
    farmerShareUSD: parseFloat(farmerShareUSD.toFixed(2)),
    farmerShareNGN: parseFloat((farmerShareUSD * CARBON_RATES.USD_TO_NGN).toFixed(2)),
    ngoShareUSD: parseFloat(ngoShareUSD.toFixed(2)),
    ngoShareNGN: parseFloat((ngoShareUSD * CARBON_RATES.USD_TO_NGN).toFixed(2)),
    farmerPercent: FARMER_SHARE_PERCENT,
    ngoPercent: NGO_SHARE_PERCENT
  };
};

/**
 * Calculate total carbon impact for multiple farmers
 * @param {Array} farmers - Array of farmer objects with totalTreesPlanted
 * @returns {Object} Aggregated carbon data
 */
export const calculateAggregateCarbonCredits = (farmers) => {
  const totalTrees = farmers.reduce((sum, farmer) => sum + (farmer.totalTreesPlanted || 0), 0);
  const totalFarmers = farmers.length;
  
  const carbonData = calculateCarbonCredits(totalTrees);
  
  // Calculate average per farmer
  const avgPerFarmer = {
    trees: totalTrees / totalFarmers,
    credits: carbonData.carbonCredits / totalFarmers,
    valueUSD: carbonData.valueUSD / totalFarmers,
    valueNGN: carbonData.valueNGN / totalFarmers
  };
  
  return {
    ...carbonData,
    totalFarmers,
    averagePerFarmer: avgPerFarmer,
    // Additional impact metrics for reporting
    carbonEquivalent: {
      carsOffRoad: Math.round(totalTrees * 0.022), // Each tree = 0.022 cars off road per year
      homesEnergy: Math.round(totalTrees * 0.015), // Each tree = 0.015 homes energy
      smartphonesCharged: Math.round(totalTrees * 152) // Each tree = 152 smartphone charges
    }
  };
};

/**
 * Generate a readable carbon summary for farmers (localized)
 * @param {Object} earnings - Output from calculateFarmerCarbonEarnings
 * @returns {string} Human-readable summary
 */
export const getCarbonSummaryText = (earnings) => {
  return `🌳 ${earnings.treesPlanted} trees planted • Captured ${earnings.totalCO2Kg} kg CO₂ • Earned ${earnings.carbonCredits} carbon credits • Worth ₦${earnings.farmerShareNGN.toLocaleString()} (80% farmer share)`;
};

/**
 * Get carbon rating based on trees planted
 * @param {number} treesPlanted - Number of trees planted
 * @returns {Object} Rating, color, and recommendation
 */
export const getCarbonRatingByTrees = (treesPlanted) => {
  if (treesPlanted >= 100) {
    return { level: 'Gold', color: 'bg-yellow-500', text: 'Excellent! Ready for premium carbon markets', icon: '🏆' };
  } else if (treesPlanted >= 50) {
    return { level: 'Silver', color: 'bg-gray-400', text: 'Good progress! Plant 50 more trees for Gold status', icon: '🥈' };
  } else if (treesPlanted >= 25) {
    return { level: 'Bronze', color: 'bg-orange-600', text: 'On track! Keep planting trees', icon: '🥉' };
  } else {
    return { level: 'Starting', color: 'bg-green-200', text: 'Every tree counts! Plant 25 trees for Bronze status', icon: '🌱' };
  }
};

export default {
  calculateCarbonCredits,
  calculateFarmerCarbonEarnings,
  calculateAggregateCarbonCredits,
  getCarbonSummaryText,
  getCarbonRatingByTrees,
  CARBON_RATES
};
