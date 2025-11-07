import type { ChangeEvent, ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea' | 'select';
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  required?: boolean;
  placeholder?: string;
  error?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  rows?: number;
  options?: Array<{ value: string; label: string }>;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  prefix?: ReactNode;
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder,
  error,
  min,
  max,
  step,
  rows = 4,
  options,
  children,
  className = '',
  disabled = false,
  prefix,
}: FormFieldProps) {
  // Estilo minimalista ESANT MARIA - Solo border-bottom
  const baseInputClasses = `block w-full px-0 py-3 bg-transparent border-0 border-b-2 text-esant-black placeholder-esant-gray-400 focus:outline-none transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed ${
    error ? 'border-esant-red focus:border-esant-red' : 'border-esant-gray-200 focus:border-esant-black'
  } ${prefix ? 'pl-8' : ''}`;

  const labelClasses = `block text-sm font-medium mb-2 ${
    error ? 'text-esant-red' : 'text-esant-gray-600'
  }`;

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={`${baseInputClasses} resize-none`}
        />
      );
    }

    if (type === 'select') {
      return (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`${baseInputClasses} appearance-none bg-transparent`}
        >
          {children || options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={baseInputClasses}
      />
    );
  };

  return (
    <div className={className}>
      <label htmlFor={name} className={labelClasses}>
        {label} {required && '*'}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-esant-gray-600">
            {prefix}
          </span>
        )}
        {renderInput()}
      </div>
      {error && (
        <p className="mt-1 text-sm text-esant-red">{error}</p>
      )}
    </div>
  );
}
