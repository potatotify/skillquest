import Profile from '../models/Profile.js';

// Create or update profile
export const createOrUpdateProfile = async (req, res, next) => {
  try {
    const profileData = req.body;

    if (!profileData.userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Use findOneAndUpdate with upsert
    const profile = await Profile.findOneAndUpdate(
      { userId: profileData.userId },
      profileData,
      { 
        new: true,
        upsert: true,
        runValidators: true 
      }
    );
    
    // ✅ Transform _id to id
    const profileObject = profile.toObject();
    profileObject.id = profileObject._id.toString();
    delete profileObject._id;
    delete profileObject.__v;
    
    console.log('✅ Profile saved:', profileObject.userId);
    res.status(200).json(profileObject);
  } catch (error) {
    console.error('❌ Error in createOrUpdateProfile:', error);
    next(error);
  }
};

// Get profile by userId
export const getProfileByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // ✅ Transform _id to id
    const profileObject = profile.toObject();
    profileObject.id = profileObject._id.toString();
    delete profileObject._id;
    delete profileObject.__v;

    res.json(profileObject);
  } catch (error) {
    next(error);
  }
};

// Get all profiles
export const getAllProfiles = async (req, res, next) => {
  try {
    const profiles = await Profile.find();
    
    const transformedProfiles = profiles.map(profile => {
      const profileObject = profile.toObject();
      profileObject.id = profileObject._id.toString();
      delete profileObject._id;
      delete profileObject.__v;
      return profileObject;
    });
    
    res.json(transformedProfiles);
  } catch (error) {
    next(error);
  }
};
