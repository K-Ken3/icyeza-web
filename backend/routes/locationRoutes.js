import express from 'express';
import { getLocations, createLocation } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getLocations).post(protect, authorize('admin'), createLocation);

export default router;
