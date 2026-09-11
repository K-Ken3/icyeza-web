import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Package, ChefHat, CheckCircle, Flame, Bike, PackageCheck } from 'lucide-react';
import { orderService } from '../services/orderService';
import { formatRWF, formatTime } from '../utils/format';
import { Skeleton } from '../components/Skeleton';

const stages = [
  { key: 'pending', label: 'Order Received', icon: Package, detail: 'We\'ve received your order' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, detail: 'Your order is confirmed' },
  { key: 'preparing', label: 'Preparing', icon: ChefHat, detail: 'Our chefs are cooking fresh' },
  { key: 'ready', label: 'Ready', icon: PackageCheck, detail: 'Your order is packed and ready' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Bike, detail: 'Rider is on the way' },
  { key: 'delivered', label: 'Delivered', icon: Flame, detail: 'Enjoy your meal!' },
];

const orderStatusIndex = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  ready: 3,
  out_for_delivery: 4,
  delivered: 5,
};

export const TrackOrder = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await orderService.getOrder(id);
        setOrder(res.order);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Skeleton className="h-8 w-1/2 mb-8" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Order not found</h1>
        <p className="text-stone-500 mb-4">{error}</p>
        <Link to="/account/orders" className="text-primary font-semibold">View My Orders</Link>
      </div>
    );
  }

  const currentIndex = orderStatusIndex[order.orderStatus] ?? 0;
  const cancelled = order.orderStatus === 'cancelled';

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-heading">
            Track Your Order
          </h1>
          <p className="text-stone-500 mt-1">
            Order #{order._id.slice(-6).toUpperCase()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-stone-500 flex items-center gap-1.5 justify-end">
            <Clock size={14} /> Estimated
          </p>
          <p className="font-semibold text-stone-800">
            {order.estimatedDelivery ? formatTime(order.estimatedDelivery) : '~30-60 min'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
        {cancelled ? (
          <div className="text-center py-12">
            <div className="inline-flex h-16 w-16 rounded-full bg-red-100 items-center justify-center mb-4">
              <Package className="text-red-500" size={30} />
            </div>
            <h2 className="text-xl font-semibold text-stone-800 mb-2">Order Cancelled</h2>
            <p className="text-stone-500">This order was cancelled.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-stone-100" />
            <div className="space-y-0.5">
              {stages.map((stage, i) => {
                const reached = i <= currentIndex;
                const isCurrent = i === currentIndex;
                return (
                  <motion.div
                    key={stage.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative flex gap-4 py-4"
                  >
                    <div
                      className={`relative z-10 h-10 w-10 flex items-center justify-center rounded-full border-2 ${
                        reached
                          ? 'bg-primary border-primary text-white'
                          : 'bg-white border-stone-200 text-stone-300'
                      }`}
                    >
                      <stage.icon size={18} />
                    </div>
                    <div className="pt-1.5">
                      <p className={`font-semibold ${reached ? 'text-stone-900' : 'text-stone-400'}`}>
                        {stage.label}
                        {isCurrent && (
                          <span className="ml-2 inline-flex rounded-full bg-primary/10 text-primary text-[10px] px-2 py-0.5 font-bold">
                            Current
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-stone-500">{stage.detail}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <h3 className="font-semibold text-stone-800 mb-3">Order Summary</h3>
          <div className="space-y-1.5 text-sm">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-stone-600">
                <span>{item.quantity} × {item.name}</span>
                <span className="font-medium">{formatRWF(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-stone-100 pt-2 flex justify-between font-bold text-stone-900">
              <span>Total</span>
              <span>{formatRWF(order.total)}</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <h3 className="font-semibold text-stone-800 mb-3">Details</h3>
          <div className="space-y-2 text-sm text-stone-600">
            <p><strong className="text-stone-800">Method:</strong> <span className="capitalize">{order.deliveryMethod}</span></p>
            <p><strong className="text-stone-800">Payment:</strong> <span className="capitalize">{order.paymentMethod.replace('_', ' ')}</span></p>
            <p><strong className="text-stone-800">Status:</strong> <span className="capitalize">{order.orderStatus.replace('_', ' ')}</span></p>
            {order.address?.street && (
              <p><strong className="text-stone-800">Address:</strong> {order.address.street}, {order.address.landmark || ''}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Link
          to="/menu"
          className="flex-1 inline-flex items-center justify-center rounded-full bg-primary text-white py-3 text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          Order Again
        </Link>
        <Link
          to="/account/orders"
          className="flex-1 inline-flex items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 py-3 text-sm font-semibold hover:bg-stone-50 transition-colors"
        >
          View All Orders
        </Link>
      </div>
    </div>
  );
};

export default TrackOrder;
