import { useState } from 'react';
import { Icon } from './Icon';
import { useProjectStore } from '../../store/useProjectStore';
import { useProyectos } from '../../hooks/useProyectos';
import { ProjectFormModal } from '../project/ProjectFormModal';

interface NoProjectSelectedProps {
  icon?: string;
  message?: string;
}

export function NoProjectSelected({
  icon = 'building',
  message = 'Selecciona o crea un proyecto para comenzar',
}: NoProjectSelectedProps) {
  const { openProjectSelector } = useProjectStore();
  const { data: projects } = useProyectos();
  const [formOpen, setFormOpen] = useState(false);

  const hasProjects = projects && projects.length > 0;

  const handleClick = () => {
    if (hasProjects) {
      openProjectSelector();
    } else {
      setFormOpen(true);
    }
  };

  return (
    <>
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 rounded-2xl bg-esant-gray-100 flex items-center justify-center mx-auto mb-4">
          <Icon name={icon} size={32} className="text-esant-gray-400" />
        </div>
        <p className="text-esant-gray-600 mb-6">{message}</p>
        <button
          onClick={handleClick}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#DC2626] text-white rounded-xl font-medium hover:bg-[#B91C1C] transition-colors"
        >
          <Icon name={hasProjects ? 'folder-open' : 'plus'} size={20} />
          {hasProjects ? 'Seleccionar proyecto' : 'Nuevo proyecto'}
        </button>
      </div>

      <ProjectFormModal
        mode="create"
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
      />
    </>
  );
}
