import Setting from '../models/Setting.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

export const getSetting = asyncHandler(async (req, res) => {
  const setting = await Setting.findOne({ key: req.params.key });
  res.json({ success: true, setting: setting ? setting.value : null });
});

export const updateSetting = asyncHandler(async (req, res, next) => {
  const { key } = req.params;
  if (!key) {
    throw new AppError('Setting key is required', 400);
  }
  const setting = await Setting.findOneAndUpdate(
    { key },
    { key, value: req.body.value },
    { new: true, upsert: true, runValidators: true }
  );
  res.json({ success: true, setting: setting.value });
});

export const getAllSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.find();
  const map = {};
  settings.forEach((s) => {
    map[s.key] = s.value;
  });
  res.json({ success: true, settings: map });
});