import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import Input from '../components/Input';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { getErrorMessage } from '../utils/format';

export const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const { login, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await login(form.email, form.password);
      toast(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'admin' ? '/admin' : '/account');
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid email or password'));
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-stone-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-stone-100 p-8"
      >
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="Icyeza One Coffee Shop"
            className="rounded-xl object-contain"
            style={{ height: 48, filter: 'brightness(0.5) contrast(1.1) saturate(1.3)' }}
          />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 font-heading text-center mb-1">
          Welcome back
        </h1>
        <p className="text-stone-500 text-center text-sm mb-6">
          Login to your Icyeza One Coffee Shop account
        </p>

        <GoogleSignInButton />

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-600 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-primary font-medium hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" full loading={loading}>
            Login
          </Button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;