import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  ShoppingCart,
  UtensilsCrossed,
  Handshake,
  BadgePercent,
} from 'lucide-react';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import api from '../../services/api';
import { AdminProducts } from '../../components/admin/AdminProducts';
import { AdminKitchen } from '../../components/admin/AdminKitchen';
import { AdminPartners } from '../../components/admin/AdminPartners';
import { AdminDeals } from '../../components/admin/AdminDeals';

const statusBadge = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-purple-100 text-purple-700',
  ready: 'bg-teal-100 text-teal-700',
  out_for_delivery: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

const statusOptions = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

export const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [tab, setTab] = useState('orders');

  const tabs = [
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      count: orders.filter((o) =>
        ['pending', 'confirmed', 'preparing'].includes(o.orderStatus)
      ).length,
    },
    { id: 'products', label: 'Products', icon: Package, count: products.length },
    { id: 'deals', label: 'Deals & Promos', icon: BadgePercent },
    { id: 'kitchen', label: "Today's Kitchen", icon: UtensilsCrossed },
    { id: 'partners', label: 'Partners', icon: Handshake },
  ];

  const load = useCallback(async () => {
    try {
      const [orderRes, productRes] = await Promise.all([
        orderService.getOrders(),
        productService.getProducts({ limit: 100 }),
      ]);
      setOrders(orderRes.orders);
      setProducts(productRes.products);
    } catch (e) {
      console.error('Admin load failed', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
    } catch {
      console.error('Status update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt).toDateString() === new Date().toDateString()
  );
  const revenue = todayOrders
    .filter((o) => o.paymentStatus !== 'failed')
    .reduce((sum, o) => sum + o.total, 0);
  const pending = orders.filter((o) =>
    ['pending', 'confirmed', 'preparing'].includes(o.orderStatus)
  ).length;
  const completed = orders.filter((o) => o.orderStatus === 'delivered').length;

  const filtered = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
    const matchesSearch =
      !search || o._id.toLowerCase().includes(search.toLowerCase()) || o.customerInfo?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  const stats = [
    { label: "Today's Orders", value: todayOrders.length, icon: ShoppingCart, color: 'bg-primary/10 text-primary' },
    { label: "Today's Revenue", value: `${Math.round(revenue).toLocaleString('en-RW')} RWF`, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: 'Pending Orders', value: pending, icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'bg-blue-50 text-blue-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <img src="/logo.png" alt="Icyeza One Coffee Shop" className="rounded-xl object-contain" style={{ height: 40, filter: 'brightness(0.5) contrast(1.1) saturate(1.3)' }} />
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-heading">Admin Dashboard</h1>
          <p className="text-sm text-stone-500">Manage orders and menu</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <p className="text-xl font-bold text-stone-900 truncate">{stat.value}</p>
            <p className="text-sm text-stone-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1.5 overflow-x-auto mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.id
                ? 'bg-primary text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <t.icon size={16} />
            {t.label}
            {typeof t.count === 'number' && t.count > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  tab === t.id ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-stone-100">
          <h2 className="font-semibold text-stone-800 mb-3">Order Management</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-1.5 overflow-x-auto flex-1">
              {['all', ...statusOptions].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    statusFilter === s ? 'bg-primary text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {s === 'all' ? 'All' : s.replace('_', ' ')}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders or customer..."
              className="sm:w-64 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Search orders"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-stone-500 border-b border-stone-100">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-stone-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order._id} className="border-b border-stone-50 hover:bg-stone-50/50">
                    <td className="px-5 py-3">
                      <Link to={`/track-order/${order._id}`} className="font-semibold text-stone-800">
                        #{order._id.slice(-6).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-stone-600">{order.customerInfo?.name}</td>
                    <td className="px-5 py-3 text-stone-600">{order.items?.length}</td>
                    <td className="px-5 py-3 font-semibold text-stone-800">
                      {Math.round(order.total).toLocaleString('en-RW')} RWF
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        order.paymentStatus === 'successful'
                          ? 'bg-green-100 text-green-700'
                          : order.paymentStatus === 'failed'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`hidden xl:inline rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge[order.orderStatus]}`}>
                          {order.orderStatus.replace('_', ' ')}
                        </span>
                        <select
                          value={order.orderStatus}
                          disabled={updatingId === order._id}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="rounded-lg border border-stone-200 px-2 py-1.5 text-xs"
                          aria-label={`Update status for order ${order._id}`}
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>
                              {s.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {tab === 'products' && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <AdminProducts />
        </div>
      )}

      {tab === 'deals' && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <AdminDeals />
        </div>
      )}

      {tab === 'kitchen' && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <AdminKitchen />
        </div>
      )}

      {tab === 'partners' && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <AdminPartners />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;