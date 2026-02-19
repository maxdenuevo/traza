import { type ChangeEvent, useCallback } from 'react';

interface CurrencyInputProps {
  name: string;
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function formatWithDots(raw: string): string {
  if (!raw) return '';
  const num = parseInt(raw, 10);
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('es-CL').format(num);
}

export function CurrencyInput({
  name,
  value,
  onChange,
  placeholder = '0',
  className = '',
  disabled = false,
}: CurrencyInputProps) {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '');
      onChange({ target: { name, value: raw } });
    },
    [name, onChange]
  );

  const displayValue = formatWithDots(value);

  return (
    <div className="relative">
      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-esant-gray-600">$</span>
      <input
        type="text"
        inputMode="numeric"
        name={name}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`block w-full pl-5 pr-0 py-3 bg-transparent border-0 border-b-2 border-esant-gray-200 text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      />
    </div>
  );
}
