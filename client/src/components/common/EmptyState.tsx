import { Icon } from './Icon';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({ icon = 'info', title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon name={icon} size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mb-6 max-w-sm">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="btn-touch px-6 py-3 bg-esant-black text-esant-white rounded-lg font-medium hover:opacity-80 smooth-transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
