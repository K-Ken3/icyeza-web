import express from 'express';
import { getSetting, getAllSettings } from '../controllers/settingController.js';

const router = express.Router();

router.get('/', getAllSettings);
router.get('/:key', getSetting);

export default router;