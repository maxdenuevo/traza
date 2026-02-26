import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { Icon } from '../common/Icon';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { useProjectStore } from '../../store/useProjectStore';
import { useAuthStore } from '../../store/useAuthStore';
import { SECTORS } from '../../store/useProgramaStore';
import {
  useCheckboxItemsWithStatus,
  useCheckboxStats,
  useToggleCheckbox,
  useCreateCheckboxItem,
} from '../../hooks/useCheckbox';
import type { Periodicidad } from '../../types';

interface CheckboxSectionProps {
  fecha: Date;
  defaultExpanded?: boolean;
}

const PERIODICIDAD_OPTIONS: { value: Periodicidad; label: string }[] = [
  { value: 'diario', label: 'Diario' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'mensual', label: 'Mensual' },
];

export const CheckboxSection = ({ fecha, defaultExpanded = false }: CheckboxSectionProps) => {
  const { currentProject } = useProjectStore();
  const { user } = useAuthStore();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({
    descripcion: '',
    sectorNombre: '',
    periodicidad: 'diario' as Periodicidad,
  });

  const proyectoId = currentProject?.id || '';

  const { data: checkboxItems = [], isLoading } = useCheckboxItemsWithStatus(proyectoId, fecha);
  const { data: checkboxStats } = useCheckboxStats(proyectoId, fecha);
  const toggleCheckboxMutation = useToggleCheckbox();
  const createItemMutation = useCreateCheckboxItem();

  const handleToggleCheckbox = async (itemId: string) => {
    if (!user || !currentProject) return;
    try {
      await toggleCheckboxMutation.mutateAsync({ itemId, fecha, userId: user.id, proyectoId: currentProject.id });
    } catch {
      toast.error('Error al actualizar');
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
    } catch {
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

  return (
    <>
      <Card className="overflow-hidden">
        {/* Collapsible Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-esant-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Icon name="check-square" size={20} className="text-esant-gray-600" />
            <h3 className="font-semibold text-esant-black">Checkbox</h3>
            {checkboxStats && (
              <span className="text-xs text-esant-gray-500">
                {checkboxStats.completados}/{checkboxStats.total}
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
                {checkboxStats && checkboxStats.total > 0 && (
                  <div className="px-4 py-3 bg-esant-gray-50 border-b border-esant-gray-200 flex items-center justify-between">
                    <span className="text-sm text-esant-gray-600">
                      <span className="font-semibold text-green-600">{checkboxStats.completados}</span>
                      /{checkboxStats.total} completados
                    </span>
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
              </>
            )}
          </div>
        )}
      </Card>

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
    </>
  );
};
