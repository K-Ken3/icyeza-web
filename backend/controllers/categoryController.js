import Category from '../models/Category.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ active: true }).sort({ sortOrder: 1 });
  res.json({ success: true, categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, category });
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) return next(new Error('Category not found'));
  res.json({ success: true, category });
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return next(new Error('Category not found'));
  res.json({ success: true, message: 'Category deleted' });
});
