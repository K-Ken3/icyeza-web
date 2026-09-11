import { useId } from 'react';

export const inputBaseClasses =
  'w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary';

export const Input = ({
  label,
  error,
  required,
  className = '',
  id,
  hint,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || props.name || generatedId;
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-stone-700">
          {label}
          {required && <span className="text-primary ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`${inputBaseClasses} ${error ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-red-500">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-stone-400">{hint}</p>
      ) : null}
    </div>
  );
};

export default Input;
