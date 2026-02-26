import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Icon } from '../../components/common/Icon';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FAB } from '../../components/common/FAB';
import { CurrencyInput } from '../../components/common/CurrencyInput';
import { StatusBadge, type ProgramaStatus } from '../../components/common/StatusBadge';
import { NoProjectSelected } from '../../components/common/NoProjectSelected';
import { useProjectStore } from '../../store/useProjectStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useProgramaStore, SECTORS, type SectorStatus, type SectorData } from '../../store/useProgramaStore';
import { usePendientesByArea, useCreatePendiente } from '../../hooks/usePendientes';

const STATUS_CYCLE: SectorStatus[] = ['pausado', 'en_curso', 'entregado'];
const STATUS_LABELS: Record<SectorStatus, string> = {
  pendiente: 'Pendiente',
  en_curso: 'En curso',
  pausado: 'Pausado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export const ProgramaPage = () => {
  const { currentProject } = useProjectStore();
  const { user } = useAuthStore();
  const { getSectorStatus, getSectorData, setSectorStatus, updateSectorData, initializeProjectSectors } = useProgramaStore();
  const [expandedSector, setExpandedSector] = useState<string | null>(null);
  const [editingSector, setEditingSector] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SectorData>>({});
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [newNoteSector, setNewNoteSector] = useState<string>('');
  const [newNoteText, setNewNoteText] = useState('');

  // Fetch pendientes for count by sector
  const { data: pendientesByArea = [] } = usePendientesByArea(currentProject?.id || '');
  const createPendienteMutation = useCreatePendiente();

  // Get pending count for a sector
  const getPendingCount = (sector: string): number => {
    const areaData = pendientesByArea.find((a: { area: string; pendientes: unknown[] }) => a.area === sector);
    return areaData?.pendientes?.filter((p: { estado: string }) => p.estado !== 'completada' && p.estado !== 'cancelada').length || 0;
  };

  // Check if user can edit programa (admin only)
  const canEdit = user?.rol === 'admin';

  // Initialize sectors when project changes
  useEffect(() => {
    if (currentProject?.id) {
      initializeProjectSectors(currentProject.id);
    }
  }, [currentProject?.id, initializeProjectSectors]);

  const handleStatusClick = (sectorName: string) => {
    if (!canEdit || !currentProject) {
      if (!canEdit) {
        toast.error('Solo el administrador puede editar el programa');
      }
      return;
    }

    const currentStatus = getSectorStatus(currentProject.id, sectorName);
    const currentIndex = STATUS_CYCLE.indexOf(currentStatus);
    const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];

    setSectorStatus(currentProject.id, sectorName, nextStatus);
    toast.success(`${sectorName} actualizado a "${STATUS_LABELS[nextStatus]}"`);
  };

  const toggleSectorExpand = (sectorName: string) => {
    setExpandedSector(expandedSector === sectorName ? null : sectorName);
  };

  const handleEditSector = (sectorName: string) => {
    if (!currentProject) return;
    const data = getSectorData(currentProject.id, sectorName);
    setEditForm({
      fechaInicio: data?.fechaInicio || '',
      fechaEntregaPropuesta: data?.fechaEntregaPropuesta || '',
      obras: data?.obras || '',
      valorEstimado: data?.valorEstimado,
      valorActual: data?.valorActual,
    });
    setEditingSector(sectorName);
  };

  const handleSaveEdit = () => {
    if (!currentProject || !editingSector) return;
    updateSectorData(currentProject.id, editingSector, editForm);
    toast.success('Fechas actualizadas');
    setEditingSector(null);
  };

  // Handle creating a note as a pendiente
  const handleCreateNote = async () => {
    if (!newNoteText.trim() || !currentProject || !user) return;

    try {
      await createPendienteMutation.mutateAsync({
        pendiente: {
          proyectoId: currentProject.id,
          area: newNoteSector,
          tarea: newNoteText.trim(),
          encargadoId: user.id,
        },
        userId: user.id,
      });
      toast.success('Nota creada como pendiente');
      setShowNewNoteModal(false);
      setNewNoteText('');
      setNewNoteSector('');
    } catch {
      toast.error('Error al crear nota');
    }
  };

  const openNewNote = (sectorName: string) => {
    setNewNoteSector(sectorName);
    setNewNoteText('');
    setShowNewNoteModal(true);
  };

  // Calculate delay days
  const getDelayDays = (sectorData: SectorData | null): number => {
    if (!sectorData?.fechaEntregaPropuesta) return 0;
    if (sectorData.status === 'entregado') return 0;

    const today = new Date();
    const propuesta = parseISO(sectorData.fechaEntregaPropuesta);
    const diff = differenceInDays(today, propuesta);
    return diff > 0 ? diff : 0;
  };

  // Get counts by status
  const getStatusCounts = () => {
    if (!currentProject) return { entregado: 0, pausado: 0, en_curso: 0, atrasados: 0 };

    const counts = { entregado: 0, pausado: 0, en_curso: 0, atrasados: 0 };
    SECTORS.forEach((sector) => {
      const status = getSectorStatus(currentProject.id, sector);
      const data = getSectorData(currentProject.id, sector);
      if (status in counts) {
        counts[status as keyof typeof counts]++;
      }
      if (getDelayDays(data) > 0) {
        counts.atrasados++;
      }
    });
    return counts;
  };

  // No project selected
  if (!currentProject) {
    return <NoProjectSelected icon="list-checks" message="Selecciona o crea un proyecto para ver el programa" />;
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-6">
        <h2 className="font-semibold text-xl text-esant-black mb-1">Programa</h2>
        <p className="text-sm text-esant-gray-600">Estado de avance por sector</p>

        {/* Status summary */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-esant-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-esant-black"></div>
            <span className="text-sm text-esant-gray-800">
              <span className="font-semibold text-esant-black">{statusCounts.entregado}</span> Entregado
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-esant-gray-400"></div>
            <span className="text-sm text-esant-gray-800">
              <span className="font-semibold text-esant-black">{statusCounts.pausado}</span> Pausado
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-esant-red"></div>
            <span className="text-sm text-esant-gray-800">
              <span className="font-semibold text-esant-black">{statusCounts.en_curso}</span> En curso
            </span>
          </div>
          {statusCounts.atrasados > 0 && (
            <div className="flex items-center gap-2">
              <Icon name="alert-triangle" size={14} className="text-esant-red" />
              <span className="text-sm text-esant-red font-semibold">
                {statusCounts.atrasados} atrasado{statusCounts.atrasados > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Project Dates (C2: fechas al top) */}
      {(currentProject?.fechaInicio || currentProject?.fechaEstimadaFin) && (
        <Card className="p-4">
          <div className="flex justify-between text-sm">
            {currentProject?.fechaInicio && (
              <div>
                <span className="text-esant-gray-500">Inicio de obra: </span>
                <span className="font-medium text-esant-black">
                  {format(new Date(currentProject.fechaInicio), "dd/MM/yy", { locale: es })}
                </span>
              </div>
            )}
            {currentProject?.fechaEstimadaFin && (
              <div className="text-right">
                <span className="text-esant-gray-500">Entrega propuesta: </span>
                <span className="font-medium text-esant-black">
                  {format(new Date(currentProject.fechaEstimadaFin), "dd/MM/yy", { locale: es })}
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Admin notice */}
      {!canEdit && (
        <div className="bg-esant-gray-100 border border-esant-gray-200 rounded-xl p-4 flex items-start gap-3">
          <Icon name="info" size={20} className="text-esant-gray-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-esant-gray-800">
            Solo el administrador tiene acceso a editar el programa.
          </p>
        </div>
      )}

      {/* Sectors list — Programa section (C2: sección Programa primero) */}
      <div className="bg-esant-white rounded-xl shadow-esant overflow-hidden">
        {SECTORS.map((sector, index) => {
          const status = getSectorStatus(currentProject.id, sector) as ProgramaStatus;
          const sectorData = getSectorData(currentProject.id, sector);
          const delayDays = getDelayDays(sectorData);
          const isExpanded = expandedSector === sector;
          const isLast = index === SECTORS.length - 1;

          return (
            <div
              key={sector}
              className={`${!isLast ? 'border-b border-esant-gray-100' : ''}`}
            >
              <div className="flex items-center justify-between p-4 hover:bg-esant-gray-50 transition-colors">
                {/* Sector name + delay badge + pending count */}
                <button
                  onClick={() => toggleSectorExpand(sector)}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  <Icon
                    name={isExpanded ? 'chevron-down' : 'chevron-right'}
                    size={18}
                    className="text-esant-gray-400"
                  />
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-esant-black">{sector}</span>
                    {/* Pending count badge */}
                    {getPendingCount(sector) > 0 && (
                      <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-esant-red text-white text-xs font-bold rounded-full">
                        {getPendingCount(sector)}
                      </span>
                    )}
                    {delayDays > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-esant-red">
                        <Icon name="alert-triangle" size={12} />
                        {delayDays}d atraso
                      </span>
                    )}
                  </div>
                </button>

                {/* Status badge */}
                <StatusBadge
                  status={status}
                  onClick={canEdit ? () => handleStatusClick(sector) : undefined}
                  disabled={!canEdit}
                />
              </div>

              {/* Expanded details (C2: simplified — status + "Nueva nota" button) */}
              {isExpanded && (
                <div className="px-4 pb-4 pl-11">
                  <div className="bg-esant-gray-50 rounded-lg p-4 space-y-3">
                    {/* Status info */}
                    <div className="text-sm">
                      <span className="text-esant-gray-500">Estado:</span>{' '}
                      <span className="font-medium text-esant-black">{STATUS_LABELS[status]}</span>
                    </div>

                    {/* Nueva nota button (C2: creates a pendiente) */}
                    <button
                      onClick={() => openNewNote(sector)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-esant-gray-300 rounded-lg text-sm text-esant-gray-600 hover:border-esant-gray-400 hover:text-esant-black transition-colors"
                    >
                      <Icon name="plus" size={16} />
                      Nueva nota
                    </button>

                    {/* Edit button for admins */}
                    {canEdit && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditSector(sector)}
                        className="mt-2"
                      >
                        <Icon name="pencil" size={14} />
                        Editar fechas
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <Card className="p-4">
        <h3 className="font-medium text-esant-black mb-3">Leyenda</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <StatusBadge status="entregado" />
            <span className="text-sm text-esant-gray-600">Sector completado y entregado</span>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status="pausado" />
            <span className="text-sm text-esant-gray-600">Sector pausado o sin iniciar</span>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status="en_curso" />
            <span className="text-sm text-esant-gray-600">Sector actualmente en trabajo</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-esant-red">
              <Icon name="alert-triangle" size={12} />
              Xd atraso
            </span>
            <span className="text-sm text-esant-gray-600">Sector con fecha de entrega vencida</span>
          </div>
        </div>
      </Card>

      {/* FAB for adding/editing sector data (admin only) */}
      {canEdit && (
        <FAB onClick={() => handleEditSector(SECTORS[0])} />
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingSector}
        onClose={() => setEditingSector(null)}
        title={`Editar ${editingSector}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-esant-gray-600 mb-2">
              Fecha de inicio
            </label>
            <input
              type="date"
              value={editForm.fechaInicio || ''}
              onChange={(e) => setEditForm({ ...editForm, fechaInicio: e.target.value })}
              className="w-full px-4 py-3 border-2 border-esant-gray-200 rounded-lg text-esant-black focus:outline-none focus:border-esant-black transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-esant-gray-600 mb-2">
              Fecha de entrega propuesta
            </label>
            <input
              type="date"
              value={editForm.fechaEntregaPropuesta || ''}
              onChange={(e) => setEditForm({ ...editForm, fechaEntregaPropuesta: e.target.value })}
              className="w-full px-4 py-3 border-2 border-esant-gray-200 rounded-lg text-esant-black focus:outline-none focus:border-esant-black transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-esant-gray-600 mb-2">
              Descripcion de obras
            </label>
            <textarea
              value={editForm.obras || ''}
              onChange={(e) => setEditForm({ ...editForm, obras: e.target.value })}
              placeholder="Detalles de las obras a realizar..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-esant-gray-200 rounded-lg text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-esant-gray-600 mb-2">
                Valor estimado
              </label>
              <CurrencyInput
                name="valorEstimado"
                value={editForm.valorEstimado?.toString() || ''}
                onChange={(e) => setEditForm({ ...editForm, valorEstimado: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-esant-gray-600 mb-2">
                Valor actual
              </label>
              <CurrencyInput
                name="valorActual"
                value={editForm.valorActual?.toString() || ''}
                onChange={(e) => setEditForm({ ...editForm, valorActual: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </div>

          <Button variant="primary" fullWidth onClick={handleSaveEdit}>
            Guardar cambios
          </Button>
        </div>
      </Modal>

      {/* New Note Modal (C2: nota que se crea como pendiente) */}
      <Modal
        isOpen={showNewNoteModal}
        onClose={() => setShowNewNoteModal(false)}
        title={`Nueva nota — ${newNoteSector}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-esant-gray-600 mb-2">
              Nota
            </label>
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Escribe una nota que se creará como pendiente..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-esant-gray-200 rounded-lg text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors resize-none"
              autoFocus
            />
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={handleCreateNote}
            disabled={!newNoteText.trim() || createPendienteMutation.isPending}
          >
            {createPendienteMutation.isPending ? 'Creando...' : 'Crear como pendiente'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
