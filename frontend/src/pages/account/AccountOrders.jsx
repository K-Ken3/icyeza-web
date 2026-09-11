import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, RefreshCcw, ArrowRight } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { useCart } from '../../context/CartContext';
import { DashboardSkeleton } from '../../components/Skeleton';
import { ErrorState } from '../../components/EmptyState';
import { formatRWF, formatDate } from '../../utils/format';

const statusBadge = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-purple-100 text-purple-700',
  ready: 'bg-teal-100 text-teal-700',
  out_for_delivery: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

const statusOrder = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

export const AccountOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const { addToCart } = useCart();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await orderService.getOrders();
        setOrders(res.orders);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState onRetry={() => window.location.reload()} />;

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.orderStatus === filter);
  const sorted = [...filtered].sort((a, b) => statusOrder.indexOf(a.orderStatus) - statusOrder.indexOf(b.orderStatus));

  const handleReorder = (order) => {
    order.items.forEach((item) => {
      addToCart({
        id: item.product?._id || item.product,
        name: item.name,
        image: item.image,
        price: item.price - (item.previewPrice || 0),
        options: item.options || [],
        quantity: item.quantity,
        addOnCurrentPrice: 0,
      });
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-stone-800">Order History</h2>
        <div className="flex gap-1.5 overflow-x-auto">
          {['all', 'pending', 'delivered', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === f ? 'bg-primary text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
          <div className="inline-flex h-14 w-14 rounded-full bg-stone-100 items-center justify-center mb-3">
            <Package className="text-stone-400" size={26} />
          </div>
          <h3 className="font-semibold text-stone-800 mb-1">No orders found</h3>
          <p className="text-sm text-stone-500 mb-4">Start your first order and it'll show up here.</p>
          <Link
            to="/menu"
            className="inline-flex rounded-full bg-primary text-white px-6 py-2.5 text-sm font-semibold hover:bg-primary-dark"
          >
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl border border-stone-100 p-5">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                <div>
                  <Link to={`/account/orders/${order._id}`} className="font-semibold text-stone-900 hover:text-primary">
                    #{order._id.slice(-6).toUpperCase()}
                  </Link>
                  <p className="text-sm text-stone-500">{formatDate(order.createdAt)} · {order.items?.length || 0} items</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge[order.orderStatus] || 'bg-stone-100 text-stone-600'}`}>
                    {order.orderStatus.replace('_', ' ')}
                  </span>
                  <span className="font-bold text-stone-900">{formatRWF(order.total)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-4">
                <span className="capitalize">{order.deliveryMethod}</span>
                <span>·</span>
                <span className="capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                <span>·</span>
                <span className={`${order.paymentStatus === 'successful' ? 'text-green-600' : 'text-amber-600'} capitalize`}>
                  Payment: {order.paymentStatus}
                </span>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/account/orders/${order._id}`}
                  className="flex items-center gap-1.5 rounded-full bg-stone-100 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-200"
                >
                  View Order <ArrowRight size={13} />
                </Link>
                {order.orderStatus !== 'cancelled' && (
                  <button
                    onClick={() => handleReorder(order)}
                    className="flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-4 py-2 text-xs font-semibold hover:bg-primary/15"
                  >
                    <RefreshCcw size={13} /> Reorder
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountOrders;