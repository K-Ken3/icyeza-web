import express from 'express';
import { getPartners } from '../controllers/partnerController.js';

const router = express.Router();

router.get('/', getPartners);

export default router;