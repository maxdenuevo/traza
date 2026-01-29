import { Icon } from './Icon';

interface FABProps {
  onClick: () => void;
  icon?: string;
  label?: string;
  className?: string;
}

export const FAB = ({
  onClick,
  icon = 'plus',
  label = 'Agregar',
  className = ''
}: FABProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        fixed right-4 z-30
        w-14 h-14
        bg-[#DC2626] hover:bg-[#B91C1C]
        text-white
        rounded-full
        shadow-lg hover:shadow-xl
        flex items-center justify-center
        transition-all duration-200
        active:scale-95
        ${className}
      `}
      style={{ bottom: 'max(calc(env(safe-area-inset-bottom) + 24px), 24px)' }}
      aria-label={label}
    >
      <Icon name={icon} size={24} strokeWidth={2.5} />
    </button>
  );
};
