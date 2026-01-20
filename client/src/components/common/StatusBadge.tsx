type CronogramaStatus = 'listo' | 'pausado' | 'en_obra';

interface StatusBadgeProps {
  status: CronogramaStatus;
  onClick?: () => void;
  disabled?: boolean;
}

const STATUS_CONFIG: Record<CronogramaStatus, { label: string; bg: string; text: string }> = {
  listo: {
    label: 'Listo',
    bg: 'bg-[#4CAF50]',
    text: 'text-white',
  },
  pausado: {
    label: 'Pausado',
    bg: 'bg-[#9E9E9E]',
    text: 'text-white',
  },
  en_obra: {
    label: 'En obra',
    bg: 'bg-[#E53935]',
    text: 'text-white',
  },
};

export const StatusBadge = ({ status, onClick, disabled = false }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status];

  if (onClick && !disabled) {
    return (
      <button
        onClick={onClick}
        className={`
          px-3 py-1
          ${config.bg} ${config.text}
          text-xs font-medium
          rounded-full
          transition-opacity hover:opacity-80
          active:scale-95
        `}
      >
        {config.label}
      </button>
    );
  }

  return (
    <span
      className={`
        px-3 py-1
        ${config.bg} ${config.text}
        text-xs font-medium
        rounded-full
        ${disabled ? 'opacity-60' : ''}
      `}
    >
      {config.label}
    </span>
  );
};

// Export for use in other components
export type { CronogramaStatus };
