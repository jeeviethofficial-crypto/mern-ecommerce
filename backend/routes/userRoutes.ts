import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password, profileImage } = req.body;

    if (!name || !username || !email || !password) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const userExists = await User.findOne({ email }).exec();
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const usernameExists = await User.findOne({ username }).exec();
    if (usernameExists) {
      res.status(400).json({ message: 'Username already taken' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      profileImage: profileImage || '',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      token: generateToken(user._id.toString()),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).exec();

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById((req as any).userId).select('-password').exec();
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update user profile (name, username, email, profileImage)
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, username, email, profileImage } = req.body;

    const user = await User.findById((req as any).userId).exec();
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const update: Record<string, any> = {};

    if (email && email !== user.email) {
      const emailTaken = await User.findOne({ email }).exec();
      if (emailTaken) {
        res.status(400).json({ message: 'Email already in use' });
        return;
      }
      update.email = email;
    }

    if (username && username !== user.username) {
      const usernameTaken = await User.findOne({ username }).exec();
      if (usernameTaken) {
        res.status(400).json({ message: 'Username already taken' });
        return;
      }
      update.username = username;
    }

    if (name) {
      update.name = name;
    }

    if (profileImage !== undefined) {
      update.profileImage = profileImage;
    }

    const updatedUser = await User.findByIdAndUpdate(
      (req as any).userId,
      { $set: update },
      { new: true }
    ).exec();

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Change user password
// @route   PUT /api/users/password
// @access  Private
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Current password and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters' });
      return;
    }

    const user = await User.findById((req as any).userId).exec();
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Current password is incorrect' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
