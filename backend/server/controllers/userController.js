import User from '../models/User.js';

// Create or update user
export const createOrUpdateUser = async (req, res, next) => {
  try {
    const { id, googleId, email, name, picture, role } = req.body;

    if (!id || !googleId || !email || !role) {
      return res.status(400).json({ error: 'id, googleId, email, and role are required' });
    }

    // ✅ Find by googleId first
    let user = await User.findOne({ googleId });

    if (user) {
      // Update existing user
      user.email = email;
      user.name = name;
      user.picture = picture;
      user.role = role;
      await user.save();
      
      console.log('✅ User updated:', user.id);
      return res.json(user.toJSON());
    }

    // Create new user with custom id
    user = new User({
      id,  // ✅ Use the ID from frontend
      googleId,
      email,
      name,
      picture,
      role,
    });

    await user.save();
    
    console.log('✅ New user created:', user.id);
    res.status(201).json(user.toJSON());
  } catch (error) {
    console.error('❌ Error in createOrUpdateUser:', error);
    next(error);
  }
};

// Get user by email
export const getUserByEmail = async (req, res, next) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.toJSON());
  } catch (error) {
    next(error);
  }
};

// Get user by Google ID
export const getUserByGoogleId = async (req, res, next) => {
  try {
    const { googleId } = req.params;
    const user = await User.findOne({ googleId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ User found by googleId:', user.id);
    res.json(user.toJSON());
  } catch (error) {
    next(error);
  }
};

// Get all users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users.map(user => user.toJSON()));
  } catch (error) {
    next(error);
  }
};
