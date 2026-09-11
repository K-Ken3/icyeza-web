import { motion } from 'framer-motion';
import { AlertTriangle, WifiOff, RefreshCw, ShoppingBag } from 'lucide-react';

export const EmptyState = ({ icon: Icon = ShoppingBag, title, description, action, actionLabel, onAction }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center text-center py-16 px-4"
  >
    <div className="h-16 w-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
      <Icon className="text-stone-400" size={28} />
    </div>
    <h3 className="text-lg font-semibold text-stone-800 mb-1">{title}</h3>
    {description && <p className="text-sm text-stone-500 max-w-sm mb-4">{description}</p>}
    {action && (
      <button
        onClick={onAction}
        className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-6 py-2.5 text-sm font-semibold hover:bg-primary-dark transition-colors"
      >
        {actionLabel || 'Browse Menu'}
      </button>
    )}
  </motion.div>
);

export const ErrorState = ({ message = 'Something went wrong. Please check your connection and try again.', onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center text-center py-16 px-4"
  >
    <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
      <WifiOff className="text-red-500" size={28} />
    </div>
    <h3 className="text-lg font-semibold text-stone-800 mb-1">Something went wrong</h3>
    <p className="text-sm text-stone-500 max-w-sm mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-full bg-stone-800 text-white px-6 py-2.5 text-sm font-semibold hover:bg-stone-700 transition-colors"
      >
        <RefreshCw size={16} />
        Try Again
      </button>
    )}
  </motion.div>
);

export const NetworkError = ({ onRetry }) => (
  <ErrorState
    message="Cannot reach the server. Please check your internet connection and try again."
    onRetry={onRetry}
  />
);

export const ProductUnavailable = () => (
  <div className="flex items-center gap-2 rounded-lg bg-red-50 text-red-600 px-4 py-3 text-sm font-medium">
    <AlertTriangle size={18} />
    This meal is currently unavailable.
  </div>
);

export default EmptyState;
