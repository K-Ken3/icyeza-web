import express from 'express';
import { createPayment, paymentWebhook } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', protect, createPayment);
router.post('/webhook', paymentWebhook);

export default router;
