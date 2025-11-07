import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { Icon } from './Icon';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: string;
  children: ReactNode;
  className?: string;
}

export function LoadingButton({
  loading = false,
  variant = 'primary',
  icon,
  children,
  className = '',
  disabled,
  ...props
}: LoadingButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    secondary: 'text-gray-700 bg-gray-100 hover:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Cargando...</span>
        </>
      ) : (
        <>
          {icon && <Icon name={icon} className="w-4 h-4" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
