import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';

const methods = [
  {
    id: 'mobile_money',
    label: 'Mobile Money',
    desc: 'MTN MoMo — pay via USSD when the order is placed',
    icon: Smartphone,
  },
];

export const PaymentMethod = ({ selected, onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {methods.map((method) => {
        const isSelected = selected === method.id;
        return (
          <motion.button
            key={method.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(method.id)}
            className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors ${
              isSelected
                ? 'border-primary bg-primary/5'
                : 'border-stone-200 bg-white hover:border-stone-300'
            }`}
            aria-pressed={isSelected}
          >
            <div
              className={`h-10 w-10 flex items-center justify-center rounded-lg ${
                isSelected ? 'bg-primary text-white' : 'bg-stone-100 text-stone-500'
              }`}
            >
              <method.icon size={20} />
            </div>
            <div>
              <p className="font-semibold text-stone-800 text-sm">{method.label}</p>
              <p className="text-xs text-stone-500 mt-0.5">{method.desc}</p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default PaymentMethod;
