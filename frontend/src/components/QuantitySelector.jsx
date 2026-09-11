import { Minus, Plus } from 'lucide-react';

export const QuantitySelector = ({ quantity, onChange, min = 1, max = 99, size = 'md' }) => {
  const btnSize = size === 'lg' ? 'h-10 w-10' : 'h-8 w-8';
  const iconSize = size === 'lg' ? 18 : 14;

  return (
    <div className="inline-flex items-center rounded-full border border-stone-200 bg-white">
      <button
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        className={`${btnSize} flex items-center justify-center rounded-l-full hover:bg-stone-100 disabled:opacity-40 transition-colors text-stone-600`}
        aria-label="Decrease quantity"
      >
        <Minus size={iconSize} />
      </button>
      <span
        className={`${size === 'lg' ? 'w-12 text-base' : 'w-9 text-sm'} text-center font-semibold text-stone-800`}
        aria-live="polite"
      >
        {quantity}
      </span>
      <button
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        className={`${btnSize} flex items-center justify-center rounded-r-full hover:bg-stone-100 disabled:opacity-40 transition-colors text-stone-600`}
        aria-label="Increase quantity"
      >
        <Plus size={iconSize} />
      </button>
    </div>
  );
};

export default QuantitySelector;
