import Partner from '../models/Partner.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

export const getPartners = asyncHandler(async (req, res) => {
  const query = req.user && req.user.role === 'admin' ? {} : { active: true };
  const partners = await Partner.find(query).sort({ sortOrder: 1, createdAt: -1 });
  res.json({ success: true, partners });
});

export const getAllPartners = asyncHandler(async (req, res) => {
  const partners = await Partner.find().sort({ sortOrder: 1, createdAt: -1 });
  res.json({ success: true, partners });
});

export const createPartner = asyncHandler(async (req, res) => {
  const partner = await Partner.create(req.body);
  res.status(201).json({ success: true, partner });
});

export const updatePartner = asyncHandler(async (req, res, next) => {
  const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!partner) {
    throw new AppError('Partner not found', 404);
  }
  res.json({ success: true, partner });
});

export const deletePartner = asyncHandler(async (req, res, next) => {
  const partner = await Partner.findByIdAndDelete(req.params.id);
  if (!partner) {
    throw new AppError('Partner not found', 404);
  }
  res.json({ success: true, message: 'Partner deleted' });
});