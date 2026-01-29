import { useState } from 'react';
import { toast } from 'sonner';
import { PENDIENTE_ESTADO_COLORS, PENDIENTE_ESTADO_LABELS, AREAS_COMUNES, generateWhatsAppLink } from '../../constants';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Tabs } from '../../components/common/Tabs';
import { Modal } from '../../components/common/Modal';
import { FAB } from '../../components/common/FAB';
import { AttachmentUploader } from '../../components/features/attachments/AttachmentUploader';
import { useProjectStore } from '../../store/useProjectStore';
import { useAuthStore } from '../../store/useAuthStore';
import {
  usePendientesByArea,
  usePendientesByResponsable,
  useCreatePendiente,
  useUpdatePendienteEstado,
  usePausePendiente,
  useResumePendiente,
  useDeletePendiente,
} from '../../hooks/usePendientes';
import { useTeamMembers } from '../../hooks/useEquipo';
import { useAttachments } from '../../hooks/useAttachments';
import type { Pendiente, PendienteEstado } from '../../types';

const ESTADO_TRANSITIONS: Record<PendienteEstado, PendienteEstado[]> = {
  creada: ['en_progreso', 'cancelada'],
  en_progreso: ['pausada', 'completada', 'cancelada'],
  pausada: ['en_progreso', 'cancelada'],
  completada: [],
  cancelada: [],
};

type ViewMode = 'sector' | 'responsable';

const VIEW_TABS = [
  { id: 'sector', label: 'Por Sector' },
  { id: 'responsable', label: 'Por Responsable' },
];

export const PendientesPage = () => {
  const { currentProject } = useProjectStore();
  const { user } = useAuthStore();
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('sector');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pausingPendiente, setPausingPendiente] = useState<Pendiente | null>(null);
  const [pauseMotivo, setPauseMotivo] = useState('');
  const [newPendiente, setNewPendiente] = useState({
    tarea: '',
    area: '',
    encargadoId: '',
    notasAdicionales: '',
  });
  const [detailPendiente, setDetailPendiente] = useState<Pendiente | null>(null);

  // Fetch data
  const { data: areasPendientes = [], isLoading: isLoadingAreas } = usePendientesByArea(currentProject?.id || '');
  const { data: responsablesPendientes = [], isLoading: isLoadingResponsables } = usePendientesByResponsable(currentProject?.id || '');
  const { data: teamMembers = [] } = useTeamMembers(currentProject?.id || '');

  const isLoading = isLoadingAreas || isLoadingResponsables;

  // Mutations
  const createMutation = useCreatePendiente();
  const updateEstadoMutation = useUpdatePendienteEstado();
  const pauseMutation = usePausePendiente();
  const resumeMutation = useResumePendiente();
  const deleteMutation = useDeletePendiente();

  const handleCreatePendiente = async () => {
    if (!newPendiente.tarea.trim() || !newPendiente.area || !currentProject || !user) return;

    try {
      await createMutation.mutateAsync({
        pendiente: {
          proyectoId: currentProject.id,
          tarea: newPendiente.tarea,
          area: newPendiente.area,
          encargadoId: newPendiente.encargadoId || undefined,
          notasAdicionales: newPendiente.notasAdicionales || undefined,
          estado: 'creada',
        },
        userId: user.id,
      });
      toast.success('Pendiente creado');
      setNewPendiente({ tarea: '', area: '', encargadoId: '', notasAdicionales: '' });
      setShowNewModal(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear pendiente');
    }
  };

  const handlePause = (pendiente: Pendiente) => {
    setPausingPendiente(pendiente);
    setPauseMotivo('');
    setShowPauseModal(true);
  };

  const confirmPause = async () => {
    if (!pausingPendiente || !user) return;

    try {
      await pauseMutation.mutateAsync({
        id: pausingPendiente.id,
        motivo: pauseMotivo || undefined,
        userId: user.id,
      });
      toast.success('Tarea pausada');
      setShowPauseModal(false);
      setPausingPendiente(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al pausar');
    }
  };

  const handleResume = async (pendiente: Pendiente) => {
    if (!user) return;

    try {
      await resumeMutation.mutateAsync({ id: pendiente.id, userId: user.id });
      toast.success('Tarea reanudada');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al reanudar');
    }
  };

  const toggleArea = (area: string) => {
    setExpandedAreas((prev) => {
      const next = new Set(prev);
      if (next.has(area)) {
        next.delete(area);
      } else {
        next.add(area);
      }
      return next;
    });
  };

  const handleEstadoChange = async (pendiente: Pendiente, nuevoEstado: PendienteEstado) => {
    // Use pause flow for pausada transition
    if (nuevoEstado === 'pausada') {
      handlePause(pendiente);
      return;
    }

    // Use resume flow for en_progreso from pausada
    if (nuevoEstado === 'en_progreso' && pendiente.estado === 'pausada') {
      handleResume(pendiente);
      return;
    }

    try {
      await updateEstadoMutation.mutateAsync({ id: pendiente.id, estado: nuevoEstado });
      toast.success(`Estado actualizado a "${PENDIENTE_ESTADO_LABELS[nuevoEstado] || nuevoEstado}"`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar estado';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este pendiente?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Pendiente eliminado');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar';
      toast.error(errorMessage);
    }
  };

  const handleWhatsApp = (pendiente: Pendiente) => {
    const telefono = pendiente.encargado?.telefono;

    if (!telefono) {
      toast.error('Este encargado no tiene teléfono registrado');
      return;
    }

    const nombreEncargado = pendiente.encargado?.nombre || 'encargado';
    const mensaje = `Hola ${nombreEncargado}, te escribo sobre la tarea pendiente: "${pendiente.tarea}" en ${pendiente.area}`;
    const url = generateWhatsAppLink(telefono, mensaje);
    window.open(url, '_blank');
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
        <p className="text-esant-gray-600">Selecciona un proyecto para ver los pendientes</p>
      </div>
    );
  }

  // No pendientes
  if (areasPendientes.length === 0 && responsablesPendientes.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-esant-gray-600 mb-2">No hay pendientes en este proyecto</p>
        <p className="text-sm text-esant-gray-400">Los pendientes se crean desde las visitas</p>
      </Card>
    );
  }

  // Render pendiente item (shared between views)
  const renderPendienteItem = (pendiente: Pendiente, showArea = false) => (
    <div
      key={pendiente.id}
      className="p-5 border-b border-esant-gray-200 last:border-b-0"
    >
      {/* Pendiente Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <button
          onClick={() => setDetailPendiente(pendiente)}
          className="flex-1 text-left"
        >
          <h4 className="font-medium text-base text-esant-black mb-1">
            {pendiente.tarea}
          </h4>
          {pendiente.descripcion && (
            <p className="text-sm text-esant-gray-600">{pendiente.descripcion}</p>
          )}
          {showArea && pendiente.area && (
            <p className="text-xs text-esant-gray-400 mt-1">
              <Icon name="map-pin" size={12} className="inline mr-1" />
              {pendiente.area}
            </p>
          )}
          {/* Attachment indicator */}
          {pendiente.attachments && pendiente.attachments.length > 0 && (
            <p className="text-xs text-esant-gray-500 mt-1 flex items-center gap-1">
              <Icon name="paperclip" size={12} />
              {pendiente.attachments.length} archivo{pendiente.attachments.length !== 1 ? 's' : ''}
            </p>
          )}
        </button>
        <button
          onClick={() => handleDelete(pendiente.id)}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Icon name="trash-2" size={16} className="text-esant-red" />
        </button>
      </div>

      {/* Estado actual */}
      <div className="mb-3">
        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${PENDIENTE_ESTADO_COLORS[pendiente.estado]?.bg} ${PENDIENTE_ESTADO_COLORS[pendiente.estado]?.text}`}>
          <div className={`w-2 h-2 rounded-full ${PENDIENTE_ESTADO_COLORS[pendiente.estado]?.indicator}`}></div>
          {PENDIENTE_ESTADO_LABELS[pendiente.estado] || pendiente.estado}
        </span>
      </div>

      {/* Acciones de estado */}
      {ESTADO_TRANSITIONS[pendiente.estado]?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {ESTADO_TRANSITIONS[pendiente.estado].map((nuevoEstado) => {
            const colors = PENDIENTE_ESTADO_COLORS[nuevoEstado];
            const isPause = nuevoEstado === 'pausada';
            const isResume = nuevoEstado === 'en_progreso' && pendiente.estado === 'pausada';

            return (
              <button
                key={nuevoEstado}
                onClick={() => handleEstadoChange(pendiente, nuevoEstado)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${colors.bg} ${colors.text} hover:opacity-80`}
              >
                {isPause && <Icon name="pause" size={14} />}
                {isResume && <Icon name="play" size={14} />}
                {nuevoEstado === 'completada' && <Icon name="check" size={14} />}
                {nuevoEstado === 'cancelada' && <Icon name="x" size={14} />}
                {PENDIENTE_ESTADO_LABELS[nuevoEstado]}
              </button>
            );
          })}
        </div>
      )}

      {/* Encargado & WhatsApp */}
      {pendiente.encargado && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-esant-gray-600">
            <Icon name="user" size={14} />
            <span>
              {pendiente.encargado.nombre}
              {pendiente.encargado.especialidad && ` - ${pendiente.encargado.especialidad}`}
            </span>
          </div>
          <Button
            variant="whatsapp"
            size="sm"
            onClick={() => handleWhatsApp(pendiente)}
            className="w-full"
          >
            <Icon name="message-circle" size={16} />
            Contactar por WhatsApp
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header con estadísticas */}
      <Card className="p-6">
        <h2 className="font-semibold text-xl text-esant-black mb-1">Pendientes</h2>
        <p className="text-sm text-esant-gray-600 mb-4">
          {viewMode === 'sector' ? 'Organizado por áreas' : 'Organizado por responsable'}
        </p>

        {/* Tabs */}
        <Tabs
          tabs={VIEW_TABS}
          activeTab={viewMode}
          onChange={(id) => setViewMode(id as ViewMode)}
        />

        {/* Quick stats */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-esant-gray-200">
          {Object.entries(PENDIENTE_ESTADO_COLORS).map(([key, colors]) => {
            const count = areasPendientes.reduce(
              (acc, area) => acc + area.pendientes.filter((p) => p.estado === key).length,
              0
            );
            return (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-sm ${colors.indicator}`}></div>
                <span className="text-sm text-esant-gray-800">
                  <span className="font-semibold text-esant-black">{count}</span>{' '}
                  {key.replace('_', ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Vista por Sector */}
      {viewMode === 'sector' && areasPendientes.map(({ area, pendientes }) => {
        const isExpanded = expandedAreas.has(area);

        return (
          <div key={area} className="bg-esant-white rounded-xl shadow-esant overflow-hidden">
            {/* Área Header - Colapsable */}
            <button
              onClick={() => toggleArea(area)}
              className="w-full p-5 flex items-center justify-between btn-touch hover:bg-esant-gray-100 smooth-transition"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-start">
                  <h3 className="font-semibold text-lg text-esant-black">{area}</h3>
                  <span className="text-sm text-esant-gray-600">{pendientes.length} pendientes</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-esant-red text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {pendientes.length}
                </span>
                <Icon
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  className="text-esant-gray-600"
                />
              </div>
            </button>

            {/* Pendientes List - Colapsable */}
            {isExpanded && (
              <div className="border-t border-esant-gray-200">
                {pendientes.map((pendiente) => renderPendienteItem(pendiente, false))}
              </div>
            )}
          </div>
        );
      })}

      {/* Vista por Responsable */}
      {viewMode === 'responsable' && responsablesPendientes.map(({ encargadoId, encargadoNombre, encargado, pendientes }) => {
        const isExpanded = expandedAreas.has(encargadoId);

        return (
          <div key={encargadoId} className="bg-esant-white rounded-xl shadow-esant overflow-hidden">
            {/* Responsable Header - Colapsable */}
            <button
              onClick={() => toggleArea(encargadoId)}
              className="w-full p-5 flex items-center justify-between btn-touch hover:bg-esant-gray-100 smooth-transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-esant-gray-200 flex items-center justify-center">
                  <Icon name="user" size={20} className="text-esant-gray-600" />
                </div>
                <div className="flex flex-col items-start">
                  <h3 className="font-semibold text-lg text-esant-black">{encargadoNombre}</h3>
                  <span className="text-sm text-esant-gray-600">
                    {encargado?.especialidad || 'Sin especialidad'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-esant-red text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {pendientes.length}
                </span>
                <Icon
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  className="text-esant-gray-600"
                />
              </div>
            </button>

            {/* Pendientes List - Colapsable */}
            {isExpanded && (
              <div className="border-t border-esant-gray-200">
                {pendientes.map((pendiente) => renderPendienteItem(pendiente, true))}
              </div>
            )}
          </div>
        );
      })}

      {/* FAB */}
      <FAB onClick={() => setShowNewModal(true)} icon="plus" label="Nuevo pendiente" />

      {/* Modal Nuevo Pendiente */}
      <Modal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        title="Nuevo Pendiente"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-esant-gray-600 mb-2">Tarea *</label>
            <input
              type="text"
              value={newPendiente.tarea}
              onChange={(e) => setNewPendiente({ ...newPendiente, tarea: e.target.value })}
              placeholder="Descripción de la tarea..."
              className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-esant-gray-200 text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-esant-gray-600 mb-2">Área/Sector *</label>
            <select
              value={newPendiente.area}
              onChange={(e) => setNewPendiente({ ...newPendiente, area: e.target.value })}
              className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-esant-gray-200 text-esant-black focus:outline-none focus:border-esant-black transition-colors text-base"
            >
              <option value="">Seleccionar área...</option>
              {AREAS_COMUNES.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-esant-gray-600 mb-2">Encargado</label>
            <select
              value={newPendiente.encargadoId}
              onChange={(e) => setNewPendiente({ ...newPendiente, encargadoId: e.target.value })}
              className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-esant-gray-200 text-esant-black focus:outline-none focus:border-esant-black transition-colors text-base"
            >
              <option value="">Sin asignar</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>{member.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-esant-gray-600 mb-2">Notas adicionales</label>
            <textarea
              value={newPendiente.notasAdicionales}
              onChange={(e) => setNewPendiente({ ...newPendiente, notasAdicionales: e.target.value })}
              placeholder="Observaciones, detalles..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-esant-gray-200 rounded-lg text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors text-base resize-none"
            />
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={handleCreatePendiente}
            disabled={!newPendiente.tarea.trim() || !newPendiente.area || createMutation.isPending}
          >
            {createMutation.isPending ? 'Creando...' : 'Crear Pendiente'}
          </Button>
        </div>
      </Modal>

      {/* Modal Pausar Pendiente */}
      <Modal
        isOpen={showPauseModal}
        onClose={() => {
          setShowPauseModal(false);
          setPausingPendiente(null);
        }}
        title="Pausar Tarea"
      >
        <div className="space-y-4">
          {pausingPendiente && (
            <div className="bg-esant-gray-50 rounded-lg p-4">
              <p className="text-sm text-esant-gray-500 mb-1">Tarea a pausar:</p>
              <p className="font-medium text-esant-black">{pausingPendiente.tarea}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-esant-gray-600 mb-2">
              Motivo de la pausa (opcional)
            </label>
            <textarea
              value={pauseMotivo}
              onChange={(e) => setPauseMotivo(e.target.value)}
              placeholder="Ej: Esperando materiales, Cliente solicitó esperar..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-esant-gray-200 rounded-lg text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors text-base resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setShowPauseModal(false);
                setPausingPendiente(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={confirmPause}
              disabled={pauseMutation.isPending}
            >
              {pauseMutation.isPending ? 'Pausando...' : 'Confirmar Pausa'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Detalle Pendiente */}
      {detailPendiente && currentProject && (
        <PendienteDetailModal
          pendiente={detailPendiente}
          proyectoId={currentProject.id}
          onClose={() => setDetailPendiente(null)}
        />
      )}
    </div>
  );
};

// Detail Modal Component
interface PendienteDetailModalProps {
  pendiente: Pendiente;
  proyectoId: string;
  onClose: () => void;
}

const PendienteDetailModal = ({ pendiente, proyectoId, onClose }: PendienteDetailModalProps) => {
  const { uploadFiles, removeAttachment, isUploading, uploadProgress } = useAttachments({
    proyectoId,
    pendienteId: pendiente.id,
    currentAttachments: pendiente.attachments || [],
  });

  const handleUpload = async (files: FileList) => {
    await uploadFiles(files);
  };

  const handleRemove = async (url: string) => {
    await removeAttachment(url);
  };

  return (
    <Modal isOpen onClose={onClose} title={pendiente.tarea}>
      <div className="space-y-4">
        {/* Estado */}
        <div>
          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${PENDIENTE_ESTADO_COLORS[pendiente.estado]?.bg} ${PENDIENTE_ESTADO_COLORS[pendiente.estado]?.text}`}>
            <div className={`w-2 h-2 rounded-full ${PENDIENTE_ESTADO_COLORS[pendiente.estado]?.indicator}`}></div>
            {PENDIENTE_ESTADO_LABELS[pendiente.estado] || pendiente.estado}
          </span>
        </div>

        {/* Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-esant-gray-600">
            <Icon name="map-pin" size={14} />
            <span>{pendiente.area}</span>
          </div>
          {pendiente.encargado && (
            <div className="flex items-center gap-2 text-esant-gray-600">
              <Icon name="user" size={14} />
              <span>
                {pendiente.encargado.nombre}
                {pendiente.encargado.especialidad && ` - ${pendiente.encargado.especialidad}`}
              </span>
            </div>
          )}
        </div>

        {/* Descripcion */}
        {pendiente.descripcion && (
          <div>
            <label className="block text-sm font-medium text-esant-gray-600 mb-1">Descripción</label>
            <p className="text-esant-gray-800 bg-esant-gray-50 rounded-lg p-3 text-sm">{pendiente.descripcion}</p>
          </div>
        )}

        {/* Notas adicionales */}
        {pendiente.notasAdicionales && (
          <div>
            <label className="block text-sm font-medium text-esant-gray-600 mb-1">Notas</label>
            <p className="text-esant-gray-800 bg-esant-gray-50 rounded-lg p-3 text-sm">{pendiente.notasAdicionales}</p>
          </div>
        )}

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium text-esant-gray-600 mb-2">
            Archivos adjuntos
          </label>
          <AttachmentUploader
            attachments={pendiente.attachments || []}
            onUpload={handleUpload}
            onRemove={handleRemove}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        </div>

        {/* Close button */}
        <Button variant="secondary" fullWidth onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </Modal>
  );
};
