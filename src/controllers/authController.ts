import { Request, Response } from 'express';
import User from '../models/User';
import generateToken from '../utils/generateToken';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const phone = (req.body.phone || '').toString().trim();
  const password = (req.body.password || '').toString().trim();

  try {
    const user = await User.findOne({ phone });

    if (!user) {
      console.warn(`[AUTH] Login failed: User not found for phone "${phone}"`);
      res.status(401).json({ message: 'Invalid phone number or password' });
      return;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.warn(`[AUTH] Login failed: Invalid password for phone "${phone}"`);
      res.status(401).json({ message: 'Invalid phone number or password' });
      return;
    }

    console.log(`[AUTH] User "${user.name}" (${user.role}) logged in successfully.`);
    res.json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      token: generateToken((user._id as any).toString()),
    });
  } catch (error) {
    console.error('[AUTH] Error in loginUser:', error);
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { name, phone, password, role } = req.body;

  try {
    const userExists = await User.findOne({ phone });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = await User.create({
      name,
      phone,
      password,
      role,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        token: generateToken((user._id as any).toString()),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/profile or /api/auth/me
// @access  Private
export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({
      _id: req.user._id,
      name: req.user.name,
      phone: req.user.phone,
      role: req.user.role,
      pushToken: req.user.pushToken,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Save or update user's Expo push token
// @route   POST /api/auth/push-token
// @access  Private
export const updatePushToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pushToken } = req.body;
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.pushToken = pushToken || '';
    await user.save();

    console.log(`[AUTH] Push token registered for user "${user.name}" (${user.role}): ${pushToken}`);
    res.json({ message: 'Push token registered successfully', pushToken: user.pushToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error saving push token', error });
  }
};

