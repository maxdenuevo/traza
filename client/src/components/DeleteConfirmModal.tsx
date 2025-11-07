import { toast } from 'sonner';
import { Icon } from './common/Icon';
import { useDeleteProyecto } from '../hooks/useProyectos';
import { useProjectStore } from '../store/useProjectStore';
import type { ProyectoListItem } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProyectoListItem;
}

export function DeleteConfirmModal({ isOpen, onClose, project }: DeleteConfirmModalProps) {
  const deleteMutation = useDeleteProyecto();
  const { removeProject } = useProjectStore();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(project.id);

      // Actualizar el store (automáticamente limpia currentProject si es necesario)
      removeProject(project.id);

      // Mostrar éxito
      toast.success('Proyecto eliminado exitosamente');

      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar el proyecto';
      toast.error(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[60] transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-1/3 max-w-md mx-auto z-[60] animate-slideDown">
        <div className="bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Icon name="alert-triangle" className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">Eliminar Proyecto</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700">
              ¿Estás seguro de que deseas eliminar el proyecto{' '}
              <span className="font-semibold">"{project.nombre}"</span>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Se eliminarán todos los datos asociados: visitas, pendientes, documentos, notas y presupuesto.
            </p>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={deleteMutation.isPending}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {deleteMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <Icon name="trash-2" className="w-4 h-4" />
                  <span>Eliminar Proyecto</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
