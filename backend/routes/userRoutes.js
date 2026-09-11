import express from 'express';
import {
  getProfile,
  updateProfile,
  getFavorites,
  addFavorite,
  removeFavorite,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.route('/profile').get(getProfile).put(updateProfile);
router.get('/favorites', getFavorites);
router.post('/favorites', addFavorite);
router.delete('/favorites/:productId', removeFavorite);

export default router;
