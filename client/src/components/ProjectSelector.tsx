import { useState, useRef, useEffect } from 'react';
import { Icon } from './common/Icon';
import { useProjectStore } from '../store/useProjectStore';
import { useProyectos } from '../hooks/useProyectos';
import { ProjectFormModal } from './project/ProjectFormModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import type { ProyectoListItem } from '../types';

interface ProjectSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectSelector({ isOpen, onClose }: ProjectSelectorProps) {
  const { currentProject, setCurrentProject } = useProjectStore();
  const { data: projects, isLoading } = useProyectos();
  const [searchTerm, setSearchTerm] = useState('');
  const [formModalMode, setFormModalMode] = useState<'create' | 'edit' | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProyectoListItem | null>(null);
  const wasCreatingRef = useRef(false);

  // Track when we enter create mode
  useEffect(() => {
    if (formModalMode === 'create') {
      wasCreatingRef.current = true;
    }
  }, [formModalMode]);

  const handleSelectProject = (project: ProyectoListItem) => {
    setCurrentProject(project);
    onClose();
  };

  const handleOpenCreateModal = () => {
    setSelectedProject(null);
    setFormModalMode('create');
  };

  const handleOpenEditModal = (project: ProyectoListItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProject(project);
    setFormModalMode('edit');
  };

  const handleOpenDeleteModal = (project: ProyectoListItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProject(project);
    setDeleteModalOpen(true);
  };

  const handleCloseFormModal = () => {
    const wasCreating = wasCreatingRef.current;
    setFormModalMode(null);
    setSelectedProject(null);
    wasCreatingRef.current = false;

    // Auto-close selector after successful project creation
    // (the form already auto-selects the new project via setCurrentProject)
    if (wasCreating) {
      onClose();
    }
  };

  const filteredProjects = projects?.filter((project) =>
    project.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-20 max-w-2xl mx-auto z-50 animate-slideDown">
        <div className="bg-white rounded-2xl shadow-2xl max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Seleccionar Proyecto</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenCreateModal}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Icon name="plus" className="w-4 h-4" />
                  <span className="hidden sm:inline">Nuevo</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Icon name="x" className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar proyecto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Projects List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-red-500" />
              </div>
            ) : filteredProjects && filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div key={project.id} className="relative group">
                  <button
                    onClick={() => handleSelectProject(project)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                      currentProject?.id === project.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {project.nombre}
                          </h3>
                          {currentProject?.id === project.id && (
                            <Icon name="check-circle" className="w-5 h-5 text-red-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Cliente: {project.cliente}
                        </p>
                        <div className="flex items-center gap-3 text-xs">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full font-medium ${
                              project.estado === 'en_obra'
                                ? 'bg-yellow-100 text-yellow-800'
                                : project.estado === 'planificacion'
                                ? 'bg-gray-200 text-gray-800'
                                : project.estado === 'terminado'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {project.estado === 'en_obra'
                              ? 'En Obra'
                              : project.estado === 'planificacion'
                              ? 'Planificación'
                              : project.estado === 'terminado'
                              ? 'Terminado'
                              : 'Pausado'}
                          </span>
                          {project.direccion && (
                            <span className="text-gray-500 flex items-center gap-1">
                              <Icon name="map-pin" className="w-3 h-3" />
                              {project.direccion}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Project Icon */}
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                          currentProject?.id === project.id
                            ? 'bg-red-100'
                            : 'bg-gray-100'
                        }`}
                      >
                        <Icon
                          name="building"
                          className={`w-6 h-6 ${
                            currentProject?.id === project.id ? 'text-red-600' : 'text-gray-600'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Additional Info */}
                    {project.descripcion && (
                      <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                        {project.descripcion}
                      </p>
                    )}
                  </button>

                  {/* Action Buttons - Shown on hover */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => handleOpenEditModal(project, e)}
                      className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50 hover:text-red-600 transition-colors border border-gray-200"
                      title="Editar proyecto"
                    >
                      <Icon name="edit-2" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleOpenDeleteModal(project, e)}
                      className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50 hover:text-red-600 transition-colors border border-gray-200"
                      title="Eliminar proyecto"
                    >
                      <Icon name="trash-2" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Icon name="inbox" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No se encontraron proyectos</p>
                <p className="text-sm text-gray-500 mt-1">
                  {searchTerm
                    ? 'Intenta con otro término de búsqueda'
                    : 'Crea tu primer proyecto para comenzar'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={handleOpenCreateModal}
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#DC2626] text-white rounded-xl font-medium hover:bg-[#B91C1C] transition-colors text-sm"
                  >
                    <Icon name="plus" className="w-4 h-4" />
                    Crear proyecto
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredProjects && filteredProjects.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <p className="text-xs text-gray-600 text-center">
                {filteredProjects.length} proyecto{filteredProjects.length !== 1 ? 's' : ''}{' '}
                {searchTerm ? 'encontrado' : 'disponible'}
                {filteredProjects.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Project Form Modal (Create/Edit) */}
      <ProjectFormModal
        mode={formModalMode || 'create'}
        project={formModalMode === 'edit' ? selectedProject || undefined : undefined}
        isOpen={formModalMode !== null}
        onClose={handleCloseFormModal}
      />

      {/* Delete Confirm Modal */}
      {selectedProject && (
        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedProject(null);
          }}
          project={selectedProject}
        />
      )}
    </>
  );
}
