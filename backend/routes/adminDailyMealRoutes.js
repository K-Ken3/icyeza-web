import express from 'express';
import { listMeals, upsertMeal, deleteMeal } from '../controllers/dailyMealController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.route('/').get(listMeals).post(upsertMeal);
router.route('/:id').delete(deleteMeal);

export default router;