const badgeStyles = {
  discount: 'bg-accent/90 text-white',
  popular: 'bg-primary text-white',
  new: 'bg-green-500 text-white',
  vegetarian: 'bg-green-100 text-green-700',
  spicy: 'bg-red-100 text-red-600',
  unavailable: 'bg-stone-300 text-stone-600',
  deal: 'bg-primary text-white',
};

export const Badge = ({ children, variant = 'new', className = '' }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeStyles[variant] || badgeStyles.new} ${className}`}
  >
    {children}
  </span>
);

export default Badge;
