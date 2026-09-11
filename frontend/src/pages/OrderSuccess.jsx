import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, MapPin, Smartphone, Loader2, Phone } from 'lucide-react';
import { orderService } from '../services/orderService';
import { formatRWF, formatTime } from '../utils/format';
import { useToast } from '../context/ToastContext';

const paymentLabels = {
  mobile_money: 'Mobile Money',
  card: 'Visa / Mastercard',
  cash_delivery: 'Cash on Delivery',
  cash_pickup: 'Cash on Pickup',
};

const USSD_PREFIX = '*182*8*1*1540166*';

export const OrderSuccess = () => {
  const { id } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [payerName, setPayerName] = useState('');
  const [saving, setSaving] = useState(false);
  const dialerOpenedRef = useRef(false);

  useEffect(() => {
    if (order?.paymentMethod === 'mobile_money' && !dialerOpenedRef.current) {
      dialerOpenedRef.current = true;
      const ussd = `${USSD_PREFIX}${Math.round(order.total)}#`;
      window.location.assign(`tel:${ussd}`);
    }
  }, [order]);

  useEffect(() => {
    if (!order) {
      orderService
        .getOrder(id)
        .then((res) => {
          setOrder(res.order);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id, order]);

  const ussd = `${USSD_PREFIX}${Math.round(order?.total || 0)}#`;
  const needsPayment = order?.paymentMethod === 'mobile_money' && !order.paidBy;

  const handleSavePaidBy = async () => {
    if (!payerName.trim()) {
      toast('Please enter the full name of the person who paid', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await orderService.updatePaymentInfo(id, { paidBy: payerName.trim() });
      setOrder(res.order);
      toast('Payment details saved', 'success');
    } catch (e) {
      toast(e?.response?.data?.message || 'Could not save payment details', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="skeleton h-8 w-2/3 mx-auto mb-4" />
        <div className="skeleton h-4 w-1/2 mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-stone-900 mb-4">Order not found</h1>
        <Link to="/menu" className="text-primary font-semibold">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="inline-flex h-20 w-20 rounded-full bg-green-100 items-center justify-center mb-4"
        >
          <CheckCircle2 className="text-green-600" size={40} />
        </motion.div>
        <h1 className="text-3xl font-bold text-stone-900 font-heading mb-2">Order Confirmed!</h1>
        <p className="text-stone-500">Thank you for your order, {order.customerInfo?.name || 'friend'}.</p>
      </motion.div>

      <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-stone-500">Order Number</span>
          <span className="font-bold text-stone-900">#{order._id.slice(-6).toUpperCase()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-stone-500 flex items-center gap-1.5">
            <Clock size={14} /> Estimated {order.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}
          </span>
          <span className="font-medium text-stone-800">
            {order.estimatedDelivery ? formatTime(order.estimatedDelivery) : '~30-60 min'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-stone-500 flex items-center gap-1.5">
            <Smartphone size={14} /> Payment
          </span>
          <span className="font-medium text-stone-800 capitalize">
            {paymentLabels[order.paymentMethod] || order.paymentMethod}
          </span>
        </div>
        {order.paidBy ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-500 flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Paid by
            </span>
            <span className="font-medium text-stone-800">{order.paidBy}</span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-500 flex items-center gap-1.5">
              <Smartphone size={14} /> Payment Status
            </span>
            <span className="font-medium text-stone-800 capitalize">
              {order.paymentStatus || 'pending'}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-stone-500 flex items-center gap-1.5">
            <MapPin size={14} /> Delivery Method
          </span>
          <span className="font-medium text-stone-800 capitalize">{order.deliveryMethod}</span>
        </div>
        {order.address?.street && (
          <div className="flex items-start justify-between gap-3">
            <span className="text-sm text-stone-500 flex items-center gap-1.5">
              <MapPin size={14} /> Address
            </span>
            <span className="font-medium text-stone-800 text-right text-sm">
              {[order.address.street, order.address.landmark].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
        <div className="border-t border-stone-100 pt-3">
          <div className="flex justify-between font-semibold text-stone-800">
            <span>Order Total</span>
            <span className="text-primary">{formatRWF(order.total)}</span>
          </div>
        </div>
      </div>

      {needsPayment && (
        <div className="bg-white rounded-2xl border-2 border-primary/20 p-6 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="text-primary" size={18} />
            <h2 className="font-semibold text-stone-900">Complete Mobile Money Payment</h2>
          </div>
          <p className="text-sm text-stone-500 mb-4">
            Dial the USSD code below to pay {formatRWF(order.total)} from your phone, then confirm
            on your MoMo menu.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-5">
            <code className="flex-1 rounded-xl bg-stone-100 px-4 py-3 text-center text-base font-mono font-bold tracking-wider text-stone-900">
              {ussd}
            </code>
            <a
              href={`tel:${ussd}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-white px-6 py-3 text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              <Phone size={16} /> Dial Now
            </a>
          </div>
          <div className="border-t border-stone-100 pt-4">
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Full name on the number that paid
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                placeholder="e.g. Jean Mugisha"
                className="flex-1 rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleSavePaidBy}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 text-white px-6 py-2.5 text-sm font-semibold hover:bg-stone-700 transition-colors disabled:opacity-50"
              >
                {saving && <Loader2 size={15} className="animate-spin" />}
                Save Payer Name
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to={`/track-order/${order._id}`}
          className="flex-1 inline-flex items-center justify-center rounded-full bg-primary text-white py-3 text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          Track My Order
        </Link>
        <Link
          to="/menu"
          className="flex-1 inline-flex items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 py-3 text-sm font-semibold hover:bg-stone-50 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
