import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Truck, Store, MapPin, Loader2 } from 'lucide-react';
import { useCart, DELIVERY_FEE } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { orderService } from '../services/orderService';
import { formatRWF } from '../utils/format';
import Button from '../components/Button';
import Input from '../components/Input';
import PaymentMethod from '../components/PaymentMethod';

const steps = ['Information', 'Delivery', 'Address', 'Payment', 'Review'];

const provinces = ['City of Kigali', 'Northern Province', 'Southern Province', 'Eastern Province', 'Western Province'];
const districts = {
  'City of Kigali': ['Nyarugenge', 'Gasabo', 'Kicukiro'],
  'Northern Province': ['Musanze', 'Rulindo', 'Burera', 'Gicumbi'],
  'Southern Province': ['Huye', 'Nyanza', 'Muhanga', 'Kamonyi'],
  'Eastern Province': ['Kayonza', 'Rwamagana', 'Nyagatare', 'Bugesera'],
  'Western Province': ['Rubavu', 'Rusizi', 'Karongi'],
};

export const Checkout = () => {
  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const orderPlacedRef = useRef(false);
  const { cart, totals, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    deliveryMethod: 'delivery',
    province: '',
    district: '',
    sector: '',
    street: '',
    landmark: '',
    notes: '',
    paymentMethod: 'mobile_money',
  });
  const [errors, setErrors] = useState({});
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.name || f.name,
        phone: user.phone || f.phone,
        email: user.email || f.email,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (cart.length === 0 && !orderPlacedRef.current) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const validateStep = (s) => {
    const e = {};
    if (s === 0) {
      if (!form.name.trim()) e.name = 'Full name is required';
      if (!form.phone.trim()) e.phone = 'Phone number is required';
      if (!form.email.trim()) e.email = 'Email is required';
      else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    }
    if (s === 2 && form.deliveryMethod === 'delivery') {
      if (!form.province) e.province = 'Province is required';
      if (!form.street.trim()) e.street = 'Street or landmark is required';
    }
    if (s === 3 && !form.paymentMethod) e.paymentMethod = 'Select a payment method';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) {
      toast('Please fix the highlighted fields', 'error');
      return;
    }
    if (step === 1 && form.deliveryMethod === 'pickup') {
      setStep(3);
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleLocate = () => {
    if (!navigator.geolocation) {
      toast('Location services not available', 'error');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setForm((f) => ({ ...f, landmark: f.landmark || 'Using current location' }));
        setLocating(false);
        toast('Location captured', 'success');
      },
      () => {
        setLocating(false);
        toast('Could not get location', 'error');
      }
    );
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setPlacing(true);
    try {
      const items = cart.map((item) => ({
        product: item.id,
        name: item.name,
        image: item.image,
        price: item.price + (item.addOnCurrentPrice || 0),
        quantity: item.quantity,
        options: item.options || [],
      }));

      const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
      const deliveryFee = form.deliveryMethod === 'delivery' ? DELIVERY_FEE : 0;

      const data = await orderService.createOrder({
        items,
        subtotal,
        discount: 0,
        deliveryFee,
        total: subtotal + deliveryFee,
        customerInfo: { name: form.name, phone: form.phone, email: form.email },
        deliveryMethod: form.deliveryMethod,
        address:
          form.deliveryMethod === 'delivery'
            ? {
                province: form.province,
                district: form.district,
                sector: form.sector,
                street: form.street,
                landmark: form.landmark,
                notes: form.notes,
              }
            : undefined,
        paymentMethod: form.paymentMethod,
      });

      clearCart();
      orderPlacedRef.current = true;

      navigate(`/order-success/${data.order._id}`, {
        state: {
          order: data.order,
          paymentMethod: form.paymentMethod,
          total,
        },
      });
    } catch (e) {
      const msg = e?.response?.data?.message || 'Could not place your order. Please try again.';
      toast(msg, 'error');
    } finally {
      setPlacing(false);
    }
  };

  const total = totals.subtotal + (form.deliveryMethod === 'delivery' ? DELIVERY_FEE : 0);

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/cart"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-6"
      >
        <ArrowLeft size={16} /> Back to Cart
      </Link>

      <h1 className="text-3xl font-bold text-stone-900 font-heading mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center mb-6 overflow-x-auto">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-8 w-8 flex items-center justify-center rounded-full text-sm font-semibold ${
                      i < step
                        ? 'bg-green-500 text-white'
                        : i === step
                        ? 'bg-primary text-white'
                        : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    {i < step ? <Check size={16} /> : i + 1}
                  </div>
                  <span
                    className={`text-[11px] mt-1 whitespace-nowrap ${
                      i === step ? 'text-primary font-semibold' : 'text-stone-400'
                    }`}
                  >
                    {s}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 w-8 sm:w-12 mx-1 mb-4 ${i < step ? 'bg-green-500' : 'bg-stone-200'}`} />
                )}
              </div>
            ))}
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm"
          >
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-stone-800">Customer Information</h2>
                <Input
                  label="Full Name"
                  value={form.name}
                  onChange={update('name')}
                  placeholder="Jean Mugisha"
                  required
                  error={errors.name}
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="07xxxxxxxx"
                  required
                  error={errors.phone}
                />
                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="you@example.com"
                  required
                  error={errors.email}
                />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-stone-800">Delivery Method</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { id: 'delivery', label: 'Delivery', desc: `We'll bring it to you (${formatRWF(DELIVERY_FEE)})`, icon: Truck },
                    { id: 'pickup', label: 'Pickup', desc: 'Collect at our nearest branch', icon: Store },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setForm({ ...form, deliveryMethod: m.id })}
                      className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors ${
                        form.deliveryMethod === m.id
                          ? 'border-primary bg-primary/5'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className={`h-10 w-10 flex items-center justify-center rounded-lg ${form.deliveryMethod === m.id ? 'bg-primary text-white' : 'bg-stone-100 text-stone-500'}`}>
                        <m.icon size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-stone-800 text-sm">{m.label}</p>
                        <p className="text-xs text-stone-500 mt-0.5">{m.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-stone-800">Delivery Address</h2>
                  <button
                    onClick={handleLocate}
                    disabled={locating}
                    className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline disabled:opacity-50"
                  >
                    {locating ? <Loader2 size={15} className="animate-spin" /> : <MapPin size={15} />}
                    Use my current location
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">
                      Province <span className="text-primary">*</span>
                    </label>
                    <select
                      value={form.province}
                      onChange={update('province')}
                      className={`w-full rounded-lg border ${errors.province ? 'border-red-400' : 'border-stone-300'} bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary`}
                    >
                      <option value="">Select province</option>
                      {provinces.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    {errors.province && <p className="text-xs text-red-500 mt-1">{errors.province}</p>}
                  </div>
                  <Input
                    label="District"
                    value={form.district}
                    onChange={update('district')}
                    placeholder="Gasabo"
                    hint={form.province ? `Try: ${(districts[form.province] || []).join(', ')}` : undefined}
                  />
                  <Input
                    label="Sector"
                    value={form.sector}
                    onChange={update('sector')}
                    placeholder="Kimironko"
                  />
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">
                      Street / Landmark <span className="text-primary">*</span>
                    </label>
                    <textarea
                      value={form.street}
                      onChange={update('street')}
                      placeholder="e.g. KG 5 Ave, next to the blue building"
                      rows={2}
                      className={`w-full rounded-lg border ${errors.street ? 'border-red-400' : 'border-stone-300'} bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                    {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street}</p>}
                  </div>
                </div>
                <Input
                  label="Additional Instructions"
                  value={form.notes}
                  onChange={update('notes')}
                  placeholder="e.g. Call me when you arrive, ring the bell"
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-stone-800">Payment Method</h2>
                <PaymentMethod selected={form.paymentMethod} onSelect={(id) => setForm({ ...form, paymentMethod: id })} />
                {errors.paymentMethod && <p className="text-xs text-red-500">{errors.paymentMethod}</p>}
                <p className="text-xs text-stone-400">
                  Pay with MTN MoMo. When you place the order we'll open your dialer with the USSD
                  code — dial it, confirm, then complete payment details on the next screen.
                </p>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-stone-800">Review Order</h2>
                <div className="border-t border-stone-100 pt-4 space-y-2">
                  {cart.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-stone-600">
                        {item.quantity} × {item.name}
                      </span>
                      <span className="font-medium">{formatRWF((item.price + (item.addOnCurrentPrice || 0)) * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm pt-2 border-t border-stone-100 text-stone-600">
                    <span>Subtotal</span>
                    <span>{formatRWF(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Delivery{form.deliveryMethod === 'pickup' ? ' (Pickup)' : ''}</span>
                    <span>{form.deliveryMethod === 'delivery' ? formatRWF(DELIVERY_FEE) : formatRWF(0)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-stone-900 pt-2 border-t border-stone-100 text-base">
                    <span>Total</span>
                    <span>{formatRWF(total)}</span>
                  </div>
                </div>
                <div className="bg-stone-50 rounded-xl p-4 text-sm text-stone-600 space-y-1">
                  <p>
                    <strong className="text-stone-800">Delivery:</strong>{' '}
                    {form.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}
                  </p>
                  {form.deliveryMethod === 'delivery' && (
                    <p>
                      <strong className="text-stone-800">Address:</strong>{' '}
                      {[form.street, form.sector, form.district, form.province].filter(Boolean).join(', ')}
                    </p>
                  )}
                  <p>
                    <strong className="text-stone-800">Payment:</strong>{' '}
                    {form.paymentMethod.replace('_', ' ')}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-6 pt-6 border-t border-stone-100">
              {step > 0 ? (
                <Button variant="secondary" onClick={handleBack}>
                  Back
                </Button>
              ) : (
                <span />
              )}
              {step < 4 ? (
                <Button onClick={handleNext}>
                  Continue <ArrowRight size={16} />
                </Button>
              ) : (
                <Button onClick={handlePlaceOrder} loading={placing}>
                  {placing ? 'Placing Order...' : `Place Order · ${formatRWF(total)}`}
                </Button>
              )}
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-stone-100 p-5 sticky top-24 shadow-sm">
            <h2 className="font-semibold text-stone-800 mb-4">Order Summary</h2>
            <div className="space-y-1.5 max-h-48 overflow-y-auto mb-3">
              {cart.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm">
                  <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-stone-700">{item.name}</p>
                    <p className="text-xs text-stone-400">×{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-medium">{formatRWF(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery</span>
                <span className="font-medium">
                  {form.deliveryMethod === 'delivery' ? formatRWF(DELIVERY_FEE) : formatRWF(0)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-stone-900 pt-2 border-t border-stone-100">
                <span>Total</span>
                <span>{formatRWF(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
