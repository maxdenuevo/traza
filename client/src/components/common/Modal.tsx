import { useEffect, useCallback } from 'react';
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
  // Handle browser back button - close modal instead of navigating
  const handlePopState = useCallback(() => {
    if (isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      // Push a dummy state to handle back button
      window.history.pushState({ modal: true }, '');
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, handlePopState]);

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

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Mobile-first: full width on small screens, constrained on larger
  const sizeClasses = {
    sm: 'w-[calc(100vw-32px)] sm:max-w-md',
    md: 'w-[calc(100vw-32px)] sm:max-w-lg',
    lg: 'w-[calc(100vw-32px)] sm:max-w-2xl',
    full: 'w-[calc(100vw-32px)]'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative bg-white rounded-xl shadow-xl ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold truncate pr-2">{title}</h2>
          {/* 44px touch target */}
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 rounded-lg flex-shrink-0"
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
