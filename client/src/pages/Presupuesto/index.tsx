import { useState, useMemo } from 'react';
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
import { useProgramaStore, SECTORS } from '../../store/useProgramaStore';
import {
  usePresupuestoByCategory,
  usePresupuestoSummary,
  useCreatePresupuestoItem,
  useUpdatePresupuestoItem,
  useDeletePresupuestoItem,
} from '../../hooks/usePresupuesto';
import type { PresupuestoItem, PresupuestoCategoria } from '../../types';

// Main budget categories (not adicionales)
const MAIN_CATEGORIES = ['servicio', 'mano_de_obra', 'materiales'];

export const PresupuestoPage = () => {
  const { currentProject } = useProjectStore();
  const { getSectorData } = useProgramaStore();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['proyecto']));
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PresupuestoItem | null>(null);
  const [formData, setFormData] = useState({
    categoria: 'materiales' as PresupuestoCategoria,
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

  // Separate main budget from adicionales
  const { mainBudget, adicionales } = useMemo(() => {
    const main: typeof categoryGroups = [];
    const extras: typeof categoryGroups = [];

    categoryGroups.forEach(group => {
      if (group.categoria === 'adicionales') {
        extras.push(group);
      } else if (MAIN_CATEGORIES.includes(group.categoria)) {
        main.push(group);
      } else {
        // Map old categories to new ones for display
        main.push(group);
      }
    });

    return { mainBudget: main, adicionales: extras };
  }, [categoryGroups]);

  // Calculate totals for main budget
  const mainBudgetTotals = useMemo(() => {
    const estimado = mainBudget.reduce((sum, g) => sum + g.totalEstimado, 0);
    const real = mainBudget.reduce((sum, g) => sum + g.totalReal, 0);
    return { estimado, real };
  }, [mainBudget]);

  // Calculate totals for adicionales
  const adicionalesTotals = useMemo(() => {
    const estimado = adicionales.reduce((sum, g) => sum + g.totalEstimado, 0);
    const real = adicionales.reduce((sum, g) => sum + g.totalReal, 0);
    return { estimado, real };
  }, [adicionales]);

  // Get sector budget data from programa store
  const sectorBudgets = useMemo(() => {
    if (!currentProject) return [];

    return SECTORS.map(sector => {
      const data = getSectorData(currentProject.id, sector);
      return {
        sector,
        estimado: data?.valorEstimado || 0,
        actual: data?.valorActual || 0,
      };
    }).filter(s => s.estimado > 0 || s.actual > 0);
  }, [currentProject, getSectorData]);

  const sectorTotals = useMemo(() => {
    const estimado = sectorBudgets.reduce((sum, s) => sum + s.estimado, 0);
    const actual = sectorBudgets.reduce((sum, s) => sum + s.actual, 0);
    return { estimado, actual };
  }, [sectorBudgets]);

  // Grand total
  const grandTotal = useMemo(() => {
    const estimado = mainBudgetTotals.estimado + adicionalesTotals.estimado;
    const real = mainBudgetTotals.real + adicionalesTotals.real;
    return { estimado, real };
  }, [mainBudgetTotals, adicionalesTotals]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      categoria: 'materiales',
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
      {/* Header */}
      <Card className="p-6">
        <h2 className="font-semibold text-xl text-esant-black mb-1">Presupuesto / Gastos</h2>
        <p className="text-sm text-esant-gray-600">Control financiero del proyecto</p>
      </Card>

      {/* 1. PROYECTO PRESUPUESTADO */}
      <div className="bg-esant-white rounded-xl shadow-esant overflow-hidden">
        <button
          onClick={() => toggleSection('proyecto')}
          className="w-full p-5 flex items-center justify-between btn-touch hover:bg-esant-gray-100 smooth-transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-sm bg-esant-black"></div>
            <div>
              <h3 className="font-semibold text-lg text-esant-black text-left">Proyecto presupuestado</h3>
              <div className="flex items-center gap-3 text-xs text-esant-gray-600 mt-1">
                <span>Estimado: {formatCurrency(mainBudgetTotals.estimado)}</span>
                <span>•</span>
                <span className={mainBudgetTotals.real > mainBudgetTotals.estimado ? 'text-esant-red font-medium' : ''}>
                  Gastado: {formatCurrency(mainBudgetTotals.real)}
                </span>
              </div>
            </div>
          </div>
          <Icon
            name={expandedSections.has('proyecto') ? 'chevron-up' : 'chevron-down'}
            size={20}
            className="text-esant-gray-600"
          />
        </button>

        {expandedSections.has('proyecto') && (
          <div className="border-t border-esant-gray-200 p-4 space-y-3">
            {/* Main categories breakdown */}
            {mainBudget.map(({ categoria, items, totalEstimado, totalReal }) => (
              <div key={categoria} className="flex items-center justify-between py-2 border-b border-esant-gray-100 last:border-0">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${PRESUPUESTO_CATEGORIA_COLORS[categoria]?.indicator || 'bg-esant-gray-400'}`}></div>
                  <span className="text-sm text-esant-gray-800">{PRESUPUESTO_CATEGORIA_LABELS[categoria]}</span>
                  <span className="text-xs text-esant-gray-500">({items.length})</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-esant-gray-600">{formatCurrency(totalEstimado)} est</span>
                  <span className={totalReal > totalEstimado ? 'text-esant-red font-medium' : 'text-esant-black font-medium'}>
                    {formatCurrency(totalReal)} real
                  </span>
                </div>
              </div>
            ))}

            {mainBudget.length === 0 && (
              <p className="text-sm text-esant-gray-500 text-center py-2">Sin items de presupuesto base</p>
            )}

            {/* Total row */}
            <div className="flex items-center justify-between pt-3 border-t border-esant-gray-300">
              <span className="font-semibold text-esant-black">Total estimado</span>
              <span className="font-bold text-esant-black">{formatCurrency(mainBudgetTotals.estimado)}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. ESTADO PROGRAMA (por sector) */}
      {sectorBudgets.length > 0 && (
        <div className="bg-esant-white rounded-xl shadow-esant overflow-hidden">
          <button
            onClick={() => toggleSection('sectores')}
            className="w-full p-5 flex items-center justify-between btn-touch hover:bg-esant-gray-100 smooth-transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-sm bg-esant-gray-500"></div>
              <div>
                <h3 className="font-semibold text-lg text-esant-black text-left">Estado programa</h3>
                <div className="flex items-center gap-3 text-xs text-esant-gray-600 mt-1">
                  <span>Estimado: {formatCurrency(sectorTotals.estimado)}</span>
                  <span>•</span>
                  <span className={sectorTotals.actual > sectorTotals.estimado ? 'text-esant-red font-medium' : ''}>
                    Actual: {formatCurrency(sectorTotals.actual)}
                  </span>
                </div>
              </div>
            </div>
            <Icon
              name={expandedSections.has('sectores') ? 'chevron-up' : 'chevron-down'}
              size={20}
              className="text-esant-gray-600"
            />
          </button>

          {expandedSections.has('sectores') && (
            <div className="border-t border-esant-gray-200 p-4 space-y-2">
              {sectorBudgets.map(({ sector, estimado, actual }) => {
                const overBudget = actual > estimado;
                return (
                  <div key={sector} className="flex items-center justify-between py-2 border-b border-esant-gray-100 last:border-0">
                    <span className="text-sm text-esant-gray-800">{sector}</span>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-esant-gray-600">{formatCurrency(estimado)}</span>
                      <span className="text-esant-gray-400">/</span>
                      <span className={overBudget ? 'text-esant-red font-medium' : 'text-esant-black'}>
                        {formatCurrency(actual)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. ADICIONALES AL PROGRAMA */}
      <div className="bg-esant-white rounded-xl shadow-esant overflow-hidden">
        <button
          onClick={() => toggleSection('adicionales')}
          className="w-full p-5 flex items-center justify-between btn-touch hover:bg-esant-gray-100 smooth-transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-sm bg-esant-red"></div>
            <div>
              <h3 className="font-semibold text-lg text-esant-black text-left">Adicionales al programa</h3>
              <div className="flex items-center gap-3 text-xs text-esant-gray-600 mt-1">
                <span>Estimado: {formatCurrency(adicionalesTotals.estimado)}</span>
                <span>•</span>
                <span className={adicionalesTotals.real > adicionalesTotals.estimado ? 'text-esant-red font-medium' : ''}>
                  Gastado: {formatCurrency(adicionalesTotals.real)}
                </span>
              </div>
            </div>
          </div>
          <Icon
            name={expandedSections.has('adicionales') ? 'chevron-up' : 'chevron-down'}
            size={20}
            className="text-esant-gray-600"
          />
        </button>

        {expandedSections.has('adicionales') && (
          <div className="border-t border-esant-gray-200">
            {adicionales.length > 0 ? (
              adicionales.flatMap(({ items }) => items).map((item) => {
                const overBudget = (item.montoReal || 0) > item.montoEstimado;
                return (
                  <div
                    key={item.id}
                    className="p-4 border-b border-esant-gray-100 last:border-0 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <span className="text-sm text-esant-gray-800">{item.descripcion}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-esant-gray-600">{formatCurrency(item.montoEstimado)}</span>
                      <span className="text-esant-gray-400">/</span>
                      <span className={overBudget ? 'text-esant-red font-medium' : 'text-esant-black'}>
                        {formatCurrency(item.montoReal || 0)}
                      </span>
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1 hover:bg-esant-gray-100 rounded transition-colors"
                      >
                        <Icon name="edit" size={14} className="text-esant-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.descripcion)}
                        className="p-1 hover:bg-red-50 rounded transition-colors"
                      >
                        <Icon name="trash-2" size={14} className="text-esant-red" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-esant-gray-500 text-center py-4">Sin adicionales registrados</p>
            )}
          </div>
        )}
      </div>

      {/* 4. TOTAL FINAL */}
      <Card className="p-6 bg-esant-gray-900 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Total Final</h3>
            <p className="text-sm text-white/60">Presupuesto + Adicionales</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{formatCurrency(grandTotal.real)}</p>
            <p className="text-sm text-white/60">de {formatCurrency(grandTotal.estimado)} estimado</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="bg-white/20 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                grandTotal.real > grandTotal.estimado ? 'bg-esant-red' : 'bg-white'
              }`}
              style={{ width: `${Math.min((grandTotal.real / grandTotal.estimado) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-2 text-white/60">
            <span>{grandTotal.estimado > 0 ? ((grandTotal.real / grandTotal.estimado) * 100).toFixed(1) : 0}% ejecutado</span>
            {grandTotal.real > grandTotal.estimado && (
              <span className="text-red-300">
                +{formatCurrency(grandTotal.real - grandTotal.estimado)} sobre presupuesto
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Add Button */}
      <Button variant="primary" fullWidth onClick={handleAdd}>
        <Icon name="plus" size={18} />
        Agregar Item
      </Button>

      {/* All Items (detailed view) */}
      {categoryGroups.length > 0 && (
        <div className="bg-esant-white rounded-xl shadow-esant overflow-hidden">
          <button
            onClick={() => toggleSection('detalle')}
            className="w-full p-5 flex items-center justify-between btn-touch hover:bg-esant-gray-100 smooth-transition"
          >
            <div className="flex items-center gap-3">
              <Icon name="list" size={18} className="text-esant-gray-600" />
              <h3 className="font-semibold text-lg text-esant-black">Ver detalle por categoría</h3>
              <span className="text-xs text-esant-gray-500">({summary?.totalItems || 0} items)</span>
            </div>
            <Icon
              name={expandedSections.has('detalle') ? 'chevron-up' : 'chevron-down'}
              size={20}
              className="text-esant-gray-600"
            />
          </button>

          {expandedSections.has('detalle') && (
            <div className="border-t border-esant-gray-200">
              {categoryGroups.map(({ categoria, items, totalEstimado, totalReal }) => {
                const colors = PRESUPUESTO_CATEGORIA_COLORS[categoria];
                const porcentaje = totalEstimado > 0 ? (totalReal / totalEstimado) * 100 : 0;

                return (
                  <div key={categoria} className="border-b border-esant-gray-100 last:border-0">
                    <div className="p-4 bg-esant-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${colors?.indicator || 'bg-esant-gray-400'}`}></div>
                        <span className="font-medium text-esant-black">
                          {PRESUPUESTO_CATEGORIA_LABELS[categoria]}
                        </span>
                        <span className="text-xs text-esant-gray-500">({items.length})</span>
                      </div>
                      <div className="text-xs text-esant-gray-600">
                        {formatCurrency(totalReal)} / {formatCurrency(totalEstimado)}
                        <span className={`ml-2 ${porcentaje > 100 ? 'text-esant-red font-medium' : ''}`}>
                          ({porcentaje.toFixed(0)}%)
                        </span>
                      </div>
                    </div>

                    {items.map((item) => {
                      const itemPorcentaje = item.montoEstimado > 0 ? ((item.montoReal || 0) / item.montoEstimado) * 100 : 0;
                      const overBudget = itemPorcentaje > 100;

                      return (
                        <div key={item.id} className="p-4 border-t border-esant-gray-100 flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-esant-gray-800 truncate">{item.descripcion}</p>
                          </div>
                          <div className="flex items-center gap-3 text-sm ml-4">
                            <span className="text-esant-gray-600">{formatCurrency(item.montoEstimado)}</span>
                            <span className={overBudget ? 'text-esant-red font-medium' : 'text-esant-black'}>
                              {formatCurrency(item.montoReal || 0)}
                            </span>
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1 hover:bg-esant-gray-100 rounded transition-colors"
                            >
                              <Icon name="edit" size={14} className="text-esant-gray-500" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.descripcion)}
                              className="p-1 hover:bg-red-50 rounded transition-colors"
                            >
                              <Icon name="trash-2" size={14} className="text-esant-red" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
              placeholder="Ej: Techo terraza adicional"
              className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-esant-gray-200 text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
