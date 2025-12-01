import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { useAuthStore } from '../../store/useAuthStore';
import { useProjectStore } from '../../store/useProjectStore';
import { useProyectos } from '../../hooks/useProyectos';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProjectSelector: () => void;
}

// Navigation items matching the client mockup order
const DRAWER_NAV_ITEMS = [
  { id: 'visitas', label: 'Visita', icon: 'calendar' },
  { id: 'pendientes', label: 'Pendientes', icon: 'clipboard-list' },
  { id: 'presupuesto', label: 'Presupuesto / Gastos', icon: 'wallet' },
  { id: 'permisos', label: 'Permisos', icon: 'file-check' },
  { id: 'documentos', label: 'Documentos', icon: 'folder' },
  { id: 'notas', label: 'Notas equipo', icon: 'message-square' },
  { id: 'equipo', label: 'Equipo', icon: 'users' },
  { id: 'cronograma', label: 'Cronograma', icon: 'list-checks' },
];

export const Drawer = ({ isOpen, onClose, onOpenProjectSelector }: DrawerProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuthStore();
  const { currentProject, setCurrentProject } = useProjectStore();
  const { data: projects } = useProyectos();

  const currentPath = location.pathname.split('/')[1] || 'visitas';

  const handleNavClick = (id: string) => {
    navigate(`/${id}`);
    onClose();
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProjectSwitch = () => {
    onOpenProjectSelector();
    onClose();
  };

  // Get other projects for the "Cambiar proyecto" section
  const otherProjects = projects?.filter(p => p.id !== currentProject?.id) || [];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-[85vw] max-w-[280px] bg-[#1A1A1A] z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10">
          <p className="text-white/60 text-sm font-medium mb-1">Menú</p>
          <h2 className="text-white text-xl font-bold uppercase tracking-wide">
            {currentProject?.nombre || 'Sin proyecto'}
          </h2>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {DRAWER_NAV_ITEMS.map((item) => {
            const isActive = currentPath === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-colors relative ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                {/* Active indicator - red left border */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E53935]" />
                )}
                <Icon name={item.icon} className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Project Switcher Section */}
        <div className="border-t border-white/10 mt-auto">
          <button
            onClick={handleProjectSwitch}
            className="w-full flex items-center justify-between px-6 py-4 text-white/80 hover:bg-white/5 hover:text-white transition-colors"
          >
            <span className="font-medium">Cambiar proyecto</span>
            <Icon name="chevron-down" className="w-5 h-5" />
          </button>

          {/* Show other projects */}
          {otherProjects.length > 0 && (
            <div className="px-6 pb-4 space-y-2">
              {otherProjects.slice(0, 3).map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    setCurrentProject(project);
                    onClose();
                  }}
                  className="w-full text-left px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-sm"
                >
                  {project.nombre}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="border-t border-white/10 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#E53935] hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Icon name="log-out" className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </>
  );
};
