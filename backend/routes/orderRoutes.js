import express from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  getGuestOrder,
  updateOrderStatus,
  updatePaymentInfo,
} from '../controllers/orderController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.route('/').post(optionalAuth, createOrder).get(protect, getOrders);
router.get('/track/:id', getGuestOrder);
router.put('/:id/payment-info', optionalAuth, updatePaymentInfo);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

export default router;
