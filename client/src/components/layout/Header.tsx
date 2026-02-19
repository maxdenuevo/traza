import { Icon } from '../common/Icon';

interface HeaderProps {
  projectName: string;
  notificationCount?: number;
  onMenuClick: () => void;
  onNotificationClick?: () => void;
  onTitleClick?: () => void;
}

export const Header = ({
  projectName,
  notificationCount = 0,
  onMenuClick,
  onNotificationClick,
  onTitleClick
}: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Hamburger Menu - 44px touch target */}
        <button
          onClick={onMenuClick}
          className="w-11 h-11 flex items-center justify-center -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Abrir menú"
        >
          <Icon name="menu" size={24} className="text-gray-900" />
        </button>

        {/* Project Name - Centered, tappable to go home */}
        <button
          onClick={onTitleClick}
          className="text-lg font-bold text-gray-900 uppercase tracking-wide absolute left-1/2 transform -translate-x-1/2 max-w-[180px] truncate cursor-pointer"
          aria-label="Ir al inicio"
        >
          {projectName}
        </button>

        {/* Notification Bell - 44px touch target */}
        <button
          onClick={onNotificationClick}
          className="relative w-11 h-11 flex items-center justify-center -mr-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Notificaciones"
        >
          <Icon name="bell" size={24} className="text-gray-900" />
          {notificationCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[20px] h-[20px] px-1 flex items-center justify-center bg-[#DC2626] text-white text-xs font-bold rounded-full">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
