import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart, DELIVERY_FEE } from '../context/CartContext';
import { formatRWF } from '../utils/format';
import EmptyState from '../components/EmptyState';

export const CartPage = () => {
  const { cart, updateQty, removeFromCart, clearCart, totals } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-stone-900 font-heading text-center mb-8">Your Cart</h1>
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Let's find something delicious."
          action
          actionLabel="Browse Menu"
          onAction={() => navigate('/menu')}
        />
      </div>
    );
  }

  const total = totals.subtotal + DELIVERY_FEE;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-stone-900 font-heading">Your Cart</h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 font-medium hover:underline"
        >
          Clear cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence initial={false}>
            {cart.map((item, index) => (
              <motion.div
                key={`${item.id}-${index}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -60 }}
                className="flex gap-4 bg-white rounded-2xl border border-stone-100 p-4 shadow-sm"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-24 w-24 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link to={`/product/${item.id}`} className="font-semibold text-stone-900 hover:text-primary">
                        {item.name}
                      </Link>
                      {item.options?.length > 0 && (
                        <p className="text-sm text-stone-500 mt-0.5">
                          {item.options.map((o) => `${o.name}: ${o.label}`).join(' · ')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-stone-400 hover:text-red-500 transition-colors"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-stone-200 rounded-full">
                      <button
                        onClick={() => updateQty(index, item.quantity - 1)}
                        className="h-8 w-8 flex items-center justify-center rounded-l-full hover:bg-stone-100 text-stone-600"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(index, item.quantity + 1)}
                        className="h-8 w-8 flex items-center justify-center rounded-r-full hover:bg-stone-100 text-stone-600"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-semibold text-stone-900">
                      {formatRWF((item.price + (item.addOnCurrentPrice || 0)) * item.quantity)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors"
          >
            <ArrowLeft size={16} /> Continue shopping
          </Link>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-stone-100 p-6 sticky top-24 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">Order Summary</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal ({totals.count} items)</span>
                <span className="font-medium">{formatRWF(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery Fee</span>
                <span className="font-medium">{formatRWF(DELIVERY_FEE)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Discount</span>
                <span className="font-medium text-green-600">-RWF 0</span>
              </div>
              <div className="flex justify-between font-bold text-stone-900 pt-3 border-t border-stone-100 text-base">
                <span>Total</span>
                <span>{formatRWF(total)}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full mt-4 flex items-center justify-center gap-2 rounded-full bg-primary text-white py-3 text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
