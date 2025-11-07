import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { useAuthStore } from '../../store/useAuthStore';
import { ProjectSelector } from '../ProjectSelector';

interface HeaderProps {
  projectName: string;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

export const Header = ({
  projectName,
  notificationCount = 0,
  onNotificationClick
}: HeaderProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [projectSelectorOpen, setProjectSelectorOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleOpenProjectSelector = () => {
    setMenuOpen(false);
    setProjectSelectorOpen(true);
  };

  return (
    <header className="bg-esant-white shadow-esant sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo and Project Name */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="btn-touch p-2 rounded-lg hover:bg-esant-gray-100 smooth-transition"
            aria-label="Menu"
          >
            <Icon name="menu" size={24} />
          </button>
          <button
            onClick={handleOpenProjectSelector}
            className="text-left hover:bg-esant-gray-100 px-2 py-1 rounded-lg transition-colors"
          >
            <h1 className="text-lg font-bold text-esant-black leading-tight">ESANT MARIA</h1>
            <div className="flex items-center gap-1">
              <p className="text-xs text-esant-gray-600 leading-tight">{projectName}</p>
              <Icon name="chevron-down" className="w-3 h-3 text-esant-gray-400" />
            </div>
          </button>
        </div>

        {/* Notifications */}
        <button
          onClick={onNotificationClick}
          className="btn-touch relative p-2 rounded-lg hover:bg-esant-gray-100 smooth-transition"
          aria-label="Notificaciones"
        >
          <Icon name="bell" size={24} />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-esant-red text-esant-white text-xs font-bold rounded min-w-[20px] h-5 px-1 flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>
      </div>

      {/* Dropdown Menu - Estilo minimalista ESANT MARIA */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-esant-black bg-opacity-25 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute top-full left-0 w-72 bg-esant-black text-esant-white shadow-esant-md rounded-2xl z-50 slide-in active m-4 overflow-hidden">
            {/* User Info */}
            {user && (
              <div className="px-6 py-4 border-b border-white/10">
                <p className="font-semibold text-esant-white">{user.nombre}</p>
                <p className="text-sm text-esant-gray-400">{user.email}</p>
                <p className="text-xs text-esant-gray-600 mt-1 capitalize">{user.rol.replace('_', ' ')}</p>
              </div>
            )}

            <nav className="py-2">
              <button
                onClick={handleOpenProjectSelector}
                className="w-full text-left block px-6 py-4 hover:bg-white/5 smooth-transition border-b border-white/10"
              >
                <div className="flex items-center gap-3">
                  <Icon name="building" className="w-5 h-5" />
                  <span className="font-medium text-lg">Cambiar Proyecto</span>
                </div>
              </button>
              <a href="#" className="block px-6 py-4 hover:bg-white/5 smooth-transition border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Icon name="user" className="w-5 h-5" />
                  <span className="font-medium text-lg">Mi Perfil</span>
                </div>
              </a>
              <a href="#" className="block px-6 py-4 hover:bg-white/5 smooth-transition border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Icon name="settings" className="w-5 h-5" />
                  <span className="font-medium text-lg">Configuración</span>
                </div>
              </a>
              <button
                onClick={handleLogout}
                className="w-full text-left block px-6 py-4 hover:bg-esant-red/10 smooth-transition text-esant-red"
              >
                <div className="flex items-center gap-3">
                  <Icon name="log-out" className="w-5 h-5" />
                  <span className="font-medium text-lg">Cerrar Sesión</span>
                </div>
              </button>
            </nav>
          </div>
        </>
      )}

      {/* Project Selector Modal */}
      <ProjectSelector
        isOpen={projectSelectorOpen}
        onClose={() => setProjectSelectorOpen(false)}
      />
    </header>
  );
};
