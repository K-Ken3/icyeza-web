import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, ShoppingCart, Menu as MenuIcon, X, LayoutDashboard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Menu', to: '/menu' },
  { label: 'Deals', to: '/deals' },
  { label: 'My Orders', to: 'account/orders' },
  { label: 'Locations', to: '/locations' },
  { label: 'About', to: '/about' },
];

const Logo = ({ dark = true }) => (
  <Link to="/" className="flex items-center gap-2" aria-label="Icyeza One Coffee Shop home">
    <img
      src="/logo.png"
      alt="Icyeza One Coffee Shop"
      className="rounded-lg object-contain"
      style={{ height: 36, filter: dark ? 'brightness(0.5) contrast(1.1) saturate(1.3)' : 'none' }}
    />
    <span className={`text-lg font-bold font-heading ${dark ? 'text-stone-900' : 'text-white'}`}>
      Icyeza One Coffee Shop
    </span>
  </Link>
);

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { totals, openCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const visibleNavLinks = user?.role === 'admin'
    ? [...navLinks, { label: 'Admin', to: '/admin', icon: LayoutDashboard }]
    : navLinks;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/menu?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setSearchOpen(false);
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur border-b border-stone-100 shadow-sm'
            : 'bg-white/80 backdrop-blur'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />

            <div className="hidden lg:flex items-center gap-1">
              {visibleNavLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'text-primary bg-primary/5'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              <Link
                to={user ? '/account' : '/login'}
                className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
                aria-label={user ? 'My account' : 'Login'}
              >
                <User size={20} />
              </Link>

              <button
                onClick={openCart}
                className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
                aria-label={`Open cart, ${totals.count} items`}
              >
                <ShoppingCart size={20} />
                {totals.count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center px-1">
                    {totals.count}
                  </span>
                )}
              </button>

              <Link
                to="/menu"
                className="hidden md:inline-flex ml-2 items-center rounded-full bg-primary text-white px-5 py-2 text-sm font-semibold hover:bg-primary-dark transition-colors"
              >
                Order Now
              </Link>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full hover:bg-stone-100 text-stone-700 transition-colors"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={22} /> : <MenuIcon size={22} />}
              </button>
            </div>
          </div>
        </nav>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border-t border-stone-100"
            >
              <form onSubmit={handleSearch} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search meals..."
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Search meals"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-primary text-white px-5 text-sm font-semibold hover:bg-primary-dark transition-colors"
                >
                  Search
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white z-50 lg:hidden flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
            >
              <div className="flex items-center justify-between p-4 border-b border-stone-100">
                <Logo />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-600"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 p-4 flex flex-col gap-1">
                {visibleNavLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                      location.pathname === link.to
                        ? 'bg-primary/5 text-primary'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-4 pt-4 border-t border-stone-100">
                  <Link
                    to={user ? '/account' : '/login'}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 hover:bg-stone-50 font-medium"
                  >
                    <User size={20} />
                    {user ? 'My Account' : 'Login'}
                  </Link>
                </div>
              </div>
              <div className="p-4">
                <Link
                  to="/menu"
                  className="flex items-center justify-center rounded-full bg-primary text-white px-6 py-3 text-sm font-semibold hover:bg-primary-dark transition-colors"
                >
                  Order Now
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
export { Logo };
