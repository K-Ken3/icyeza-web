import Order from '../models/Order.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import crypto from 'crypto';

const DELIVERY_FEE = 1500;

export const createOrder = asyncHandler(async (req, res) => {
  const {
    items,
    customerInfo,
    deliveryMethod,
    address,
    paymentMethod,
    subtotal,
    discount,
  } = req.body;

  if (!items || items.length === 0) {
    throw new AppError('Order must contain at least one item', 400);
  }
  if (!customerInfo || !customerInfo.name || !customerInfo.phone) {
    throw new AppError('Customer name and phone are required', 400);
  }
  if (!paymentMethod) {
    throw new AppError('Payment method is required', 400);
  }

  const deliveryFee = deliveryMethod === 'delivery' ? DELIVERY_FEE : 0;
  const total = subtotal - (discount || 0) + deliveryFee;

  const estimatedDelivery = new Date(
    Date.now() + (deliveryMethod === 'delivery' ? 60 : 30) * 60 * 1000
  );

  const trackingToken = !req.user ? crypto.randomBytes(12).toString('hex') : undefined;

  const order = await Order.create({
    user: req.user?._id,
    trackingToken,
    items,
    subtotal,
    deliveryFee,
    discount: discount || 0,
    total,
    deliveryMethod,
    address: deliveryMethod === 'delivery' ? address : undefined,
    customerInfo,
    paymentMethod,
    estimatedDelivery,
  });

  res.status(201).json({
    success: true,
    order,
    trackingToken,
    message: 'Order placed.',
  });
});

export const updatePaymentInfo = asyncHandler(async (req, res) => {
  const { paidBy } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const isOwner = order.user && req.user && order.user.toString() === req.user._id.toString();
  const isGuest =
    !order.user &&
    order.trackingToken &&
    order.trackingToken === req.header('x-order-token');
  if (!isOwner && !isGuest) {
    throw new AppError('Not authorized to update this order', 403);
  }

  if (typeof paidBy !== 'string' || !paidBy.trim()) {
    throw new AppError('Payer name is required', 400);
  }

  order.paidBy = paidBy.trim();
  await order.save();
  res.json({ success: true, order });
});

export const getGuestOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  if (order.user) {
    throw new AppError('Not authorized', 403);
  }
  if (!order.trackingToken || order.trackingToken !== req.header('x-order-token')) {
    throw new AppError('Invalid tracking token', 403);
  }
  res.json({ success: true, order });
});

export const getOrders = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const filter = isAdmin ? {} : { user: req.user._id };
  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

export const getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to view this order', 403);
  }
  res.json({ success: true, order });
});

export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { orderStatus } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  order.orderStatus = orderStatus;
  await order.save();
  res.json({ success: true, order });
});
