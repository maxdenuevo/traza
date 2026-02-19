import { useState, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import {
  DOCUMENTO_CATEGORIA_LABELS,
  DOCUMENTO_CATEGORIA_COLORS,
  DOCUMENTO_CATEGORIAS,
  PERMISO_ESTADO_COLORS,
  formatFileSize,
} from '../../constants';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { FAB } from '../../components/common/FAB';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { NoProjectSelected } from '../../components/common/NoProjectSelected';
import { useProjectStore } from '../../store/useProjectStore';
import { useAuthStore } from '../../store/useAuthStore';
import {
  useDocumentos,
  useUploadDocumento,
  useDeleteDocumento,
} from '../../hooks/useDocumentos';
import { usePermisos, useCreatePermiso, useUpdatePermiso, useDeletePermiso } from '../../hooks/usePermisos';
import { documentosService } from '../../services/documentos';
import type { Documento, DocumentoCategoria, Permiso, PermisoEstado, PermisoTipo } from '../../types';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

type FeedItemType = 'documento' | 'permiso' | 'all';

type FeedItem = {
  id: string;
  type: 'documento' | 'permiso';
  createdAt: Date;
  data: Documento | Permiso;
};

export const DocumentosPage = () => {
  const { currentProject } = useProjectStore();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<FeedItemType>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'documento' | 'permiso'>('documento');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch data
  const { data: documentos = [], isLoading: loadingDocs } = useDocumentos(currentProject?.id || '');
  const { data: permisos = [], isLoading: loadingPermisos } = usePermisos(currentProject?.id || '');

  // Mutations
  const uploadDocMutation = useUploadDocumento();
  const deleteDocMutation = useDeleteDocumento();
  const createPermisoMutation = useCreatePermiso();
  const updatePermisoMutation = useUpdatePermiso();
  const deletePermisoMutation = useDeletePermiso();

  // Form states
  const [selectedCategory, setSelectedCategory] = useState<DocumentoCategoria>('planos');
  const [permisoForm, setPermisoForm] = useState({
    nombre: '',
    tipo: 'edificacion' as PermisoTipo,
    estado: 'pendiente' as PermisoEstado,
    notas: '',
  });

  const isLoading = loadingDocs || loadingPermisos;

  // Combine all items into feed
  const feedItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [
      ...documentos.map((doc) => ({ id: doc.id, type: 'documento' as const, createdAt: doc.createdAt, data: doc })),
      ...permisos.map((permiso) => ({ id: permiso.id, type: 'permiso' as const, createdAt: permiso.createdAt, data: permiso })),
    ];

    // Sort by date desc
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Filter if needed
    if (filter !== 'all') {
      return items.filter(item => item.type === filter);
    }

    return items;
  }, [documentos, permisos, filter]);

  // Handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !currentProject || !user) return;

    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} es demasiado grande (máx 10MB)`);
          continue;
        }
        await uploadDocMutation.mutateAsync({
          file,
          proyectoId: currentProject.id,
          categoria: selectedCategory,
          userId: user.id,
        });
      }
      toast.success(`${files.length} documento(s) subido(s)`);
      setShowAddModal(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir');
    } finally {
      setUploading(false);
    }
  };

  const handleCreatePermiso = async () => {
    if (!permisoForm.nombre.trim() || !currentProject) return;

    try {
      await createPermisoMutation.mutateAsync({
        proyectoId: currentProject.id,
        ...permisoForm,
      });
      toast.success('Permiso creado');
      setPermisoForm({ nombre: '', tipo: 'edificacion', estado: 'pendiente', notas: '' });
      setShowAddModal(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear permiso');
    }
  };

  const handleDeleteItem = async (item: FeedItem) => {
    const confirmMsg = item.type === 'documento'
      ? `¿Eliminar "${(item.data as Documento).nombre}"?`
      : `¿Eliminar permiso "${(item.data as Permiso).nombre}"?`;

    if (!confirm(confirmMsg)) return;

    try {
      if (item.type === 'documento') {
        await deleteDocMutation.mutateAsync(item.id);
      } else {
        await deletePermisoMutation.mutateAsync(item.id);
      }
      toast.success('Eliminado');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const handleUpdatePermisoEstado = async (permiso: Permiso, nuevoEstado: PermisoEstado) => {
    try {
      await updatePermisoMutation.mutateAsync({ id: permiso.id, updates: { estado: nuevoEstado } });
      toast.success('Estado actualizado');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar');
    }
  };

  // Render functions
  const getItemIcon = (item: FeedItem): string => {
    if (item.type === 'documento') {
      const doc = item.data as Documento;
      switch (doc.tipo) {
        case 'pdf': return 'file-text';
        case 'docx': return 'file-text';
        case 'xlsx': return 'file-spreadsheet';
        case 'jpg':
        case 'png': return 'image';
        default: return 'file';
      }
    } else {
      return 'scroll-text';
    }
  };

  const renderFeedItem = (item: FeedItem) => {
    if (item.type === 'documento') {
      const doc = item.data as Documento;
      return (
        <div key={item.id} className="bg-esant-white rounded-xl shadow-esant p-5 hover:shadow-lg smooth-transition">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`w-10 h-10 rounded-lg ${DOCUMENTO_CATEGORIA_COLORS[doc.categoria]?.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon name={getItemIcon(item)} size={20} className={DOCUMENTO_CATEGORIA_COLORS[doc.categoria]?.text} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded ${DOCUMENTO_CATEGORIA_COLORS[doc.categoria]?.bg} ${DOCUMENTO_CATEGORIA_COLORS[doc.categoria]?.text} font-medium`}>
                    {DOCUMENTO_CATEGORIA_LABELS[doc.categoria]}
                  </span>
                  <span className="text-xs text-esant-gray-400">
                    {formatDistanceToNow(doc.createdAt, { addSuffix: true, locale: es })}
                  </span>
                </div>
                <h4 className="font-medium text-base text-esant-black mb-1 truncate">{doc.nombre}</h4>
                <div className="flex flex-wrap gap-2 text-xs text-esant-gray-600">
                  <span>{formatFileSize(doc.tamaño)}</span>
                  <span>•</span>
                  <span className="uppercase">{doc.tipo}</span>
                  {doc.autor && (
                    <>
                      <span>•</span>
                      <span>{doc.autor.nombre}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => window.open(doc.url, '_blank')}
                className="p-2 hover:bg-esant-gray-100 rounded-lg transition-colors"
                title="Ver"
              >
                <Icon name="eye" size={16} className="text-esant-gray-600" />
              </button>
              <button
                onClick={() => documentosService.downloadDocument(doc.url, doc.nombre)}
                className="p-2 hover:bg-esant-gray-100 rounded-lg transition-colors"
                title="Descargar"
              >
                <Icon name="download" size={16} className="text-esant-gray-600" />
              </button>
              <button
                onClick={() => handleDeleteItem(item)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar"
              >
                <Icon name="trash-2" size={16} className="text-esant-red" />
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      const permiso = item.data as Permiso;
      const colors = PERMISO_ESTADO_COLORS[permiso.estado];
      return (
        <div key={item.id} className="bg-esant-white rounded-xl shadow-esant p-5 hover:shadow-lg smooth-transition">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3 flex-1">
              <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon name="scroll-text" size={20} className={colors.text} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded ${colors.bg} ${colors.text} font-medium`}>
                    Permiso
                  </span>
                  <span className="text-xs text-esant-gray-400">
                    {formatDistanceToNow(permiso.createdAt, { addSuffix: true, locale: es })}
                  </span>
                </div>
                <h4 className="font-medium text-base text-esant-black mb-1">{permiso.nombre}</h4>
                <p className="text-xs text-esant-gray-600 capitalize">{permiso.tipo.replace('_', ' ')}</p>
                {permiso.fechaVencimiento && (
                  <p className="text-xs text-esant-gray-600 mt-1">
                    Vence: {format(permiso.fechaVencimiento, "d 'de' MMM yyyy", { locale: es })}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleDeleteItem(item)}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              title="Eliminar"
            >
              <Icon name="trash-2" size={16} className="text-esant-red" />
            </button>
          </div>
          {/* Estado selector */}
          <div className="flex gap-2 pt-3 border-t border-esant-gray-200">
            {(['pendiente', 'en_tramite', 'aprobado', 'vencido'] as PermisoEstado[]).map((estado) => {
              const isActive = permiso.estado === estado;
              const btnColors = PERMISO_ESTADO_COLORS[estado];
              return (
                <button
                  key={estado}
                  onClick={() => handleUpdatePermisoEstado(permiso, estado)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? `${btnColors.bg} ${btnColors.text}`
                      : 'bg-esant-gray-100 text-esant-gray-600 hover:bg-esant-gray-200'
                  }`}
                >
                  {estado.replace('_', ' ')}
                </button>
              );
            })}
          </div>
        </div>
      );
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
    return <NoProjectSelected icon="folder" message="Selecciona o crea un proyecto para ver los documentos" />;
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <Card className="p-6">
        <h2 className="font-semibold text-xl text-esant-black mb-1">Documentos y Gestión</h2>
        <p className="text-sm text-esant-gray-600">Documentos y permisos del proyecto</p>

        {/* Filters */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-esant-gray-200 overflow-x-auto">
          {[
            { value: 'all' as const, label: 'Todo', count: feedItems.length },
            { value: 'documento' as const, label: 'Documentos', count: documentos.length },
            { value: 'permiso' as const, label: 'Permisos', count: permisos.length },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === f.value
                  ? 'bg-esant-black text-esant-white'
                  : 'bg-esant-gray-100 text-esant-gray-600 hover:bg-esant-gray-200'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </Card>

      {/* Feed */}
      {feedItems.length === 0 ? (
        <Card className="p-8 text-center">
          <Icon name="inbox" size={48} className="text-esant-gray-400 mx-auto mb-3" />
          <p className="text-esant-gray-600 mb-2">No hay contenido</p>
          <p className="text-sm text-esant-gray-400">Agrega documentos o permisos</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {feedItems.map(renderFeedItem)}
        </div>
      )}

      {/* FAB */}
      <FAB onClick={() => setShowAddModal(true)} />

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => !uploading && setShowAddModal(false)}
        title="Agregar Contenido"
      >
        <div className="space-y-4">
          {/* Type selector */}
          <div className="flex gap-2">
            {[
              { value: 'documento' as const, label: 'Documento', icon: 'file' },
              { value: 'permiso' as const, label: 'Permiso', icon: 'scroll-text' },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setAddType(t.value)}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  addType === t.value
                    ? 'bg-esant-black text-esant-white'
                    : 'bg-esant-gray-100 text-esant-gray-600 hover:bg-esant-gray-200'
                }`}
              >
                <Icon name={t.icon} size={16} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Documento form */}
          {addType === 'documento' && (
            <>
              <div>
                <label className="block text-sm font-medium text-esant-gray-600 mb-2">Categoría</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as DocumentoCategoria)}
                  className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-esant-gray-200 text-esant-black focus:outline-none focus:border-esant-black transition-colors text-base"
                  disabled={uploading}
                >
                  {DOCUMENTO_CATEGORIAS.map((cat) => (
                    <option key={cat} value={cat}>{DOCUMENTO_CATEGORIA_LABELS[cat]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-esant-gray-600 mb-2">Archivo(s)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-esant-gray-200 text-esant-black focus:outline-none focus:border-esant-black transition-colors text-base file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-esant-gray-100 file:text-esant-black hover:file:bg-esant-gray-200"
                />
                <p className="text-xs text-esant-gray-400 mt-2">Máximo 10MB</p>
              </div>
              {uploading && (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="md" />
                  <span className="ml-3 text-sm text-esant-gray-600">Subiendo...</span>
                </div>
              )}
            </>
          )}

          {/* Permiso form */}
          {addType === 'permiso' && (
            <>
              <div>
                <label className="block text-sm font-medium text-esant-gray-600 mb-2">Nombre</label>
                <input
                  type="text"
                  value={permisoForm.nombre}
                  onChange={(e) => setPermisoForm({ ...permisoForm, nombre: e.target.value })}
                  placeholder="Ej: Permiso de edificación"
                  className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-esant-gray-200 text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-esant-gray-600 mb-2">Tipo</label>
                <select
                  value={permisoForm.tipo}
                  onChange={(e) => setPermisoForm({ ...permisoForm, tipo: e.target.value as PermisoTipo })}
                  className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-esant-gray-200 text-esant-black focus:outline-none focus:border-esant-black transition-colors text-base"
                >
                  <option value="edificacion">Edificación</option>
                  <option value="municipal">Municipal</option>
                  <option value="recepcion_obra">Recepción de Obra</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-esant-gray-600 mb-2">Notas (opcional)</label>
                <textarea
                  value={permisoForm.notas}
                  onChange={(e) => setPermisoForm({ ...permisoForm, notas: e.target.value })}
                  placeholder="Notas adicionales..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-esant-gray-200 rounded-lg text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors text-base resize-none"
                />
              </div>
              <Button variant="primary" fullWidth onClick={handleCreatePermiso} disabled={!permisoForm.nombre.trim()}>
                Crear Permiso
              </Button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
