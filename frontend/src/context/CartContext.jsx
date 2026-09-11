import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const CartContext = createContext(null);
const CART_KEY = 'ff_cart';

const DELIVERY_FEE = 1500;

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback(
    (item) => {
      const optionsKey = JSON.stringify(item.options || []);
      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (i) =>
            i.id === item.id && JSON.stringify(i.options || []) === optionsKey
        );
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + (item.quantity || 1),
          };
          return updated;
        }
        return [...prev, { ...item, quantity: item.quantity || 1 }];
      });
      setLastAdded(item);
      setIsOpen(true);
    },
    []
  );

  const updateQty = useCallback((index, quantity) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity } : item))
    );
  }, []);

  const removeFromCart = useCallback((index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const closeCart = useCallback(() => setIsOpen(false), []);
  const openCart = useCallback(() => setIsOpen(true), []);

  const totals = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, item) =>
        sum +
        (item.price + (item.addOnCurrentPrice || 0)) * item.quantity,
      0
    );
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal, count };
  }, [cart]);

  const value = useMemo(
    () => ({
      cart,
      isOpen,
      lastAdded,
      totals,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      closeCart,
      openCart,
      setIsOpen,
      setLastAdded,
    }),
    [cart, isOpen, lastAdded, totals, addToCart, updateQty, removeFromCart, clearCart, closeCart, openCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export { DELIVERY_FEE };
