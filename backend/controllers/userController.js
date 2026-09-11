import User from '../models/User.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, email, address } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (email) {
    const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
    if (existing) throw new AppError('Email already in use', 400);
    user.email = email.toLowerCase();
  }
  if (address) user.address = address;

  await user.save();
  res.json({ success: true, user });
});

export const getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('favorites');
  res.json({ success: true, favorites: user.favorites });
});

export const addFavorite = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);
  if (!user.favorites.includes(productId)) {
    user.favorites.push(productId);
    await user.save();
  }
  res.json({ success: true, favorites: user.favorites });
});

export const removeFavorite = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user._id);
  user.favorites = user.favorites.filter((id) => id.toString() !== productId);
  await user.save();
  res.json({ success: true, favorites: user.favorites });
});
