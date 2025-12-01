import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Icon } from '../../components/common/Icon';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FAB } from '../../components/common/FAB';
import { useProjectStore } from '../../store/useProjectStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotas, useCreateNota, useDeleteNota } from '../../hooks/useNotas';
import { SECTORS } from '../../store/useCronogramaStore';
import type { Nota } from '../../types';

// Filter options - "General" plus all sectors
const FILTER_OPTIONS = ['Todos', ...SECTORS] as const;

export const NotasPage = () => {
  const { currentProject } = useProjectStore();
  const { user } = useAuthStore();
  const [selectedFilter, setSelectedFilter] = useState<string>('Todos');
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteSector, setNewNoteSector] = useState<string>('General');

  // Fetch notas
  const { data: notas = [], isLoading } = useNotas(currentProject?.id || '');

  // Mutations
  const createNotaMutation = useCreateNota();
  const deleteNotaMutation = useDeleteNota();

  // Filter notas by sector
  const filteredNotas = selectedFilter === 'Todos'
    ? notas
    : notas.filter((nota: Nota) => nota.area === selectedFilter);

  const handleCreateNota = async () => {
    if (!newNoteContent.trim() || !currentProject || !user) return;

    try {
      await createNotaMutation.mutateAsync({
        nota: {
          proyectoId: currentProject.id,
          contenido: newNoteContent.trim(),
          area: newNoteSector,
        },
        userId: user.id,
      });

      toast.success('Nota creada');
      setNewNoteContent('');
      setNewNoteSector('General');
      setShowNewNoteModal(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear nota';
      toast.error(errorMessage);
    }
  };

  const handleDeleteNota = async (notaId: string) => {
    if (!confirm('¿Eliminar esta nota?')) return;

    try {
      await deleteNotaMutation.mutateAsync(notaId);
      toast.success('Nota eliminada');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar nota';
      toast.error(errorMessage);
    }
  };

  // No project selected
  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <Icon name="message-square" size={48} className="text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Selecciona un proyecto para ver las notas</p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <Card className="p-6">
        <h2 className="font-semibold text-xl text-gray-900 mb-1">Notas equipo</h2>
        <p className="text-sm text-gray-600">Comunicación y observaciones del equipo</p>
      </Card>

      {/* Filter pills */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-2 min-w-max">
          {FILTER_OPTIONS.map((filter) => {
            const isActive = selectedFilter === filter;
            const count = filter === 'Todos'
              ? notas.length
              : notas.filter((n: Nota) => n.area === filter).length;

            return (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                  ${isActive
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }
                `}
              >
                {filter}
                {count > 0 && (
                  <span className={`ml-2 ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes list */}
      {filteredNotas.length === 0 ? (
        <Card className="p-8 text-center">
          <Icon name="message-square" size={48} className="text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No hay notas {selectedFilter !== 'Todos' ? `en ${selectedFilter}` : ''}</p>
          <p className="text-sm text-gray-400">Las notas del equipo aparecerán aquí</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotas.map((nota: Nota) => (
            <Card key={nota.id} className="p-4">
              {/* Sector badge */}
              {nota.area && (
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full mb-2">
                  {nota.area}
                </span>
              )}

              {/* Content */}
              <p className="text-gray-900 text-sm leading-relaxed mb-3">
                {nota.contenido}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  {/* Author */}
                  <span className="flex items-center gap-1">
                    <Icon name="user" size={12} />
                    {nota.autor?.nombre || 'Usuario'}
                  </span>

                  {/* Date */}
                  <span>
                    {format(new Date(nota.createdAt), "d MMM yyyy", { locale: es })}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {nota.autorId === user?.id && (
                    <button
                      onClick={() => handleDeleteNota(nota.id)}
                      className="p-1.5 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar"
                    >
                      <Icon name="trash-2" size={14} className="text-red-500" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* FAB for new note */}
      <FAB onClick={() => setShowNewNoteModal(true)} />

      {/* New Note Modal */}
      <Modal
        isOpen={showNewNoteModal}
        onClose={() => setShowNewNoteModal(false)}
        title="Nueva nota"
      >
        <div className="space-y-4">
          {/* Sector selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sector
            </label>
            <select
              value={newNoteSector}
              onChange={(e) => setNewNoteSector(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              {SECTORS.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>

          {/* Content textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenido
            </label>
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              rows={5}
              placeholder="Escribe tu nota aquí..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowNewNoteModal(false)}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateNota}
              disabled={!newNoteContent.trim() || createNotaMutation.isPending}
              className="flex-1 px-4 py-3 bg-[#E53935] text-white rounded-lg font-medium hover:bg-[#C62828] transition-colors disabled:opacity-50"
            >
              {createNotaMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
