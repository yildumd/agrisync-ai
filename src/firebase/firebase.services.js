import { db, auth } from './firebase.config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';

// AUTH SERVICES
export const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await addDoc(collection(db, 'users'), {
      uid: user.uid,
      email: email,
      ...userData,
      createdAt: Timestamp.now(),
      role: 'cooperative_staff'
    });
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// FARMER SERVICES
export const addFarmer = async (farmerData, userId) => {
  try {
    const docRef = await addDoc(collection(db, 'farmers'), {
      ...farmerData,
      userId: userId,
      createdAt: Timestamp.now(),
      totalCarbonScore: 0,
      lastActivityDate: null
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getFarmers = async (userId) => {
  try {
    const q = query(collection(db, 'farmers'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const farmers = [];
    querySnapshot.forEach((doc) => {
      farmers.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, farmers };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getFarmerById = async (farmerId) => {
  try {
    const docRef = doc(db, 'farmers', farmerId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, farmer: { id: docSnap.id, ...docSnap.data() } };
    }
    return { success: false, error: 'Farmer not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateFarmerCarbonScore = async (farmerId, newScore) => {
  try {
    const farmerRef = doc(db, 'farmers', farmerId);
    const farmerDoc = await getDoc(farmerRef);
    const currentScore = farmerDoc.data()?.totalCarbonScore || 0;
    await updateDoc(farmerRef, {
      totalCarbonScore: currentScore + newScore
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ACTIVITY SERVICES
export const addActivity = async (activityData, farmerId) => {
  try {
    const docRef = await addDoc(collection(db, 'activities'), {
      ...activityData,
      farmerId: farmerId,
      createdAt: Timestamp.now(),
      date: Timestamp.now()
    });
    
    const farmerRef = doc(db, 'farmers', farmerId);
    await updateDoc(farmerRef, {
      lastActivityDate: Timestamp.now()
    });
    
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getFarmerActivities = async (farmerId) => {
  try {
    const q = query(
      collection(db, 'activities'), 
      where('farmerId', '==', farmerId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const activities = [];
    querySnapshot.forEach((doc) => {
      activities.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, activities };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// MARKETPLACE SERVICES
export const addListing = async (listingData, userId, farmerId) => {
  try {
    const docRef = await addDoc(collection(db, 'marketplace_listings'), {
      ...listingData,
      userId: userId,
      farmerId: farmerId,
      createdAt: Timestamp.now(),
      status: 'active'
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getListings = async () => {
  try {
    const q = query(
      collection(db, 'marketplace_listings'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    const listings = [];
    for (const doc of querySnapshot.docs) {
      const listing = { id: doc.id, ...doc.data() };
      const farmerResult = await getFarmerById(listing.farmerId);
      if (farmerResult.success) {
        listing.farmer = farmerResult.farmer;
      }
      listings.push(listing);
    }
    return { success: true, listings };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// DASHBOARD STATS
export const getDashboardStats = async (userId) => {
  try {
    const farmersResult = await getFarmers(userId);
    const farmers = farmersResult.success ? farmersResult.farmers : [];
    
    let totalTrees = 0;
    let totalCarbonScore = 0;
    
    for (const farmer of farmers) {
      const activitiesResult = await getFarmerActivities(farmer.id);
      if (activitiesResult.success) {
        activitiesResult.activities.forEach(activity => {
          totalTrees += activity.treesPlanted || 0;
        });
      }
      totalCarbonScore += farmer.totalCarbonScore || 0;
    }
    
    const listingsResult = await getListings();
    const totalListings = listingsResult.success ? listingsResult.listings.length : 0;
    
    return {
      success: true,
      stats: {
        totalFarmers: farmers.length,
        totalTreesPlanted: totalTrees,
        averageCarbonScore: farmers.length > 0 ? (totalCarbonScore / farmers.length).toFixed(2) : 0,
        totalMarketplaceListings: totalListings
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};