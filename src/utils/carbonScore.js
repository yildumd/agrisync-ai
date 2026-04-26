export const calculateActivityScore = (activity) => {
  let score = 0;
  
  if (activity.treesPlanted && activity.treesPlanted > 0) {
    score += activity.treesPlanted * 10;
  }
  
  if (activity.fertilizerType === 'organic') {
    score += 20;
  } else if (activity.fertilizerType === 'chemical') {
    score += 5;
  }
  
  if (activity.bushBurning === 'yes') {
    score -= 30;
  }
  
  if (activity.farmingPractice === 'conservation_agriculture') {
    score += 15;
  } else if (activity.farmingPractice === 'agroforestry') {
    score += 25;
  } else if (activity.farmingPractice === 'crop_rotation') {
    score += 10;
  }
  
  return score;
};

export const getCarbonRating = (score) => {
  if (score >= 100) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
  if (score >= 50) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
  if (score >= 0) return { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
  return { label: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-100' };
};