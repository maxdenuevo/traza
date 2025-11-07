import { useState } from 'react';
import { toast } from 'sonner';
import {
  PRESUPUESTO_CATEGORIA_LABELS,
  PRESUPUESTO_CATEGORIA_COLORS,
  PRESUPUESTO_CATEGORIAS,
  formatCurrency,
} from '../../constants';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useProjectStore } from '../../store/useProjectStore';
import {
  usePresupuestoByCategory,
  usePresupuestoSummary,
  useCreatePresupuestoItem,
  useUpdatePresupuestoItem,
  useDeletePresupuestoItem,
} from '../../hooks/usePresupuesto';
import type { PresupuestoItem, PresupuestoCategoria } from '../../types';

export const PresupuestoPage = () => {
  const { currentProject } = useProjectStore();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PresupuestoItem | null>(null);
  const [formData, setFormData] = useState({
    categoria: 'construccion' as PresupuestoCategoria,
    descripcion: '',
    montoEstimado: '',
    montoReal: '',
    porcentajeEjecutado: '0',
  });

  // Fetch data
  const { data: categoryGroups = [], isLoading } = usePresupuestoByCategory(currentProject?.id || '');
  const { data: summary } = usePresupuestoSummary(currentProject?.id || '');

  // Mutations
  const createMutation = useCreatePresupuestoItem();
  const updateMutation = useUpdatePresupuestoItem();
  const deleteMutation = useDeletePresupuestoItem();

  const toggleCategory = (categoria: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoria)) {
        next.delete(categoria);
      } else {
        next.add(categoria);
      }
      return next;
    });
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      categoria: 'construccion',
      descripcion: '',
      montoEstimado: '',
      montoReal: '',
      porcentajeEjecutado: '0',
    });
    setShowAddModal(true);
  };

  const handleEdit = (item: PresupuestoItem) => {
    setEditingItem(item);
    setFormData({
      categoria: item.categoria,
      descripcion: item.descripcion,
      montoEstimado: item.montoEstimado.toString(),
      montoReal: (item.montoReal || 0).toString(),
      porcentajeEjecutado: item.porcentajeEjecutado.toString(),
    });
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.descripcion.trim() || !formData.montoEstimado || !currentProject) return;

    const montoEstimado = parseFloat(formData.montoEstimado);
    const montoReal = parseFloat(formData.montoReal) || 0;
    const porcentajeEjecutado = parseFloat(formData.porcentajeEjecutado) || 0;

    if (isNaN(montoEstimado) || montoEstimado < 0) {
      toast.error('Monto estimado inválido');
      return;
    }

    try {
      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem.id,
          updates: {
            categoria: formData.categoria,
            descripcion: formData.descripcion,
            montoEstimado,
            montoReal,
            porcentajeEjecutado,
          },
        });
        toast.success('Item actualizado');
      } else {
        await createMutation.mutateAsync({
          proyectoId: currentProject.id,
          categoria: formData.categoria,
          descripcion: formData.descripcion,
          montoEstimado,
          montoReal,
          porcentajeEjecutado,
        });
        toast.success('Item creado');
      }
      setShowAddModal(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  const handleDelete = async (id: string, descripcion: string) => {
    if (!confirm(`¿Eliminar "${descripcion}"?`)) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Item eliminado');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <p className="text-esant-gray-600">Selecciona un proyecto</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      {summary && (
        <Card className="p-6">
          <h2 className="font-semibold text-xl text-esant-black mb-1">Resumen Presupuesto</h2>
          <p className="text-sm text-esant-gray-600 mb-4">Estado financiero del proyecto</p>

          <div className="space-y-4">
            {/* Total amounts */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-esant-gray-600 mb-1">Presupuesto Total</p>
                <p className="text-2xl font-bold text-esant-black">{formatCurrency(summary.totalEstimado)}</p>
              </div>
              <div>
                <p className="text-xs text-esant-gray-600 mb-1">Total Gastado</p>
                <p className="text-2xl font-bold text-esant-red">{formatCurrency(summary.totalGastado)}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-esant-gray-600">Progreso</span>
                <span className="font-semibold text-esant-black">{summary.porcentajeGastado.toFixed(1)}%</span>
              </div>
              <div className="bg-esant-gray-200 h-4 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    summary.porcentajeGastado > 100 ? 'bg-esant-red' : 'bg-esant-green'
                  }`}
                  style={{ width: `${Math.min(summary.porcentajeGastado, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-esant-gray-600">
                  Disponible: {formatCurrency(summary.disponible)}
                </span>
                {summary.porcentajeGastado > 100 && (
                  <span className="text-esant-red font-medium">
                    Sobre presupuesto: {formatCurrency(summary.totalGastado - summary.totalEstimado)}
                  </span>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex gap-3 pt-4 border-t border-esant-gray-200">
              <div className="flex items-center gap-2">
                <Icon name="layers" size={16} className="text-esant-gray-600" />
                <span className="text-sm text-esant-gray-800">
                  <span className="font-semibold text-esant-black">{summary.totalItems}</span> items
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Add Button */}
      <Button variant="primary" fullWidth onClick={handleAdd}>
        <Icon name="plus" size={18} />
        Agregar Item
      </Button>

      {/* Categories with items */}
      {categoryGroups.length === 0 ? (
        <Card className="p-8 text-center">
          <Icon name="wallet" size={48} className="text-esant-gray-400 mx-auto mb-3" />
          <p className="text-esant-gray-600 mb-2">No hay items de presupuesto</p>
          <p className="text-sm text-esant-gray-400">Agrega el primer item para comenzar</p>
        </Card>
      ) : (
        categoryGroups.map(({ categoria, items, totalEstimado, totalReal }) => {
          const isExpanded = expandedCategories.has(categoria);
          const colors = PRESUPUESTO_CATEGORIA_COLORS[categoria];
          const porcentaje = totalEstimado > 0 ? (totalReal / totalEstimado) * 100 : 0;

          return (
            <div key={categoria} className="bg-esant-white rounded-xl shadow-esant overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(categoria)}
                className="w-full p-5 flex items-center justify-between btn-touch hover:bg-esant-gray-100 smooth-transition"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-3 h-3 rounded-sm ${colors.indicator}`}></div>
                  <div className="flex flex-col items-start flex-1">
                    <div className="flex items-center gap-2 w-full">
                      <h3 className="font-semibold text-lg text-esant-black">
                        {PRESUPUESTO_CATEGORIA_LABELS[categoria]}
                      </h3>
                      <span className="text-xs text-esant-gray-600">({items.length})</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-esant-gray-600 mt-1">
                      <span>Estimado: {formatCurrency(totalEstimado)}</span>
                      <span>•</span>
                      <span>Real: {formatCurrency(totalReal)}</span>
                      <span>•</span>
                      <span className={porcentaje > 100 ? 'text-esant-red font-medium' : ''}>
                        {porcentaje.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
                <Icon
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  className="text-esant-gray-600"
                />
              </button>

              {/* Items List */}
              {isExpanded && (
                <div className="border-t border-esant-gray-200">
                  {items.map((item) => {
                    const itemPorcentaje = item.montoEstimado > 0 ? ((item.montoReal || 0) / item.montoEstimado) * 100 : 0;
                    const overBudget = itemPorcentaje > 100;

                    return (
                      <div
                        key={item.id}
                        className="p-5 border-b border-esant-gray-200 last:border-b-0"
                      >
                        {/* Item header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-base text-esant-black mb-2">
                              {item.descripcion}
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-esant-gray-600">Estimado</p>
                                <p className="font-semibold text-esant-black">
                                  {formatCurrency(item.montoEstimado)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-esant-gray-600">Real</p>
                                <p className={`font-semibold ${overBudget ? 'text-esant-red' : 'text-esant-black'}`}>
                                  {formatCurrency(item.montoReal || 0)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 hover:bg-esant-gray-100 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Icon name="edit" size={16} className="text-esant-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.descripcion)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Icon name="trash-2" size={16} className="text-esant-red" />
                            </button>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-esant-gray-600">Ejecución</span>
                            <span className={`font-medium ${overBudget ? 'text-esant-red' : 'text-esant-black'}`}>
                              {itemPorcentaje.toFixed(1)}%
                            </span>
                          </div>
                          <div className="bg-esant-gray-200 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                overBudget ? 'bg-esant-red' : 'bg-esant-green'
                              }`}
                              style={{ width: `${Math.min(itemPorcentaje, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingItem ? 'Editar Item' : 'Nuevo Item'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-esant-gray-600 mb-2">Categoría</label>
            <select
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value as PresupuestoCategoria })}
              className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-esant-gray-200 text-esant-black focus:outline-none focus:border-esant-black transition-colors text-base"
            >
              {PRESUPUESTO_CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {PRESUPUESTO_CATEGORIA_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-esant-gray-600 mb-2">Descripción</label>
            <input
              type="text"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Ej: Materiales de construcción"
              className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-esant-gray-200 text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-esant-gray-600 mb-2">Monto Estimado</label>
              <input
                type="number"
                value={formData.montoEstimado}
                onChange={(e) => setFormData({ ...formData, montoEstimado: e.target.value })}
                placeholder="0"
                className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-esant-gray-200 text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-esant-gray-600 mb-2">Monto Real</label>
              <input
                type="number"
                value={formData.montoReal}
                onChange={(e) => setFormData({ ...formData, montoReal: e.target.value })}
                placeholder="0"
                className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-esant-gray-200 text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors text-base"
              />
            </div>
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={handleSubmit}
            disabled={!formData.descripcion.trim() || !formData.montoEstimado}
          >
            {editingItem ? 'Actualizar' : 'Crear'} Item
          </Button>
        </div>
      </Modal>
    </div>
  );
};
