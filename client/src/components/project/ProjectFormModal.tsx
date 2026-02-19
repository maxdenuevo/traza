import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Icon } from '../common/Icon';
import { FormField } from '../common/FormField';
import { CurrencyInput } from '../common/CurrencyInput';
import { LoadingButton } from '../common/LoadingButton';
import { useCreateProyecto, useUpdateProyecto } from '../../hooks/useProyectos';
import { useProjectStore } from '../../store/useProjectStore';
import type { ProyectoListItem, ProyectoEstado } from '../../types';

interface ProjectFormModalProps {
  mode: 'create' | 'edit';
  project?: ProyectoListItem;
  isOpen: boolean;
  onClose: () => void;
}

const ESTADO_OPTIONS = [
  { value: 'planificacion', label: 'Planificación' },
  { value: 'en_obra', label: 'En Obra' },
  { value: 'pausado', label: 'Pausado' },
  { value: 'terminado', label: 'Terminado' },
];

export function ProjectFormModal({ mode, project, isOpen, onClose }: ProjectFormModalProps) {
  const isEdit = mode === 'edit';
  const { setCurrentProject, updateProject } = useProjectStore();
  const createMutation = useCreateProyecto();
  const updateMutation = useUpdateProyecto();

  const [formData, setFormData] = useState({
    nombre: '',
    cliente: '',
    estado: 'planificacion' as ProyectoEstado,
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaEstimadaFin: '',
    direccion: '',
    descripcion: '',
    presupuestoTotal: '',
  });

  const [error, setError] = useState<string | null>(null);

  // Initialize form data
  useEffect(() => {
    if (isEdit && project) {
      setFormData({
        nombre: project.nombre,
        cliente: project.cliente,
        estado: project.estado,
        fechaInicio: project.fechaInicio.toISOString().split('T')[0],
        fechaEstimadaFin: project.fechaEstimadaFin?.toISOString().split('T')[0] || '',
        direccion: project.direccion || '',
        descripcion: project.descripcion || '',
        presupuestoTotal: project.presupuestoTotal?.toString() || '',
      });
    } else {
      // Reset to empty for create mode
      setFormData({
        nombre: '',
        cliente: '',
        estado: 'planificacion',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaEstimadaFin: '',
        direccion: '',
        descripcion: '',
        presupuestoTotal: '',
      });
    }
    setError(null);
  }, [isEdit, project, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!formData.nombre.trim()) {
      setError('El nombre del proyecto es obligatorio');
      return;
    }

    if (!formData.cliente.trim()) {
      setError('El nombre del cliente es obligatorio');
      return;
    }

    try {
      const projectData = {
        nombre: formData.nombre.trim(),
        cliente: formData.cliente.trim(),
        estado: formData.estado as ProyectoEstado,
        fechaInicio: new Date(formData.fechaInicio),
        fechaEstimadaFin: formData.fechaEstimadaFin
          ? new Date(formData.fechaEstimadaFin)
          : undefined,
        direccion: formData.direccion.trim() || undefined,
        descripcion: formData.descripcion.trim() || undefined,
        presupuestoTotal: formData.presupuestoTotal
          ? parseFloat(formData.presupuestoTotal)
          : undefined,
      };

      if (isEdit && project) {
        // Update existing project
        await updateMutation.mutateAsync({
          id: project.id,
          updates: projectData,
        });

        // Update store if it's the current project
        const { currentProject } = useProjectStore.getState();
        if (currentProject?.id === project.id) {
          updateProject(project.id, projectData);
        }

        toast.success('Proyecto actualizado exitosamente');
      } else {
        // Create new project
        const newProject = await createMutation.mutateAsync(projectData);

        // Auto-select the new project
        setCurrentProject(newProject);

        toast.success('Proyecto creado exitosamente');
      }

      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : `Error al ${isEdit ? 'actualizar' : 'crear'} el proyecto`;
      toast.error(errorMessage);
      setError(errorMessage);
    }
  };

  const mutation = isEdit ? updateMutation : createMutation;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[60] transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-4 sm:top-10 max-w-3xl mx-auto z-[60] animate-slideDown max-h-[calc(100vh-32px)] sm:max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl">
        {/* Header - always visible */}
        <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEdit ? 'Editar Proyecto' : 'Nuevo Proyecto'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {isEdit
                  ? 'Actualiza la información del proyecto'
                  : 'Completa la información básica del proyecto'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon name="x" className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Scrollable form content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <Icon name="alert-circle" className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Grid de 2 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nombre del Proyecto */}
              <FormField
                label="Nombre del Proyecto"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Ej: Casa Providencia"
                className="md:col-span-2"
              />

              {/* Cliente */}
              <FormField
                label="Cliente"
                name="cliente"
                type="text"
                value={formData.cliente}
                onChange={handleChange}
                required
                placeholder="Nombre del cliente"
              />

              {/* Estado */}
              <FormField
                label="Estado"
                name="estado"
                type="select"
                value={formData.estado}
                onChange={handleChange}
                required
                options={ESTADO_OPTIONS}
              />

              {/* Fecha de Inicio */}
              <FormField
                label="Fecha de Inicio"
                name="fechaInicio"
                type="date"
                value={formData.fechaInicio}
                onChange={handleChange}
                required
              />

              {/* Fecha Estimada de Fin */}
              <FormField
                label="Fecha Estimada de Fin"
                name="fechaEstimadaFin"
                type="date"
                value={formData.fechaEstimadaFin}
                onChange={handleChange}
                min={formData.fechaInicio}
              />

              {/* Dirección */}
              <FormField
                label="Dirección"
                name="direccion"
                type="text"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Ej: Providencia, Santiago"
              />

              {/* Presupuesto Total */}
              <div>
                <label htmlFor="presupuestoTotal" className="block text-sm font-medium text-esant-gray-600 mb-2">
                  Presupuesto Total
                </label>
                <CurrencyInput
                  name="presupuestoTotal"
                  value={formData.presupuestoTotal}
                  onChange={(e) => setFormData(prev => ({ ...prev, presupuestoTotal: e.target.value }))}
                />
              </div>

              {/* Descripción */}
              <FormField
                label="Descripción"
                name="descripcion"
                type="textarea"
                value={formData.descripcion}
                onChange={handleChange}
                rows={4}
                placeholder="Descripción breve del proyecto..."
                className="md:col-span-2"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <LoadingButton
                type="button"
                onClick={onClose}
                variant="secondary"
              >
                Cancelar
              </LoadingButton>
              <LoadingButton
                type="submit"
                loading={mutation.isPending}
                variant="primary"
                icon={isEdit ? 'check' : 'plus'}
              >
                {isEdit ? 'Guardar Cambios' : 'Crear Proyecto'}
              </LoadingButton>
            </div>
        </form>
      </div>
    </>
  );
}
