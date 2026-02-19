import { Icon } from './Icon';
import { useProjectStore } from '../../store/useProjectStore';

interface NoProjectSelectedProps {
  icon?: string;
  message?: string;
}

export function NoProjectSelected({
  icon = 'building',
  message = 'Selecciona o crea un proyecto para comenzar',
}: NoProjectSelectedProps) {
  const { openProjectSelector } = useProjectStore();

  return (
    <div className="text-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-esant-gray-100 flex items-center justify-center mx-auto mb-4">
        <Icon name={icon} size={32} className="text-esant-gray-400" />
      </div>
      <p className="text-esant-gray-600 mb-6">{message}</p>
      <button
        onClick={openProjectSelector}
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#DC2626] text-white rounded-xl font-medium hover:bg-[#B91C1C] transition-colors"
      >
        <Icon name="plus" size={20} />
        Seleccionar proyecto
      </button>
    </div>
  );
}
