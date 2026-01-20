import { useState } from 'react';
import { toast } from 'sonner';
import { PENDIENTE_ESTADO_COLORS, generateWhatsAppLink } from '../../constants';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Tabs } from '../../components/common/Tabs';
import { useProjectStore } from '../../store/useProjectStore';
import {
  usePendientesByArea,
  usePendientesByResponsable,
  useUpdatePendienteEstado,
  useDeletePendiente,
} from '../../hooks/usePendientes';
import type { Pendiente, PendienteEstado } from '../../types';

type ViewMode = 'sector' | 'responsable';

const VIEW_TABS = [
  { id: 'sector', label: 'Por Sector' },
  { id: 'responsable', label: 'Por Responsable' },
];

export const PendientesPage = () => {
  const { currentProject } = useProjectStore();
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('sector');

  // Fetch data
  const { data: areasPendientes = [], isLoading: isLoadingAreas } = usePendientesByArea(currentProject?.id || '');
  const { data: responsablesPendientes = [], isLoading: isLoadingResponsables } = usePendientesByResponsable(currentProject?.id || '');

  const isLoading = isLoadingAreas || isLoadingResponsables;

  // Mutations
  const updateEstadoMutation = useUpdatePendienteEstado();
  const deleteMutation = useDeletePendiente();

  const toggleArea = (area: string) => {
    setExpandedAreas((prev) => {
      const next = new Set(prev);
      if (next.has(area)) {
        next.delete(area);
      } else {
        next.add(area);
      }
      return next;
    });
  };

  const handleEstadoChange = async (pendiente: Pendiente, nuevoEstado: PendienteEstado) => {
    try {
      await updateEstadoMutation.mutateAsync({ id: pendiente.id, estado: nuevoEstado });
      toast.success(`Estado actualizado a "${nuevoEstado}"`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar estado';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este pendiente?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Pendiente eliminado');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar';
      toast.error(errorMessage);
    }
  };

  const handleWhatsApp = (pendiente: Pendiente) => {
    const telefono = pendiente.encargado?.telefono;

    if (!telefono) {
      toast.error('Este encargado no tiene teléfono registrado');
      return;
    }

    const nombreEncargado = pendiente.encargado?.nombre || 'encargado';
    const mensaje = `Hola ${nombreEncargado}, te escribo sobre la tarea pendiente: "${pendiente.tarea}" en ${pendiente.area}`;
    const url = generateWhatsAppLink(telefono, mensaje);
    window.open(url, '_blank');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // No project selected
  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <p className="text-esant-gray-600">Selecciona un proyecto para ver los pendientes</p>
      </div>
    );
  }

  // No pendientes
  if (areasPendientes.length === 0 && responsablesPendientes.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-esant-gray-600 mb-2">No hay pendientes en este proyecto</p>
        <p className="text-sm text-esant-gray-400">Los pendientes se crean desde las visitas</p>
      </Card>
    );
  }

  // Render pendiente item (shared between views)
  const renderPendienteItem = (pendiente: Pendiente, showArea = false) => (
    <div
      key={pendiente.id}
      className="p-5 border-b border-esant-gray-200 last:border-b-0"
    >
      {/* Pendiente Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-base text-esant-black mb-1">
            {pendiente.tarea}
          </h4>
          {pendiente.descripcion && (
            <p className="text-sm text-esant-gray-600">{pendiente.descripcion}</p>
          )}
          {showArea && pendiente.area && (
            <p className="text-xs text-esant-gray-400 mt-1">
              <Icon name="map-pin" size={12} className="inline mr-1" />
              {pendiente.area}
            </p>
          )}
        </div>
        <button
          onClick={() => handleDelete(pendiente.id)}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Icon name="trash-2" size={16} className="text-esant-red" />
        </button>
      </div>

      {/* Estado Selector */}
      <div className="flex flex-wrap gap-2 mb-3">
        {(['pausa', 'en_obra', 'terminado'] as PendienteEstado[]).map((estado) => {
          const isActive = pendiente.estado === estado;
          const colors = PENDIENTE_ESTADO_COLORS[estado];

          return (
            <button
              key={estado}
              onClick={() => handleEstadoChange(pendiente, estado)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? `${colors.bg} ${colors.text} shadow-sm`
                  : 'bg-esant-gray-100 text-esant-gray-600 hover:bg-esant-gray-200'
              }`}
            >
              {estado.replace('_', ' ')}
            </button>
          );
        })}
      </div>

      {/* Encargado & WhatsApp */}
      {pendiente.encargado && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-esant-gray-600">
            <Icon name="user" size={14} />
            <span>
              {pendiente.encargado.nombre}
              {pendiente.encargado.especialidad && ` - ${pendiente.encargado.especialidad}`}
            </span>
          </div>
          <Button
            variant="whatsapp"
            size="sm"
            onClick={() => handleWhatsApp(pendiente)}
            className="w-full"
          >
            <Icon name="message-circle" size={16} />
            Contactar por WhatsApp
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header con estadísticas */}
      <Card className="p-6">
        <h2 className="font-semibold text-xl text-esant-black mb-1">Pendientes</h2>
        <p className="text-sm text-esant-gray-600 mb-4">
          {viewMode === 'sector' ? 'Organizado por áreas' : 'Organizado por responsable'}
        </p>

        {/* Tabs */}
        <Tabs
          tabs={VIEW_TABS}
          activeTab={viewMode}
          onChange={(id) => setViewMode(id as ViewMode)}
        />

        {/* Quick stats */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-esant-gray-200">
          {Object.entries(PENDIENTE_ESTADO_COLORS).map(([key, colors]) => {
            const count = areasPendientes.reduce(
              (acc, area) => acc + area.pendientes.filter((p) => p.estado === key).length,
              0
            );
            return (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-sm ${colors.indicator}`}></div>
                <span className="text-sm text-esant-gray-800">
                  <span className="font-semibold text-esant-black">{count}</span>{' '}
                  {key.replace('_', ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Vista por Sector */}
      {viewMode === 'sector' && areasPendientes.map(({ area, pendientes }) => {
        const isExpanded = expandedAreas.has(area);

        return (
          <div key={area} className="bg-esant-white rounded-xl shadow-esant overflow-hidden">
            {/* Área Header - Colapsable */}
            <button
              onClick={() => toggleArea(area)}
              className="w-full p-5 flex items-center justify-between btn-touch hover:bg-esant-gray-100 smooth-transition"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-start">
                  <h3 className="font-semibold text-lg text-esant-black">{area}</h3>
                  <span className="text-sm text-esant-gray-600">{pendientes.length} pendientes</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-esant-red text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {pendientes.length}
                </span>
                <Icon
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  className="text-esant-gray-600"
                />
              </div>
            </button>

            {/* Pendientes List - Colapsable */}
            {isExpanded && (
              <div className="border-t border-esant-gray-200">
                {pendientes.map((pendiente) => renderPendienteItem(pendiente, false))}
              </div>
            )}
          </div>
        );
      })}

      {/* Vista por Responsable */}
      {viewMode === 'responsable' && responsablesPendientes.map(({ encargadoId, encargadoNombre, encargado, pendientes }) => {
        const isExpanded = expandedAreas.has(encargadoId);

        return (
          <div key={encargadoId} className="bg-esant-white rounded-xl shadow-esant overflow-hidden">
            {/* Responsable Header - Colapsable */}
            <button
              onClick={() => toggleArea(encargadoId)}
              className="w-full p-5 flex items-center justify-between btn-touch hover:bg-esant-gray-100 smooth-transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-esant-gray-200 flex items-center justify-center">
                  <Icon name="user" size={20} className="text-esant-gray-600" />
                </div>
                <div className="flex flex-col items-start">
                  <h3 className="font-semibold text-lg text-esant-black">{encargadoNombre}</h3>
                  <span className="text-sm text-esant-gray-600">
                    {encargado?.especialidad || 'Sin especialidad'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-esant-red text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {pendientes.length}
                </span>
                <Icon
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  className="text-esant-gray-600"
                />
              </div>
            </button>

            {/* Pendientes List - Colapsable */}
            {isExpanded && (
              <div className="border-t border-esant-gray-200">
                {pendientes.map((pendiente) => renderPendienteItem(pendiente, true))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
