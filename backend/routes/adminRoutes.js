import express from 'express';
import multer from 'multer';
import { getAdminStats } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadImage } from '../services/uploadService.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new AppError('Only image files are allowed', 400));
  },
});

router.post(
  '/upload',
  protect,
  authorize('admin'),
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError('No image file provided', 400);
    }
    const domain = `${req.protocol}://${req.get('host')}`;
    const url = await uploadImage(req.file, 'flame-fork', domain);
    res.status(201).json({ success: true, url });
  })
);

router.get('/stats', protect, authorize('admin'), getAdminStats);

export default router;