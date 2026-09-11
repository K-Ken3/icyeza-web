import { Link, useLocation } from 'react-router-dom';
import { Home, Menu, ShoppingCart, User, LayoutDashboard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const BottomNav = () => {
  const { totals, openCart } = useCart();
  const { user } = useAuth();
  const location = useLocation();

  const items = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/menu', label: 'Menu', icon: Menu },
    { to: '/cart', label: 'Cart', icon: ShoppingCart },
    { to: user?.role === 'admin' ? '/admin' : '/account', label: user?.role === 'admin' ? 'Admin' : 'Account', icon: user?.role === 'admin' ? LayoutDashboard : User },
  ];

  const isActive = (to) => location.pathname === to;

  const handleClick = (item) => (e) => {
    if (item.label === 'Cart') {
      e.preventDefault();
      openCart();
    }
    if (item.label === 'Account' && !user) {
      e.preventDefault();
    }
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-stone-100 pb-2 pt-1"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-4"> 
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          const color = active && item.label !== 'Cart' && item.label !== 'Admin'
            ? 'text-primary'
            : 'text-stone-500';
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={handleClick(item)}
              className="flex flex-col items-center justify-center py-1.5"
              aria-label={item.label}
            >
              <div className="relative">
                <Icon size={22} className={color} fill={active && item.label !== 'Cart' && item.label !== 'Admin' ? 'currentColor' : 'none'} />
                {item.label === 'Cart' && totals.count > 0 && (
                  <span className="absolute -top-1.5 -right-2 h-4 min-w-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                    {totals.count}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-0.5 ${color}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
