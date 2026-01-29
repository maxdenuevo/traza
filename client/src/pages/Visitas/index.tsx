import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from '../../components/features/Calendar';
import { VisitaForm } from '../../components/features/VisitaForm';
import { AreaAsuntosList } from '../../components/features/AreaAsuntosList';
import { VisitaHistorial } from '../../components/features/VisitaHistorial';
import { DailyOperations } from '../../components/features/DailyOperations';
import { Modal } from '../../components/common/Modal';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/common/Icon';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FAB } from '../../components/common/FAB';
import { useProjectStore } from '../../store/useProjectStore';
import { useAuthStore } from '../../store/useAuthStore';
import { SECTORS } from '../../store/useProgramaStore';
import {
  useVisitas,
  useProximaVisita,
  useCreateVisita,
  useUpdateVisita,
  useAddAsunto,
  useDeleteAsunto,
  useConvertToPendientes
} from '../../hooks/useVisitas';
import { usePendientesByArea } from '../../hooks/usePendientes';
import type { Visita, Asunto } from '../../types';

export const VisitasPage = () => {
  const navigate = useNavigate();
  const { currentProject } = useProjectStore();
  const { user } = useAuthStore();
  const [showNewVisitModal, setShowNewVisitModal] = useState(false);
  const [currentVisita, setCurrentVisita] = useState<Visita | null>(null);
  const [showSectores, setShowSectores] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDailyOps, setShowDailyOps] = useState(false);

  // Fetch data from Supabase
  const { data: visitas = [], isLoading } = useVisitas(currentProject?.id || '');
  const { data: proximaVisita } = useProximaVisita(currentProject?.id || '');
  const { data: pendientesByArea = [] } = usePendientesByArea(currentProject?.id || '');

  // Mutations
  const createMutation = useCreateVisita();
  const updateMutation = useUpdateVisita();
  const addAsuntoMutation = useAddAsunto();
  const deleteAsuntoMutation = useDeleteAsunto();
  const convertMutation = useConvertToPendientes();

  // Calculate pending counts per sector
  const getPendingCount = (sector: string): number => {
    const areaData = pendientesByArea.find((a: { area: string; pendientes: unknown[] }) => a.area === sector);
    return areaData?.pendientes?.length || 0;
  };

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
    // Area is added implicitly when first asunto is added
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
        updates: { estado: 'completada' },
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

    setCurrentVisita({ ...currentVisita, notasGenerales: notas });

    try {
      await updateMutation.mutateAsync({
        id: currentVisita.id,
        updates: { notasGenerales: notas },
      });
    } catch {
      toast.error('Error al guardar notas');
    }
  };

  const handleSectorClick = (sector: string) => {
    navigate(`/pendientes?sector=${encodeURIComponent(sector)}`);
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
        <Icon name="calendar" size={48} className="text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Selecciona un proyecto para ver las visitas</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Title - Libro de Obra */}
      <Card className="p-6">
        <h2 className="font-semibold text-xl text-gray-900 mb-1">Libro de Obra</h2>
        <p className="text-sm text-gray-600">Gestión de visitas y sectores</p>
      </Card>

      {/* Calendar */}
      <Calendar
        visitas={visitas}
        proximaVisita={proximaVisita?.fecha}
        onDayClick={(date) => {
          setSelectedDate(date);
          setShowDailyOps(true);
        }}
      />

      {/* Daily Operations (Checkbox + Asistencia) */}
      {showDailyOps && (
        <DailyOperations fecha={selectedDate} />
      )}

      {/* Próxima Visita Card */}
      {proximaVisita && (
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#DC2626]"></div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Próxima visita</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-gray-900">
                {format(new Date(proximaVisita.fecha), "dd/MM/yy", { locale: es })}
              </p>
              <p className="text-sm text-gray-600">
                {proximaVisita.hora || '10:30 am'}
              </p>
              <p className="text-sm text-gray-500">
                {currentProject?.direccion || currentProject?.nombre}
              </p>
            </div>
            <button
              onClick={() => setCurrentVisita(proximaVisita)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon name="chevron-right" size={20} className="text-gray-400" />
            </button>
          </div>
        </Card>
      )}

      {/* Current Visit in Progress */}
      {currentVisita && currentVisita.estado === 'en_curso' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-xl text-gray-900">
              Visita {format(new Date(currentVisita.fecha), "dd/MM/yy", { locale: es })}
            </h3>
            <span className="text-xs bg-[#DC2626] text-white px-3 py-1.5 rounded font-medium">
              En curso
            </span>
          </div>

          <div className="space-y-6">
            {/* Notas generales */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Notas generales
              </label>
              <textarea
                value={currentVisita.notasGenerales || ''}
                onChange={(e) => handleUpdateNotasGenerales(e.target.value)}
                className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors resize-none"
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
              <button
                onClick={handleCompleteVisita}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Completar Visita
              </button>
            )}
          </div>
        </Card>
      )}

      {/* Sectores / Pendientes */}
      <Card className="overflow-hidden">
        <button
          onClick={() => setShowSectores(!showSectores)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <h3 className="font-semibold text-gray-900">Pendientes</h3>
          <Icon
            name={showSectores ? 'chevron-up' : 'chevron-down'}
            size={20}
            className="text-gray-400"
          />
        </button>

        {showSectores && (
          <div className="border-t border-gray-100">
            {SECTORS.map((sector, index) => {
              const count = getPendingCount(sector);
              const isLast = index === SECTORS.length - 1;

              return (
                <button
                  key={sector}
                  onClick={() => handleSectorClick(sector)}
                  className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                    !isLast ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <span className="text-gray-900">{sector}</span>
                  {count > 0 ? (
                    <span className="min-w-[24px] h-6 px-2 flex items-center justify-center bg-[#DC2626] text-white text-xs font-bold rounded-full">
                      {count}
                    </span>
                  ) : (
                    <Icon name="chevron-right" size={16} className="text-gray-300" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* Visit History */}
      {completedVisitas.length > 0 && (
        <VisitaHistorial visitas={completedVisitas} />
      )}

      {/* FAB for new visit */}
      <FAB onClick={() => setShowNewVisitModal(true)} />

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
