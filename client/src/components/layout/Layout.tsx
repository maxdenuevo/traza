import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Drawer } from './Drawer';
import { ProjectSelector } from '../ProjectSelector';
import { useUnreadCount } from '../../hooks/useNotificaciones';
import { useProjectStore } from '../../store/useProjectStore';

interface LayoutProps {
  children: ReactNode;
  projectName?: string;
}

export const Layout = ({
  children,
  projectName = 'Mi Proyecto',
}: LayoutProps) => {
  const navigate = useNavigate();
  const { data: unreadCount = 0 } = useUnreadCount();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { projectSelectorOpen, openProjectSelector, closeProjectSelector } = useProjectStore();

  const handleOpenDrawer = () => setDrawerOpen(true);
  const handleCloseDrawer = () => setDrawerOpen(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        projectName={projectName}
        notificationCount={unreadCount}
        onMenuClick={handleOpenDrawer}
        onNotificationClick={() => navigate('/notificaciones')}
      />

      <main className="container mx-auto px-4 py-4 max-w-7xl pb-8">
        {children}
      </main>

      {/* Sidebar Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        onOpenProjectSelector={openProjectSelector}
      />

      {/* Project Selector Modal */}
      <ProjectSelector
        isOpen={projectSelectorOpen}
        onClose={closeProjectSelector}
      />
    </div>
  );
};
