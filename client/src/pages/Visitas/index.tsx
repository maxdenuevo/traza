import { useState } from 'react';
import { toast } from 'sonner';
import { Calendar } from '../../components/features/Calendar';
import { VisitaForm } from '../../components/features/VisitaForm';
import { AreaAsuntosList } from '../../components/features/AreaAsuntosList';
import { VisitaHistorial } from '../../components/features/VisitaHistorial';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { useProjectStore } from '../../store/useProjectStore';
import { useAuthStore } from '../../store/useAuthStore';
import {
  useVisitas,
  useProximaVisita,
  useCreateVisita,
  useUpdateVisita,
  useAddAsunto,
  useDeleteAsunto,
  useConvertToPendientes
} from '../../hooks/useVisitas';
import type { Visita, Asunto } from '../../types';

export const VisitasPage = () => {
  const { currentProject } = useProjectStore();
  const { user } = useAuthStore();
  const [showNewVisitModal, setShowNewVisitModal] = useState(false);
  const [currentVisita, setCurrentVisita] = useState<Visita | null>(null);

  // Fetch data from Supabase
  const { data: visitas = [], isLoading } = useVisitas(currentProject?.id || '');
  const { data: proximaVisita } = useProximaVisita(currentProject?.id || '');

  // Mutations
  const createMutation = useCreateVisita();
  const updateMutation = useUpdateVisita();
  const addAsuntoMutation = useAddAsunto();
  const deleteAsuntoMutation = useDeleteAsunto();
  const convertMutation = useConvertToPendientes();

  // Group asuntos by area for current visit
  const areaAsuntos = currentVisita
    ? currentVisita.asuntos.reduce((acc, asunto) => {
        const existing = acc.find(a => a.area === asunto.area);
        if (existing) {
          existing.asuntos.push(asunto);
        } else {
          acc.push({ area: asunto.area, asuntos: [asunto] });
        }
        return acc;
      }, [] as Array<{ area: string; asuntos: Asunto[] }>)
    : [];

  const completedVisitas = visitas.filter(v => v.estado === 'completada');

  const handleCreateVisita = async (visitaData: Partial<Visita>) => {
    if (!currentProject || !user) {
      toast.error('Debes tener un proyecto seleccionado');
      return;
    }

    try {
      const newVisita = await createMutation.mutateAsync({
        visita: {
          ...visitaData,
          proyectoId: currentProject.id,
          estado: 'en_curso',
        },
        userId: user.id,
      });

      setCurrentVisita(newVisita);
      setShowNewVisitModal(false);
      toast.success('Visita creada exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la visita';
      toast.error(errorMessage);
    }
  };

  const handleAddArea = (_area: string) => {
    if (!currentVisita) return;

    // Area is added implicitly when first asunto is added
    // This just ensures we can expand it
  };

  const handleAddAsunto = async (area: string, asuntoData: Partial<Asunto>) => {
    if (!currentVisita) return;

    try {
      const newAsunto = await addAsuntoMutation.mutateAsync({
        visitaId: currentVisita.id,
        asunto: {
          area,
          descripcion: asuntoData.descripcion!,
          encargadoId: asuntoData.encargadoId,
          notasAdicionales: asuntoData.notasAdicionales,
        },
      });

      // Update local state
      const updatedVisita = {
        ...currentVisita,
        asuntos: [...currentVisita.asuntos, newAsunto],
      };

      setCurrentVisita(updatedVisita);
      toast.success('Asunto agregado');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar asunto';
      toast.error(errorMessage);
    }
  };

  const handleRemoveAsunto = async (_area: string, asuntoId: string) => {
    if (!currentVisita) return;

    try {
      await deleteAsuntoMutation.mutateAsync(asuntoId);

      // Update local state
      const updatedVisita = {
        ...currentVisita,
        asuntos: currentVisita.asuntos.filter(a => a.id !== asuntoId),
      };

      setCurrentVisita(updatedVisita);
      toast.success('Asunto eliminado');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar asunto';
      toast.error(errorMessage);
    }
  };

  const handleConvertToPendientes = async () => {
    if (!currentVisita || !user) return;

    if (currentVisita.asuntos.length === 0) {
      toast.error('No hay asuntos para convertir');
      return;
    }

    try {
      await convertMutation.mutateAsync({
        visitaId: currentVisita.id,
        userId: user.id,
      });

      setCurrentVisita(null);
      toast.success(`${currentVisita.asuntos.length} asuntos convertidos en pendientes`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al convertir a pendientes';
      toast.error(errorMessage);
    }
  };

  const handleCompleteVisita = async () => {
    if (!currentVisita) return;

    try {
      await updateMutation.mutateAsync({
        id: currentVisita.id,
        updates: {
          estado: 'completada',
        },
      });

      setCurrentVisita(null);
      toast.success('Visita completada');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al completar visita';
      toast.error(errorMessage);
    }
  };

  const handleUpdateNotasGenerales = async (notas: string) => {
    if (!currentVisita) return;

    // Update local state immediately for better UX
    setCurrentVisita({ ...currentVisita, notasGenerales: notas });

    try {
      await updateMutation.mutateAsync({
        id: currentVisita.id,
        updates: {
          notasGenerales: notas,
        },
      });
    } catch (err) {
      // Revert on error
      toast.error('Error al guardar notas');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-esant-gray-200 border-t-esant-black" />
      </div>
    );
  }

  // Show message if no project selected
  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <p className="text-esant-gray-600">Selecciona un proyecto para ver las visitas</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calendar */}
      <Calendar
        visitas={visitas}
        proximaVisita={proximaVisita?.fecha}
        onDayClick={(date) => console.log('Clicked day:', date)}
      />

      {/* Nueva Visita Button */}
      <Button
        variant="primary"
        fullWidth
        onClick={() => setShowNewVisitModal(true)}
      >
        + Nueva Visita
      </Button>

      {/* Current Visit in Progress - Estilo ESANT MARIA */}
      {currentVisita && currentVisita.estado === 'en_curso' && (
        <div className="bg-esant-white rounded-xl shadow-esant p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-xl text-esant-black">
              Visita {new Date(currentVisita.fecha).toLocaleDateString('es-CL')}
            </h3>
            <span className="text-xs bg-esant-red text-esant-white px-3 py-1.5 rounded font-medium">
              En curso
            </span>
          </div>

          <div className="space-y-6">
            {/* Notas generales - Estilo minimalista */}
            <div>
              <label className="block text-sm font-medium text-esant-gray-600 mb-2">
                Notas generales
              </label>
              <textarea
                value={currentVisita.notasGenerales || ''}
                onChange={(e) => handleUpdateNotasGenerales(e.target.value)}
                className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-esant-gray-200 text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors resize-none text-base"
                rows={3}
                placeholder="Agregar observaciones generales de la visita..."
              />
            </div>

            {/* Areas y Asuntos */}
            <AreaAsuntosList
              areas={areaAsuntos}
              onAddArea={handleAddArea}
              onAddAsunto={handleAddAsunto}
              onRemoveAsunto={handleRemoveAsunto}
              onConvertToPendientes={
                currentVisita.asuntos.length > 0 ? handleConvertToPendientes : undefined
              }
            />

            {/* Complete without converting */}
            {currentVisita.asuntos.length === 0 && (
              <Button variant="secondary" fullWidth onClick={handleCompleteVisita}>
                Completar Visita
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Visit History */}
      <VisitaHistorial visitas={completedVisitas} />

      {/* New Visit Modal */}
      <Modal
        isOpen={showNewVisitModal}
        onClose={() => setShowNewVisitModal(false)}
        title="Nueva Visita"
      >
        <VisitaForm
          onSubmit={handleCreateVisita}
          onCancel={() => setShowNewVisitModal(false)}
        />
      </Modal>
    </div>
  );
};
