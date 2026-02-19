import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FAB } from '../../components/common/FAB';
import { NoProjectSelected } from '../../components/common/NoProjectSelected';
import { useProjectStore } from '../../store/useProjectStore';
import { useAuthStore } from '../../store/useAuthStore';
import { usePermissions } from '../../hooks/usePermissions';
import { useProgramaStore } from '../../store/useProgramaStore';
import { usePendientes } from '../../hooks/usePendientes';
import {
  useInformes,
  useGenerateInforme,
  useDeleteInforme,
  useExportInformePDF,
} from '../../hooks/useInformes';
import type { Informe, InformeContenido, Periodicidad, SectorStatus } from '../../types';

const PERIODICIDAD_OPTIONS: { value: Periodicidad; label: string }[] = [
  { value: 'diario', label: 'Diario' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'mensual', label: 'Mensual' },
];

const STATUS_LABELS: Record<SectorStatus, string> = {
  pendiente: 'Pendiente',
  en_curso: 'En Curso',
  pausado: 'Pausado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

const STATUS_COLORS: Record<SectorStatus, { bg: string; text: string }> = {
  pendiente: { bg: 'bg-gray-100', text: 'text-gray-700' },
  en_curso: { bg: 'bg-blue-100', text: 'text-blue-700' },
  pausado: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  entregado: { bg: 'bg-green-100', text: 'text-green-700' },
  cancelado: { bg: 'bg-red-100', text: 'text-red-700' },
};

export const InformesPage = () => {
  const { currentProject } = useProjectStore();
  const { user } = useAuthStore();
  const { canGenerateInformes } = usePermissions();
  const { projectSectors } = useProgramaStore();

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInforme, setSelectedInforme] = useState<Informe | null>(null);
  const [step, setStep] = useState<'config' | 'preview'>('config');
  const [periodicidad, setPeriodicidad] = useState<Periodicidad>('semanal');
  const [resumen, setResumen] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const proyectoId = currentProject?.id || '';
  const { data: informes = [], isLoading } = useInformes(proyectoId);
  const { data: pendientes = [] } = usePendientes(proyectoId);

  const generateMutation = useGenerateInforme();
  const deleteMutation = useDeleteInforme();
  const exportMutation = useExportInformePDF();

  // Get sector states from programa store
  const sectorsRecord = projectSectors[proyectoId] || {};

  // Calculate stats for preview
  const previewStats = useMemo(() => {
    const completados = pendientes.filter(p => p.estado === 'completada').length;
    const total = pendientes.length;

    // Get active sectors with status (convert Record to array)
    const sectoresEstado = Object.entries(sectorsRecord)
      .filter(([, data]) => data.status !== 'cancelado')
      .map(([sectorNombre, data]) => ({
        sectorNombre,
        status: data.status as SectorStatus,
      }));

    return {
      pendientesCompletados: completados,
      pendientesTotales: total,
      asistenciaPromedio: 85, // Mock for now
      sectoresEstado,
    };
  }, [pendientes, sectorsRecord]);

  const handleOpenGenerate = () => {
    setStep('config');
    setPeriodicidad('semanal');
    setResumen('');
    setObservaciones('');
    setShowGenerateModal(true);
  };

  const handlePreview = () => {
    if (!resumen.trim()) {
      toast.error('Ingresa un resumen del informe');
      return;
    }
    setStep('preview');
  };

  const handleGenerate = async () => {
    if (!currentProject || !user) return;

    const contenido: InformeContenido = {
      resumen,
      pendientesCompletados: previewStats.pendientesCompletados,
      pendientesTotales: previewStats.pendientesTotales,
      asistenciaPromedio: previewStats.asistenciaPromedio,
      sectoresEstado: previewStats.sectoresEstado,
      observaciones,
    };

    try {
      await generateMutation.mutateAsync({
        proyectoId: currentProject.id,
        periodicidad,
        contenido,
        userId: user.id,
      });
      toast.success('Informe generado exitosamente');
      setShowGenerateModal(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al generar informe');
    }
  };

  const handleViewDetail = (informe: Informe) => {
    setSelectedInforme(informe);
    setShowDetailModal(true);
  };

  const handleExport = async (informe: Informe) => {
    try {
      const url = await exportMutation.mutateAsync(informe);
      window.open(url, '_blank');
      toast.success('Informe exportado');
    } catch (err) {
      toast.error('Error al exportar informe');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este informe?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Informe eliminado');
      setShowDetailModal(false);
    } catch (err) {
      toast.error('Error al eliminar');
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
    return <NoProjectSelected icon="file-text" message="Selecciona o crea un proyecto para ver los informes" />;
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <Card className="p-6">
        <h2 className="font-semibold text-xl text-gray-900 mb-1">Informes</h2>
        <p className="text-sm text-gray-600">Historial y generación de informes</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{informes.length}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {informes.filter(i => i.periodicidad === 'semanal').length}
            </p>
            <p className="text-xs text-gray-500">Semanales</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {informes.filter(i => i.periodicidad === 'mensual').length}
            </p>
            <p className="text-xs text-gray-500">Mensuales</p>
          </div>
        </div>
      </Card>

      {/* Informes List */}
      {informes.length === 0 ? (
        <Card className="p-8 text-center">
          <Icon name="file-text" size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No hay informes generados</p>
          {canGenerateInformes && (
            <p className="text-sm text-gray-400">Genera el primer informe del proyecto</p>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {informes.map((informe) => (
            <Card
              key={informe.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewDetail(informe)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-esant-red/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="file-text" size={20} className="text-esant-red" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Informe #{informe.numero}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {format(informe.fecha, "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded capitalize">
                      {informe.periodicidad}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExport(informe);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Exportar PDF"
                  >
                    <Icon name="download" size={18} className="text-gray-500" />
                  </button>
                  <Icon name="chevron-right" size={18} className="text-gray-400" />
                </div>
              </div>

              {/* Preview of content */}
              <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                {informe.contenido.resumen}
              </p>

              {/* Quick stats */}
              <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <span>
                  <Icon name="check-circle" size={14} className="inline mr-1" />
                  {informe.contenido.pendientesCompletados}/{informe.contenido.pendientesTotales} pendientes
                </span>
                <span>
                  <Icon name="users" size={14} className="inline mr-1" />
                  {informe.contenido.asistenciaPromedio}% asistencia
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* FAB for new report */}
      {canGenerateInformes && (
        <FAB onClick={handleOpenGenerate} />
      )}

      {/* Generate Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title={step === 'config' ? 'Generar Informe' : 'Vista Previa'}
      >
        {step === 'config' ? (
          <div className="space-y-4">
            {/* Periodicidad */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Periodicidad
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PERIODICIDAD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPeriodicidad(opt.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      periodicidad === opt.value
                        ? 'bg-esant-black text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resumen */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Resumen del período *
              </label>
              <textarea
                value={resumen}
                onChange={(e) => setResumen(e.target.value)}
                placeholder="Describe los avances y eventos importantes del período..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-esant-black transition-colors resize-none"
              />
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Observaciones (opcional)
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas adicionales, alertas o recomendaciones..."
                rows={2}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-esant-black transition-colors resize-none"
              />
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={handlePreview}
              disabled={!resumen.trim()}
            >
              Vista Previa
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview Header */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Informe</span>
                <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded capitalize">
                  {periodicidad}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {format(new Date(), "d 'de' MMMM, yyyy", { locale: es })}
              </p>
            </div>

            {/* Stats Preview */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-lg font-bold text-gray-900">
                  {previewStats.pendientesCompletados}/{previewStats.pendientesTotales}
                </p>
                <p className="text-xs text-gray-500">Pendientes</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-lg font-bold text-gray-900">
                  {previewStats.asistenciaPromedio}%
                </p>
                <p className="text-xs text-gray-500">Asistencia</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-lg font-bold text-gray-900">
                  {previewStats.sectoresEstado.length}
                </p>
                <p className="text-xs text-gray-500">Sectores</p>
              </div>
            </div>

            {/* Resumen Preview */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-1">Resumen</h4>
              <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">
                {resumen}
              </p>
            </div>

            {/* Sectores Preview */}
            {previewStats.sectoresEstado.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Estado de Sectores</h4>
                <div className="space-y-2">
                  {previewStats.sectoresEstado.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-800">{s.sectorNombre}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[s.status].bg} ${STATUS_COLORS[s.status].text}`}>
                        {STATUS_LABELS[s.status]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Observaciones Preview */}
            {observaciones && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-1">Observaciones</h4>
                <p className="text-sm text-gray-800 bg-yellow-50 p-3 rounded-lg">
                  {observaciones}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="secondary" fullWidth onClick={() => setStep('config')}>
                Editar
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? 'Generando...' : 'Generar Informe'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedInforme ? `Informe #${selectedInforme.numero}` : ''}
      >
        {selectedInforme && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {format(selectedInforme.fecha, "d 'de' MMMM, yyyy", { locale: es })}
                </p>
                <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded capitalize">
                  {selectedInforme.periodicidad}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport(selectedInforme)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Exportar PDF"
                >
                  <Icon name="download" size={20} className="text-gray-600" />
                </button>
                {canGenerateInformes && (
                  <button
                    onClick={() => handleDelete(selectedInforme.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Icon name="trash-2" size={20} className="text-red-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-lg font-bold text-gray-900">
                  {selectedInforme.contenido.pendientesCompletados}/{selectedInforme.contenido.pendientesTotales}
                </p>
                <p className="text-xs text-gray-500">Pendientes</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-lg font-bold text-gray-900">
                  {selectedInforme.contenido.asistenciaPromedio}%
                </p>
                <p className="text-xs text-gray-500">Asistencia</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-lg font-bold text-gray-900">
                  {selectedInforme.contenido.sectoresEstado.length}
                </p>
                <p className="text-xs text-gray-500">Sectores</p>
              </div>
            </div>

            {/* Resumen */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-1">Resumen</h4>
              <p className="text-sm text-gray-800 leading-relaxed">
                {selectedInforme.contenido.resumen}
              </p>
            </div>

            {/* Sectores */}
            {selectedInforme.contenido.sectoresEstado.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Estado de Sectores</h4>
                <div className="space-y-2">
                  {selectedInforme.contenido.sectoresEstado.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-800">{s.sectorNombre}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[s.status].bg} ${STATUS_COLORS[s.status].text}`}>
                        {STATUS_LABELS[s.status]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Observaciones */}
            {selectedInforme.contenido.observaciones && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-1">Observaciones</h4>
                <p className="text-sm text-gray-800 bg-yellow-50 p-3 rounded-lg">
                  {selectedInforme.contenido.observaciones}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
