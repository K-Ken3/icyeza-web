import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Heart, Timer, TrendingUp } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { userService } from '../../services/userService';
import { DashboardSkeleton } from '../../components/Skeleton';
import { ErrorState } from '../../components/EmptyState';
import { formatRWF, formatDate } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';

const statusBadge = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-purple-100 text-purple-700',
  ready: 'bg-teal-100 text-teal-700',
  out_for_delivery: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

export const AccountDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const [orderRes, favRes] = await Promise.all([
          orderService.getOrders(),
          userService.getFavorites(),
        ]);
        setOrders(orderRes.orders);
        setFavorites(favRes.favorites || []);
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

  const activeOrder = orders.find((o) =>
    ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.orderStatus)
  );
  const totalSpent = orders
    .filter((o) => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: Package, color: 'bg-primary/10 text-primary' },
    { label: 'Active Order', value: activeOrder ? '1' : '0', icon: Timer, color: 'bg-amber-50 text-amber-600' },
    { label: 'Favorite Meals', value: favorites.length, icon: Heart, color: 'bg-red-50 text-red-500' },
    { label: 'Total Spent', value: formatRWF(totalSpent), icon: TrendingUp, color: 'bg-green-50 text-green-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-stone-800">Welcome back, {user?.name.split(' ')[0]}!</h2>
        <p className="text-sm text-stone-500">Here's an overview of your account.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
            <p className="text-sm text-stone-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {activeOrder && (
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm text-primary font-semibold flex items-center gap-1.5">
                <Timer size={15} /> Active Order
              </p>
              <p className="font-semibold text-stone-900 mt-1">
                #{activeOrder._id.slice(-6).toUpperCase()} · {formatDate(activeOrder.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge[activeOrder.orderStatus]}`}>
                {activeOrder.orderStatus.replace('_', ' ')}
              </span>
              <Link
                to={`/track-order/${activeOrder._id}`}
                className="text-sm text-primary font-semibold hover:underline"
              >
                Track Order
              </Link>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-stone-800">Recent Orders</h3>
          {orders.length > 0 && (
            <Link to="/account/orders" className="text-sm text-primary font-semibold hover:underline">
              View all
            </Link>
          )}
        </div>
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center">
            <p className="text-stone-500 mb-3">You haven't placed any orders yet.</p>
            <Link
              to="/menu"
              className="inline-flex rounded-full bg-primary text-white px-6 py-2.5 text-sm font-semibold hover:bg-primary-dark"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            {orders.slice(0, 4).map((order) => (
              <Link
                key={order._id}
                to={`/account/orders/${order._id}`}
                className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0"
              >
                <div>
                  <p className="font-semibold text-stone-800">#{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-stone-500">{formatDate(order.createdAt)} · {order.items?.length} items</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-stone-900">{formatRWF(order.total)}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge[order.orderStatus] || 'bg-stone-100 text-stone-600'}`}>
                    {order.orderStatus.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountDashboard;