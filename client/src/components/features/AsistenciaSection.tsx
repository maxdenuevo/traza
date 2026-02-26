import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { Icon } from '../common/Icon';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useProjectStore } from '../../store/useProjectStore';
import { useAuthStore } from '../../store/useAuthStore';
import {
  useTrabajadoresWithStatus,
  useAsistenciaStats,
  useToggleAsistencia,
  useMarkAllPresent,
} from '../../hooks/useAsistencia';

interface AsistenciaSectionProps {
  fecha: Date;
  defaultExpanded?: boolean;
}

export const AsistenciaSection = ({ fecha, defaultExpanded = false }: AsistenciaSectionProps) => {
  const { currentProject } = useProjectStore();
  const { user } = useAuthStore();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const proyectoId = currentProject?.id || '';

  const { data: trabajadores = [], isLoading } = useTrabajadoresWithStatus(proyectoId, fecha);
  const { data: asistenciaStats } = useAsistenciaStats(proyectoId, fecha);
  const toggleAsistenciaMutation = useToggleAsistencia();
  const markAllPresentMutation = useMarkAllPresent();

  const handleToggleAsistencia = async (trabajadorId: string) => {
    if (!user || !currentProject) return;
    try {
      await toggleAsistenciaMutation.mutateAsync({
        proyectoId: currentProject.id,
        trabajadorId,
        fecha,
        userId: user.id,
      });
    } catch {
      toast.error('Error al actualizar asistencia');
    }
  };

  const handleMarkAllPresent = async () => {
    if (!user || !currentProject) return;
    try {
      await markAllPresentMutation.mutateAsync({
        proyectoId: currentProject.id,
        fecha,
        userId: user.id,
      });
      toast.success('Todos marcados como presentes');
    } catch {
      toast.error('Error al marcar asistencia');
    }
  };

  if (!currentProject) return null;

  return (
    <Card className="overflow-hidden">
      {/* Collapsible Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-esant-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon name="users" size={20} className="text-esant-gray-600" />
          <h3 className="font-semibold text-esant-black">Asistencia</h3>
          {asistenciaStats && (
            <span className="text-xs text-esant-gray-500">
              {asistenciaStats.presentes}/{asistenciaStats.total}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-esant-gray-500">
            {format(fecha, "d MMM", { locale: es })}
          </span>
          <Icon
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            className="text-esant-gray-400"
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-esant-gray-200">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin w-5 h-5 border-2 border-esant-gray-300 border-t-esant-black rounded-full" />
            </div>
          ) : (
            <>
              {/* Stats */}
              {asistenciaStats && asistenciaStats.total > 0 && (
                <div className="px-4 py-3 bg-esant-gray-50 border-b border-esant-gray-200 flex items-center justify-between">
                  <span className="text-sm text-esant-gray-600">
                    <span className="font-semibold text-green-600">{asistenciaStats.presentes}</span>
                    /{asistenciaStats.total} presentes
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleMarkAllPresent}
                    disabled={markAllPresentMutation.isPending}
                  >
                    Marcar todos
                  </Button>
                </div>
              )}

              {/* Workers list */}
              <div className="divide-y divide-esant-gray-100">
                {trabajadores.map((t) => (
                  <button
                    key={t.trabajadorId}
                    onClick={() => handleToggleAsistencia(t.trabajadorId)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-esant-gray-50 transition-colors text-left"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        t.presente
                          ? 'bg-green-100'
                          : 'bg-esant-gray-100'
                      }`}
                    >
                      <Icon
                        name={t.presente ? 'user-check' : 'user'}
                        size={20}
                        className={t.presente ? 'text-green-600' : 'text-esant-gray-400'}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-esant-gray-800">
                        {t.nombre}
                      </p>
                      {t.especialidad && (
                        <span className="text-xs text-esant-gray-500">
                          {t.especialidad}
                        </span>
                      )}
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        t.presente
                          ? 'bg-green-100 text-green-700'
                          : 'bg-esant-gray-100 text-esant-gray-500'
                      }`}
                    >
                      {t.presente ? 'Presente' : 'Ausente'}
                    </div>
                  </button>
                ))}
              </div>

              {trabajadores.length === 0 && (
                <div className="py-8 text-center text-esant-gray-500">
                  <Icon name="users" size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay trabajadores registrados</p>
                  <p className="text-xs text-esant-gray-400 mt-1">
                    Agrega trabajadores al equipo para registrar asistencia
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
};
