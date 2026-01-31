import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { Icon } from '../common/Icon';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Tabs } from '../common/Tabs';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useProjectStore } from '../../store/useProjectStore';
import { useAuthStore } from '../../store/useAuthStore';
import { SECTORS } from '../../store/useProgramaStore';
import {
  useCheckboxItemsWithStatus,
  useCheckboxStats,
  useToggleCheckbox,
  useCreateCheckboxItem,
} from '../../hooks/useCheckbox';
import {
  useTrabajadoresWithStatus,
  useAsistenciaStats,
  useToggleAsistencia,
  useMarkAllPresent,
} from '../../hooks/useAsistencia';
import type { Periodicidad } from '../../types';

interface DailyOperationsProps {
  fecha: Date;
}

const OPERATION_TABS = [
  { id: 'checkbox', label: 'Verificación' },
  { id: 'asistencia', label: 'Asistencia' },
];

const PERIODICIDAD_OPTIONS: { value: Periodicidad; label: string }[] = [
  { value: 'diario', label: 'Diario' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'mensual', label: 'Mensual' },
];

export const DailyOperations = ({ fecha }: DailyOperationsProps) => {
  const { currentProject } = useProjectStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'checkbox' | 'asistencia'>('checkbox');
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({
    descripcion: '',
    sectorNombre: '',
    periodicidad: 'diario' as Periodicidad,
  });

  const proyectoId = currentProject?.id || '';

  // Checkbox data
  const { data: checkboxItems = [], isLoading: loadingCheckbox } = useCheckboxItemsWithStatus(proyectoId, fecha);
  const { data: checkboxStats } = useCheckboxStats(proyectoId, fecha);
  const toggleCheckboxMutation = useToggleCheckbox();
  const createItemMutation = useCreateCheckboxItem();

  // Asistencia data
  const { data: trabajadores = [], isLoading: loadingAsistencia } = useTrabajadoresWithStatus(proyectoId, fecha);
  const { data: asistenciaStats } = useAsistenciaStats(proyectoId, fecha);
  const toggleAsistenciaMutation = useToggleAsistencia();
  const markAllPresentMutation = useMarkAllPresent();

  const handleToggleCheckbox = async (itemId: string) => {
    if (!user || !currentProject) return;

    try {
      await toggleCheckboxMutation.mutateAsync({ itemId, fecha, userId: user.id, proyectoId: currentProject.id });
    } catch (err) {
      toast.error('Error al actualizar');
    }
  };

  const handleToggleAsistencia = async (trabajadorId: string) => {
    if (!user || !currentProject) return;

    try {
      await toggleAsistenciaMutation.mutateAsync({
        proyectoId: currentProject.id,
        trabajadorId,
        fecha,
        userId: user.id,
      });
    } catch (err) {
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
    } catch (err) {
      toast.error('Error al marcar asistencia');
    }
  };

  const handleCreateItem = async () => {
    if (!newItem.descripcion.trim() || !currentProject) return;

    try {
      await createItemMutation.mutateAsync({
        proyectoId: currentProject.id,
        descripcion: newItem.descripcion,
        sectorNombre: newItem.sectorNombre || undefined,
        periodicidad: newItem.periodicidad,
      });
      toast.success('Item de verificación creado');
      setShowAddItem(false);
      setNewItem({ descripcion: '', sectorNombre: '', periodicidad: 'diario' });
    } catch (err) {
      toast.error('Error al crear item');
    }
  };

  // Group checkbox items by sector
  const groupedCheckboxItems = checkboxItems.reduce((acc, item) => {
    const sector = item.sectorNombre || 'General';
    if (!acc[sector]) acc[sector] = [];
    acc[sector].push(item);
    return acc;
  }, {} as Record<string, typeof checkboxItems>);

  if (!currentProject) return null;

  const isLoading = loadingCheckbox || loadingAsistencia;

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-esant-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-esant-black">Control Diario</h3>
          <span className="text-sm text-esant-gray-500">
            {format(fecha, "d 'de' MMMM", { locale: es })}
          </span>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={OPERATION_TABS}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as 'checkbox' | 'asistencia')}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Checkbox Tab */}
          {activeTab === 'checkbox' && (
            <div>
              {/* Stats */}
              {checkboxStats && (
                <div className="px-4 py-3 bg-esant-gray-50 border-b border-esant-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-esant-gray-600">
                      <span className="font-semibold text-green-600">{checkboxStats.completados}</span>
                      /{checkboxStats.total} completados
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-esant-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${checkboxStats.porcentaje}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-esant-gray-700">
                      {checkboxStats.porcentaje}%
                    </span>
                  </div>
                </div>
              )}

              {/* Items by sector */}
              {Object.entries(groupedCheckboxItems).map(([sector, items]) => (
                <div key={sector} className="border-b border-esant-gray-100 last:border-b-0">
                  <div className="px-4 py-2 bg-esant-gray-50">
                    <span className="text-xs font-medium text-esant-gray-500 uppercase">
                      {sector}
                    </span>
                  </div>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleToggleCheckbox(item.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-esant-gray-50 transition-colors text-left"
                    >
                      <div
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                          item.completado
                            ? 'bg-green-500 border-green-500'
                            : 'border-esant-gray-300'
                        }`}
                      >
                        {item.completado && (
                          <Icon name="check" size={14} className="text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${item.completado ? 'text-esant-gray-400 line-through' : 'text-esant-gray-800'}`}>
                          {item.descripcion}
                        </p>
                        <span className="text-xs text-esant-gray-400 capitalize">
                          {item.periodicidad}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ))}

              {checkboxItems.length === 0 && (
                <div className="py-8 text-center text-esant-gray-500">
                  <Icon name="check-square" size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay items de verificación</p>
                </div>
              )}

              {/* Add button */}
              <div className="p-4 border-t border-esant-gray-200">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowAddItem(true)}
                >
                  <Icon name="plus" size={16} />
                  Agregar item de verificación
                </Button>
              </div>
            </div>
          )}

          {/* Asistencia Tab */}
          {activeTab === 'asistencia' && (
            <div>
              {/* Stats */}
              {asistenciaStats && (
                <div className="px-4 py-3 bg-esant-gray-50 border-b border-esant-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-esant-gray-600">
                      <span className="font-semibold text-green-600">{asistenciaStats.presentes}</span>
                      /{asistenciaStats.total} presentes
                    </span>
                  </div>
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
            </div>
          )}
        </>
      )}

      {/* Add Checkbox Item Modal */}
      <Modal
        isOpen={showAddItem}
        onClose={() => setShowAddItem(false)}
        title="Nuevo Item de Verificación"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-esant-gray-600 mb-1">
              Descripción *
            </label>
            <input
              type="text"
              value={newItem.descripcion}
              onChange={(e) => setNewItem({ ...newItem, descripcion: e.target.value })}
              placeholder="Ej: Verificar limpieza de obra"
              className="w-full px-3 py-2 border-2 border-esant-gray-200 rounded-lg focus:outline-none focus:border-esant-black transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-esant-gray-600 mb-1">
              Sector (opcional)
            </label>
            <select
              value={newItem.sectorNombre}
              onChange={(e) => setNewItem({ ...newItem, sectorNombre: e.target.value })}
              className="w-full px-3 py-2 border-2 border-esant-gray-200 rounded-lg focus:outline-none focus:border-esant-black transition-colors"
            >
              <option value="">General</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-esant-gray-600 mb-1">
              Periodicidad
            </label>
            <select
              value={newItem.periodicidad}
              onChange={(e) => setNewItem({ ...newItem, periodicidad: e.target.value as Periodicidad })}
              className="w-full px-3 py-2 border-2 border-esant-gray-200 rounded-lg focus:outline-none focus:border-esant-black transition-colors"
            >
              {PERIODICIDAD_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={handleCreateItem}
            disabled={!newItem.descripcion.trim() || createItemMutation.isPending}
          >
            {createItemMutation.isPending ? 'Creando...' : 'Crear Item'}
          </Button>
        </div>
      </Modal>
    </Card>
  );
};
