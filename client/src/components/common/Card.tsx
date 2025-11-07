import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div
      className={`bg-esant-white rounded-xl p-4 shadow-esant ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
