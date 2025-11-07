import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Icon } from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}: ModalProps) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative bg-white rounded-xl shadow-xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="btn-touch p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Cerrar"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
};
