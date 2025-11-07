import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { useUnreadCount } from '../../hooks/useNotificaciones';

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

  return (
    <div className="min-h-screen bg-esant-gray-100">
      <Header
        projectName={projectName}
        notificationCount={unreadCount}
        onNotificationClick={() => navigate('/notificaciones')}
      />
      <main className="container mx-auto px-4 py-4 max-w-7xl pb-20 mb-safe">
        {children}
      </main>
      <BottomNav />

      {/* Footer con nombre ESANT MARIA */}
      <footer className="fixed bottom-16 left-0 right-0 text-center pb-2 pointer-events-none">
        <p className="text-esant-gray-400 text-sm font-medium">ESANT MARIA</p>
      </footer>
    </div>
  );
};
