type ProgramaStatus = 'pendiente' | 'en_curso' | 'pausado' | 'entregado' | 'cancelado';

interface StatusBadgeProps {
  status: ProgramaStatus;
  onClick?: () => void;
  disabled?: boolean;
}

const STATUS_CONFIG: Record<ProgramaStatus, { label: string; bg: string; text: string }> = {
  pendiente: {
    label: 'Pendiente',
    bg: 'bg-gray-300',
    text: 'text-gray-800',
  },
  en_curso: {
    label: 'En curso',
    bg: 'bg-[#DC2626]',
    text: 'text-white',
  },
  pausado: {
    label: 'Pausado',
    bg: 'bg-gray-400',
    text: 'text-white',
  },
  entregado: {
    label: 'Entregado',
    bg: 'bg-gray-900',
    text: 'text-white',
  },
  cancelado: {
    label: 'Cancelado',
    bg: 'bg-gray-500',
    text: 'text-white',
  },
};

export const StatusBadge = ({ status, onClick, disabled = false }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pausado;

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
export type { ProgramaStatus };
