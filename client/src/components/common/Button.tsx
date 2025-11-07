import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'whatsapp' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  fullWidth?: boolean;
}

/**
 * Componente Button basado en el sistema de diseño ESANT MARIA
 * Inspirado en los principios de Dieter Rams
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) => {
  const baseClasses = 'btn-touch font-medium rounded-lg smooth-transition disabled:opacity-40 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-esant-black text-esant-white hover:opacity-80 active:scale-98',
    secondary: 'bg-esant-gray-200 text-esant-gray-800 hover:bg-esant-gray-300 active:scale-98',
    whatsapp: 'bg-esant-green text-esant-white hover:opacity-80 active:scale-98 rounded-2xl',
    accent: 'bg-esant-red text-esant-white hover:opacity-80 active:scale-98',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
