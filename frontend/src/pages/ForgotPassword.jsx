import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MailCheck } from 'lucide-react';
import { authService } from '../services/authService';
import Button from '../components/Button';
import Input from '../components/Input';
import { getErrorMessage } from '../utils/format';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
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
          <img src="/logo.png" alt="Icyeza One Coffee Shop" className="rounded-xl object-contain" style={{ height: 48, filter: 'brightness(0.5) contrast(1.1) saturate(1.3)' }} />
        </div>

        {sent ? (
          <div className="text-center">
            <div className="inline-flex h-16 w-16 rounded-full bg-green-100 items-center justify-center mb-4">
              <MailCheck className="text-green-600" size={30} />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 font-heading mb-2">Check your email</h1>
            <p className="text-stone-500 text-sm mb-6">
              If an account exists for <strong>{email}</strong>, we've sent password reset instructions.
            </p>
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-stone-900 font-heading text-center mb-1">
              Forgot password?
            </h1>
            <p className="text-stone-500 text-center text-sm mb-6">
              Enter your email and we'll send you a reset link.
            </p>

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <Button type="submit" full loading={loading}>
                Send Reset Link
              </Button>
            </form>

            <p className="text-center text-sm text-stone-500 mt-6">
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Back to Login
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
