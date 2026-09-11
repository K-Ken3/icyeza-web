import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-primary text-white hover:bg-primary-dark shadow-sm focus-visible:ring-primary',
  secondary:
    'bg-white text-stone-800 border border-stone-300 hover:bg-stone-50 focus-visible:ring-stone-300',
  outline:
    'bg-transparent text-primary border border-primary hover:bg-primary hover:text-white focus-visible:ring-primary',
  ghost: 'bg-transparent text-stone-700 hover:bg-stone-100 focus-visible:ring-stone-300',
  accent:
    'bg-accent text-white hover:bg-amber-500 shadow-sm focus-visible:ring-accent',
  dark: 'bg-charcoal text-white hover:bg-charcoal-light focus-visible:ring-charcoal',
};

const sizes = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-12 px-8 text-base',
  icon: 'h-10 w-10',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  full,
  ...props
}) => {
  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
    variants[variant],
    sizes[size],
    full ? 'w-full' : '',
    className,
  ].join(' ');

  return (
    <motion.button
      whileTap={!disabled && !loading ? { scale: 0.97 } : undefined}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={18} />}
      {children}
    </motion.button>
  );
};

export default Button;
