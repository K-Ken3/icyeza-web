import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import MainLayout from './layouts/MainLayout';
import ScrollToTop from './components/ScrollToTop';

const Home = lazy(() => import('./pages/Home'));
const Menu = lazy(() => import('./pages/Menu'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Deals = lazy(() => import('./pages/Deals'));
const Locations = lazy(() => import('./pages/Locations'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const CartPage = lazy(() => import('./pages/CartPage'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const GoogleCallback = lazy(() => import('./pages/GoogleCallback'));
const AccountLayout = lazy(() => import('./layouts/AccountLayout'));
const AccountDashboard = lazy(() => import('./pages/account/AccountDashboard'));
const AccountOrders = lazy(() => import('./pages/account/AccountOrders'));
const AccountOrderDetails = lazy(() => import('./pages/account/AccountOrderDetails'));
const AccountFavorites = lazy(() => import('./pages/account/AccountFavorites'));
const AccountProfile = lazy(() => import('./pages/account/AccountProfile'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="skeleton h-8 w-48" />
  </div>
);

const SuspenseRoute = ({ children }) => <Suspense fallback={<PageLoader />}>{children}</Suspense>;

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/account" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <SuspenseRoute>
      <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/menu/:category" element={<Menu />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:id" element={<OrderSuccess />} />
        <Route path="/track-order/:id" element={<TrackOrder />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/google" element={<GoogleCallback />} />

        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AccountDashboard />} />
          <Route path="orders" element={<AccountOrders />} />
          <Route path="orders/:id" element={<AccountOrderDetails />} />
          <Route path="favorites" element={<AccountFavorites />} />
          <Route path="profile" element={<AccountProfile />} />
        </Route>

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SuspenseRoute>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <ScrollToTop />
            <AppRoutes />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
