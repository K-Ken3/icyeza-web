import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { Skeleton } from '../../components/Skeleton';
import { formatRWF, formatDate } from '../../utils/format';

const paymentLabels = {
  mobile_money: 'Mobile Money',
  card: 'Visa / Mastercard',
  cash_delivery: 'Cash on Delivery',
  cash_pickup: 'Cash on Pickup',
};

export const AccountOrderDetails = () => {
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
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold text-stone-800">Order not found</h2>
        <Link to="/account/orders" className="text-primary text-sm font-semibold inline-flex items-center gap-1 mt-2">
          <ArrowLeft size={14} /> Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/account/orders" className="text-stone-500 hover:text-stone-800 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="text-lg font-semibold text-stone-800">
            Order #{order._id.slice(-6).toUpperCase()}
          </h2>
          <p className="text-sm text-stone-500">Placed on {formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 p-6 mb-4">
        <div className="flex flex-wrap gap-3 mb-5">
          <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold capitalize">
            {order.orderStatus.replace('_', ' ')}
          </span>
          <span className="rounded-full bg-stone-100 text-stone-600 px-3 py-1 text-xs font-semibold capitalize">
            Payment: {order.paymentStatus}
          </span>
          <span className="rounded-full bg-stone-100 text-stone-600 px-3 py-1 text-xs font-semibold capitalize">
            {order.deliveryMethod}
          </span>
        </div>

        <div className="space-y-3 mb-5">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.image && (
                <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover" />
              )}
              <div className="flex-1">
                <p className="font-medium text-stone-800">{item.name}</p>
                {item.options?.length > 0 && (
                  <p className="text-xs text-stone-500">
                    {item.options.map((o) => o.label).join(', ')}
                  </p>
                )}
                <p className="text-xs text-stone-400">Qty: {item.quantity}</p>
              </div>
              <span className="font-semibold text-stone-800">{formatRWF(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-stone-100 pt-4 space-y-2">
          <div className="flex justify-between text-sm text-stone-600">
            <span>Subtotal</span>
            <span>{formatRWF(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-stone-600">
            <span>Delivery Fee</span>
            <span>{formatRWF(order.deliveryFee)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-{formatRWF(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-stone-900 pt-2 border-t border-stone-100">
            <span>Total</span>
            <span>{formatRWF(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 p-6">
        <h3 className="font-semibold text-stone-800 mb-3">Order Details</h3>
        <div className="space-y-2 text-sm text-stone-600">
          <p>
            <strong className="text-stone-800">Name:</strong> {order.customerInfo?.name}
          </p>
          <p>
            <strong className="text-stone-800">Phone:</strong> {order.customerInfo?.phone}
          </p>
          {order.customerInfo?.email && (
            <p>
              <strong className="text-stone-800">Email:</strong> {order.customerInfo.email}
            </p>
          )}
          <p>
            <strong className="text-stone-800">Payment:</strong> {paymentLabels[order.paymentMethod] || order.paymentMethod}
          </p>
          {order.address && (
            <p>
              <strong className="text-stone-800">Address:</strong>{' '}
              {[order.address.street, order.address.sector, order.address.district, order.address.province, order.address.landmark]
                .filter(Boolean)
                .join(', ')}
            </p>
          )}
          {order.notes && (
            <p>
              <strong className="text-stone-800">Notes:</strong> {order.notes}
            </p>
          )}
        </div>
      </div>

      <Link
        to={`/track-order/${order._id}`}
        className="mt-4 inline-flex items-center justify-center w-full rounded-full bg-primary text-white py-3 text-sm font-semibold hover:bg-primary-dark"
      >
        Track This Order
      </Link>
    </div>
  );
};

export default AccountOrderDetails;