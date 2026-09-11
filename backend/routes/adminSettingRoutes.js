import express from 'express';
import { updateSetting } from '../controllers/settingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.put('/:key', protect, authorize('admin'), updateSetting);

export default router;