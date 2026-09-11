import express from 'express';
import { getTodaysMeal } from '../controllers/dailyMealController.js';

const router = express.Router();

router.get('/today', getTodaysMeal);

export default router;