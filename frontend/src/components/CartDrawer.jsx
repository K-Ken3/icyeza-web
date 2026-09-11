import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, Minus, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart, DELIVERY_FEE } from '../context/CartContext';
import { formatRWF } from '../utils/format';
import EmptyState from './EmptyState';

export const CartDrawer = () => {
  const { isOpen, cart, closeCart, updateQty, removeFromCart, totals } = useCart();
  const navigate = useNavigate();

  const estimatedTotal = totals.subtotal + DELIVERY_FEE;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') closeCart(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, closeCart]);

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const handleBrowse = () => {
    closeCart();
    navigate('/menu');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={closeCart}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-white z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between p-4 border-b border-stone-100">
              <h2 className="text-lg font-semibold text-stone-800">Your Cart</h2>
              <button
                onClick={closeCart}
                className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState
                  icon={ShoppingBag}
                  title="Your cart is empty"
                  description="Looks like you haven't added anything yet. Let's fix that."
                  action
                  actionLabel="Browse Menu"
                  onAction={handleBrowse}
                />
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <AnimatePresence initial={false}>
                    {cart.map((item, index) => (
                      <motion.div
                        key={`${item.id}-${index}`}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -60 }}
                        className="flex gap-3"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-20 w-20 rounded-xl object-cover flex-shrink-0"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-medium text-stone-800 truncate">{item.name}</h3>
                            <button
                              onClick={() => removeFromCart(index)}
                              className="text-stone-400 hover:text-red-500 transition-colors flex-shrink-0"
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          {item.options?.length > 0 && (
                            <p className="text-xs text-stone-500 text-xs mt-0.5">
                              {item.options.map((o) => o.label).join(', ')}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-sm font-semibold text-stone-800">
                              {formatRWF((item.price + (item.addOnCurrentPrice || 0)) * item.quantity)}
                            </p>
                            <div className="flex items-center border border-stone-200 rounded-full">
                              <button
                                onClick={() => updateQty(index, item.quantity - 1)}
                                className="h-6 w-6 flex items-center justify-center rounded-l-full hover:bg-stone-100 text-stone-600"
                                aria-label="Decrease"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => updateQty(index, item.quantity + 1)}
                                className="h-6 w-6 flex items-center justify-center rounded-r-full hover:bg-stone-100 text-stone-600"
                                aria-label="Increase"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="p-4 border-t border-stone-100 space-y-2">
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatRWF(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Delivery Fee</span>
                    <span className="font-medium">{formatRWF(DELIVERY_FEE)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-stone-800 pt-2 border-t border-stone-100">
                    <span>Total</span>
                    <span>{formatRWF(estimatedTotal)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full mt-2 rounded-full bg-primary text-white py-3 text-sm font-semibold hover:bg-primary-dark transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
