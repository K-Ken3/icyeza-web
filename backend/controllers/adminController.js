import Location from '../models/Location.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

export const getLocations = asyncHandler(async (req, res) => {
  const locations = await Location.find();
  res.json({ success: true, locations });
});

export const createLocation = asyncHandler(async (req, res) => {
  const location = await Location.create(req.body);
  res.status(201).json({ success: true, location });
});

export const getAdminStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [ordersToday, revenueToday, pendingOrders, completedOrders, popularProducts] =
    await Promise.all([
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: today }, paymentStatus: { $ne: 'failed' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.countDocuments({ orderStatus: { $in: ['pending', 'confirmed', 'preparing'] } }),
      Order.countDocuments({ orderStatus: 'delivered' }),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.name', count: { $sum: '$items.quantity' } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

  res.json({
    success: true,
    stats: {
      ordersToday,
      revenueToday: revenueToday[0]?.total || 0,
      pendingOrders,
      completedOrders,
      popularProducts,
      totalProducts: await Product.countDocuments(),
      totalCustomers: await User.countDocuments(),
      totalOrders: await Order.countDocuments(),
    },
  });
});
