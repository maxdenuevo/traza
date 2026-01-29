import { useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { FAB } from '../../components/common/FAB';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Tabs } from '../../components/common/Tabs';
import { useProjectStore } from '../../store/useProjectStore';
import {
  useMaterialesBySector,
  useMaterialesByProveedor,
  useCreateMaterial,
  useUpdateMaterial,
  useDeleteMaterial,
  useMaterialesStats,
} from '../../hooks/useMateriales';
import { AREAS_COMUNES } from '../../constants';
import type { Material, MaterialEstado } from '../../types';

type ViewMode = 'sector' | 'proveedor';

const VIEW_TABS = [
  { id: 'sector', label: 'Por Sector' },
  { id: 'proveedor', label: 'Por Proveedor' },
];

const ESTADO_COLORS: Record<MaterialEstado, { bg: string; text: string; indicator: string }> = {
  disponible: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    indicator: 'bg-green-500',
  },
  agotado: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    indicator: 'bg-red-500',
  },
  por_comprar: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    indicator: 'bg-yellow-500',
  },
};

const ESTADO_LABELS: Record<MaterialEstado, string> = {
  disponible: 'Disponible',
  agotado: 'Agotado',
  por_comprar: 'Por comprar',
};

export const MaterialesPage = () => {
  const { currentProject } = useProjectStore();
  const [viewMode, setViewMode] = useState<ViewMode>('sector');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    codigo: '',
    descripcion: '',
    marca: '',
    modelo: '',
    sucursal: '',
    cantidad: 0,
    proveedor: '',
    ubicacion: '',
    sectorNombre: '',
    estado: 'disponible' as MaterialEstado,
  });

  // Fetch data
  const { data: sectorGroups = [], isLoading: isLoadingSector } = useMaterialesBySector(currentProject?.id || '');
  const { data: proveedorGroups = [], isLoading: isLoadingProveedor } = useMaterialesByProveedor(currentProject?.id || '');
  const { data: stats } = useMaterialesStats(currentProject?.id || '');

  const isLoading = isLoadingSector || isLoadingProveedor;

  // Mutations
  const createMutation = useCreateMaterial();
  const updateMutation = useUpdateMaterial();
  const deleteMutation = useDeleteMaterial();

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      descripcion: '',
      marca: '',
      modelo: '',
      sucursal: '',
      cantidad: 0,
      proveedor: '',
      ubicacion: '',
      sectorNombre: '',
      estado: 'disponible',
    });
  };

  const handleOpenNew = () => {
    resetForm();
    setEditingMaterial(null);
    setShowNewModal(true);
  };

  const handleOpenEdit = (material: Material) => {
    setFormData({
      codigo: material.codigo || '',
      descripcion: material.descripcion,
      marca: material.marca || '',
      modelo: material.modelo || '',
      sucursal: material.sucursal || '',
      cantidad: material.cantidad,
      proveedor: material.proveedor || '',
      ubicacion: material.ubicacion || '',
      sectorNombre: material.sectorNombre || '',
      estado: material.estado,
    });
    setEditingMaterial(material);
    setShowNewModal(true);
  };

  const handleSave = async () => {
    if (!formData.descripcion.trim() || !currentProject) return;

    try {
      if (editingMaterial) {
        await updateMutation.mutateAsync({
          id: editingMaterial.id,
          updates: formData,
        });
        toast.success('Material actualizado');
      } else {
        await createMutation.mutateAsync({
          ...formData,
          proyectoId: currentProject.id,
        });
        toast.success('Material creado');
      }
      setShowNewModal(false);
      resetForm();
      setEditingMaterial(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  const handleDelete = async (id: string, descripcion: string) => {
    if (!confirm(`¿Eliminar "${descripcion}"?`)) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Material eliminado');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const handleEstadoChange = async (material: Material, nuevoEstado: MaterialEstado) => {
    try {
      await updateMutation.mutateAsync({
        id: material.id,
        updates: { estado: nuevoEstado },
      });
      toast.success(`Estado actualizado a "${ESTADO_LABELS[nuevoEstado]}"`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar');
    }
  };

  // Render material card
  const renderMaterialCard = (material: Material) => (
    <div
      key={material.id}
      className="p-4 border-b border-esant-gray-100 last:border-b-0"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {material.codigo && (
              <span className="text-xs font-mono bg-esant-gray-100 px-2 py-0.5 rounded">
                {material.codigo}
              </span>
            )}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[material.estado].bg} ${ESTADO_COLORS[material.estado].text}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${ESTADO_COLORS[material.estado].indicator}`}></div>
              {ESTADO_LABELS[material.estado]}
            </span>
          </div>
          <h4 className="font-medium text-esant-black mb-1">{material.descripcion}</h4>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-esant-gray-600">
            {material.marca && <span>{material.marca}</span>}
            {material.modelo && <span>{material.modelo}</span>}
            <span className="font-medium">Cant: {material.cantidad}</span>
          </div>
          {material.ubicacion && (
            <p className="text-xs text-esant-gray-500 mt-1">
              <Icon name="map-pin" size={12} className="inline mr-1" />
              {material.ubicacion}
            </p>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => handleOpenEdit(material)}
            className="p-2 hover:bg-esant-gray-100 rounded-lg transition-colors"
          >
            <Icon name="pencil" size={16} className="text-esant-gray-600" />
          </button>
          <button
            onClick={() => handleDelete(material.id, material.descripcion)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Icon name="trash-2" size={16} className="text-esant-red" />
          </button>
        </div>
      </div>

      {/* Quick estado buttons */}
      <div className="flex gap-2">
        {(['disponible', 'agotado', 'por_comprar'] as MaterialEstado[]).map((estado) => {
          const isActive = material.estado === estado;
          const colors = ESTADO_COLORS[estado];
          return (
            <button
              key={estado}
              onClick={() => !isActive && handleEstadoChange(material, estado)}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                isActive
                  ? `${colors.bg} ${colors.text}`
                  : 'bg-esant-gray-100 text-esant-gray-500 hover:bg-esant-gray-200'
              }`}
            >
              {ESTADO_LABELS[estado]}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // No project
  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <Icon name="package" size={48} className="text-esant-gray-400 mx-auto mb-3" />
        <p className="text-esant-gray-600">Selecciona un proyecto para ver los materiales</p>
      </div>
    );
  }

  const groups = viewMode === 'sector' ? sectorGroups : proveedorGroups;
  const groupKey = viewMode === 'sector' ? 'sector' : 'proveedor';

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-6">
        <h2 className="font-semibold text-xl text-esant-black mb-1">Materiales</h2>
        <p className="text-sm text-esant-gray-600">Inventario de materiales por sector</p>

        {/* Tabs */}
        <div className="mt-4">
          <Tabs
            tabs={VIEW_TABS}
            activeTab={viewMode}
            onChange={(id) => setViewMode(id as ViewMode)}
          />
        </div>

        {/* Stats */}
        {stats && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-esant-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-esant-gray-800">
                <span className="font-semibold text-esant-black">{stats.disponible}</span> disponibles
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-esant-gray-800">
                <span className="font-semibold text-esant-black">{stats.agotado}</span> agotados
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-esant-gray-800">
                <span className="font-semibold text-esant-black">{stats.por_comprar}</span> por comprar
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Groups */}
      {groups.length === 0 ? (
        <Card className="p-8 text-center">
          <Icon name="package" size={48} className="text-esant-gray-400 mx-auto mb-3" />
          <p className="text-esant-gray-600 mb-2">No hay materiales registrados</p>
          <p className="text-sm text-esant-gray-400">Agrega materiales con el botón +</p>
        </Card>
      ) : (
        groups.map((group) => {
          const groupName = (group as Record<string, unknown>)[groupKey] as string;
          const materiales = group.materiales;
          const isExpanded = expandedGroups.has(groupName);

          return (
            <div key={groupName} className="bg-esant-white rounded-xl shadow-esant overflow-hidden">
              <button
                onClick={() => toggleGroup(groupName)}
                className="w-full p-4 flex items-center justify-between hover:bg-esant-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon
                    name={viewMode === 'sector' ? 'home' : 'building-2'}
                    size={20}
                    className="text-esant-gray-600"
                  />
                  <div className="text-left">
                    <h3 className="font-semibold text-esant-black">{groupName}</h3>
                    <span className="text-sm text-esant-gray-600">
                      {materiales.length} material{materiales.length !== 1 ? 'es' : ''}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-esant-gray-200 text-esant-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    {materiales.length}
                  </span>
                  <Icon
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    className="text-esant-gray-600"
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-esant-gray-100">
                  {materiales.map(renderMaterialCard)}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* FAB */}
      <FAB onClick={handleOpenNew} icon="plus" label="Nuevo material" />

      {/* Modal Nuevo/Editar Material */}
      <Modal
        isOpen={showNewModal}
        onClose={() => {
          setShowNewModal(false);
          setEditingMaterial(null);
          resetForm();
        }}
        title={editingMaterial ? 'Editar Material' : 'Nuevo Material'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-esant-gray-600 mb-2">Código</label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="Ej: CER-001"
                className="w-full px-4 py-3 border-2 border-esant-gray-200 rounded-lg text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-esant-gray-600 mb-2">Cantidad *</label>
              <input
                type="number"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 0 })}
                min="0"
                className="w-full px-4 py-3 border-2 border-esant-gray-200 rounded-lg text-esant-black focus:outline-none focus:border-esant-black transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-esant-gray-600 mb-2">Descripción *</label>
            <input
              type="text"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción del material..."
              className="w-full px-4 py-3 border-2 border-esant-gray-200 rounded-lg text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-esant-gray-600 mb-2">Marca</label>
              <input
                type="text"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                placeholder="Ej: Grohe"
                className="w-full px-4 py-3 border-2 border-esant-gray-200 rounded-lg text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-esant-gray-600 mb-2">Modelo</label>
              <input
                type="text"
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                placeholder="Ej: Eurosmart"
                className="w-full px-4 py-3 border-2 border-esant-gray-200 rounded-lg text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-esant-gray-600 mb-2">Proveedor</label>
              <input
                type="text"
                value={formData.proveedor}
                onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                placeholder="Ej: Sodimac"
                className="w-full px-4 py-3 border-2 border-esant-gray-200 rounded-lg text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-esant-gray-600 mb-2">Sucursal</label>
              <input
                type="text"
                value={formData.sucursal}
                onChange={(e) => setFormData({ ...formData, sucursal: e.target.value })}
                placeholder="Ej: Las Condes"
                className="w-full px-4 py-3 border-2 border-esant-gray-200 rounded-lg text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-esant-gray-600 mb-2">Sector</label>
              <select
                value={formData.sectorNombre}
                onChange={(e) => setFormData({ ...formData, sectorNombre: e.target.value })}
                className="w-full px-4 py-3 border-2 border-esant-gray-200 rounded-lg text-esant-black focus:outline-none focus:border-esant-black transition-colors"
              >
                <option value="">Seleccionar...</option>
                {AREAS_COMUNES.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-esant-gray-600 mb-2">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value as MaterialEstado })}
                className="w-full px-4 py-3 border-2 border-esant-gray-200 rounded-lg text-esant-black focus:outline-none focus:border-esant-black transition-colors"
              >
                {Object.entries(ESTADO_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-esant-gray-600 mb-2">Ubicación</label>
            <input
              type="text"
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              placeholder="Ej: Bodega obra, Por instalar..."
              className="w-full px-4 py-3 border-2 border-esant-gray-200 rounded-lg text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors"
            />
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={handleSave}
            disabled={!formData.descripcion.trim() || createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? 'Guardando...'
              : editingMaterial
              ? 'Guardar cambios'
              : 'Crear Material'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
