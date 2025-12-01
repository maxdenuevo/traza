import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '../../components/common/Icon';
import { Card } from '../../components/common/Card';
import { StatusBadge, type CronogramaStatus } from '../../components/common/StatusBadge';
import { useProjectStore } from '../../store/useProjectStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useCronogramaStore, SECTORS, type SectorStatus } from '../../store/useCronogramaStore';

const STATUS_CYCLE: SectorStatus[] = ['pausado', 'en_obra', 'listo'];

export const CronogramaPage = () => {
  const { currentProject } = useProjectStore();
  const { user } = useAuthStore();
  const { getSectorStatus, setSectorStatus, initializeProjectSectors } = useCronogramaStore();
  const [expandedSector, setExpandedSector] = useState<string | null>(null);

  // Check if user can edit cronograma (admin only)
  const canEdit = user?.rol === 'admin';

  // Initialize sectors when project changes
  useEffect(() => {
    if (currentProject?.id) {
      initializeProjectSectors(currentProject.id);
    }
  }, [currentProject?.id, initializeProjectSectors]);

  const handleStatusClick = (sectorName: string) => {
    if (!canEdit || !currentProject) {
      if (!canEdit) {
        toast.error('Solo el administrador puede editar el cronograma');
      }
      return;
    }

    const currentStatus = getSectorStatus(currentProject.id, sectorName);
    const currentIndex = STATUS_CYCLE.indexOf(currentStatus);
    const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];

    setSectorStatus(currentProject.id, sectorName, nextStatus);
    toast.success(`${sectorName} actualizado a "${nextStatus === 'listo' ? 'Listo' : nextStatus === 'pausado' ? 'Pausado' : 'En obra'}"`);
  };

  const toggleSectorExpand = (sectorName: string) => {
    setExpandedSector(expandedSector === sectorName ? null : sectorName);
  };

  // Get counts by status
  const getStatusCounts = () => {
    if (!currentProject) return { listo: 0, pausado: 0, en_obra: 0 };

    const counts = { listo: 0, pausado: 0, en_obra: 0 };
    SECTORS.forEach((sector) => {
      const status = getSectorStatus(currentProject.id, sector);
      counts[status]++;
    });
    return counts;
  };

  // No project selected
  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <Icon name="list-checks" size={48} className="text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Selecciona un proyecto para ver el cronograma</p>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-6">
        <h2 className="font-semibold text-xl text-gray-900 mb-1">Cronograma</h2>
        <p className="text-sm text-gray-600">Estado de avance por sector</p>

        {/* Status summary */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#4CAF50]"></div>
            <span className="text-sm text-gray-800">
              <span className="font-semibold text-gray-900">{statusCounts.listo}</span> Listo
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FFC107]"></div>
            <span className="text-sm text-gray-800">
              <span className="font-semibold text-gray-900">{statusCounts.pausado}</span> Pausado
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#E53935]"></div>
            <span className="text-sm text-gray-800">
              <span className="font-semibold text-gray-900">{statusCounts.en_obra}</span> En obra
            </span>
          </div>
        </div>
      </Card>

      {/* Admin notice */}
      {!canEdit && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <Icon name="info" size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">
            Solo el administrador tiene acceso a editar el cronograma.
          </p>
        </div>
      )}

      {/* Sectors list */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {SECTORS.map((sector, index) => {
          const status = getSectorStatus(currentProject.id, sector) as CronogramaStatus;
          const isExpanded = expandedSector === sector;
          const isLast = index === SECTORS.length - 1;

          return (
            <div
              key={sector}
              className={`${!isLast ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                {/* Sector name */}
                <button
                  onClick={() => toggleSectorExpand(sector)}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  <Icon
                    name={isExpanded ? 'chevron-down' : 'chevron-right'}
                    size={18}
                    className="text-gray-400"
                  />
                  <span className="font-medium text-gray-900">{sector}</span>
                </button>

                {/* Status badge */}
                <StatusBadge
                  status={status}
                  onClick={canEdit ? () => handleStatusClick(sector) : undefined}
                  disabled={!canEdit}
                />
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 pl-11">
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                    <p>Estado actual: <span className="font-medium">{status === 'listo' ? 'Listo' : status === 'pausado' ? 'Pausado' : 'En obra'}</span></p>
                    {canEdit && (
                      <p className="mt-2 text-xs text-gray-500">
                        Haz clic en el badge para cambiar el estado
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <Card className="p-4">
        <h3 className="font-medium text-gray-900 mb-3">Leyenda</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <StatusBadge status="listo" />
            <span className="text-sm text-gray-600">Sector completado y listo</span>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status="pausado" />
            <span className="text-sm text-gray-600">Sector pausado o sin iniciar</span>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status="en_obra" />
            <span className="text-sm text-gray-600">Sector actualmente en trabajo</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
