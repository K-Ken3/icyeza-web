import Order from '../models/Order.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { paymentService } from '../services/paymentService.js';

export const createPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) {
    throw new AppError('Order id is required', 400);
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (!['mobile_money', 'card'].includes(order.paymentMethod)) {
    return res.json({
      success: true,
      message: 'Cash payment selected. No provider payment needed.',
      paymentStatus: order.paymentStatus,
      order,
    });
  }

  const paymentResult = await paymentService.createPayment({
    amount: order.total,
    currency: 'RWF',
    email: order.customerInfo?.email || 'hello@flameandfork.rw',
    phone: order.customerInfo?.phone || '+250700000000',
    paymentType: order.paymentMethod,
    orderId: order._id,
  });

  const providerStatus = paymentResult?.data?.status || 'pending';
  const nextStatus =
    providerStatus === 'successful'
      ? 'successful'
      : providerStatus === 'failed'
        ? 'failed'
        : 'pending';

  order.paymentStatus = nextStatus;
  order.paymentRef = paymentResult?.data?.reference || order.paymentRef;
  await order.save();

  res.json({
    success: true,
    message: 'Payment initiated',
    paymentStatus: order.paymentStatus,
    payment: paymentResult,
    order,
  });
});

export const paymentWebhook = asyncHandler(async (req, res) => {
  const { tx_ref, status } = req.body || {};
  const orderId = tx_ref ? tx_ref.replace('FF-', '').split('-')[0] : null;

  if (orderId) {
    const order = await Order.findById(orderId);
    if (order) {
      order.paymentStatus = status === 'successful' ? 'successful' : 'failed';
      await order.save();
    }
  }

  res.json({ success: true, received: true });
});
