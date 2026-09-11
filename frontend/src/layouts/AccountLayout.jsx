import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Heart, User, LogOut, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { initials } from '../utils/format';

export const AccountLayout = () => {
  const { user, logout } = useAuth();
  const { confirm, success } = useToast();
  const navigate = useNavigate();

  const navItems = [
    { to: '/account', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/account/orders', label: 'Orders', icon: Package },
    { to: '/account/favorites', label: 'Favorites', icon: Heart },
    { to: '/account/profile', label: 'Profile', icon: User },
    ...(user?.role === 'admin'
      ? [{ to: '/admin', label: 'Admin Panel', icon: ShieldCheck, end: true }]
      : []),
  ];

  const handleLogout = async () => {
    const confirmed = await confirm('You will be signed out of your account. Continue?', {
      title: 'Log out of your account?',
      confirmText: 'Log out',
    });
    if (!confirmed) return;
    logout();
    success('You have been logged out successfully');
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">
          {initials(user?.name)}
        </div>
        <div>
          <h1 className="text-xl font-bold text-stone-900">{user?.name}</h1>
          <p className="text-sm text-stone-500">{user?.email}</p>
        </div>
      </div>

      <div className="lg:flex gap-8">
        <aside className="lg:w-56 flex-shrink-0 mb-6 lg:mb-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-primary/5 text-primary'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors whitespace-nowrap"
            >
              <LogOut size={18} /> Logout
            </button>
            <button
              onClick={() => navigate('/menu')}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors whitespace-nowrap"
            >
              <ArrowLeft size={18} /> Browse Menu
            </button>
          </nav>
        </aside>

        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
