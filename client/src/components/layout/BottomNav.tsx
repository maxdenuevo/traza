import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../constants';
import { Icon } from '../common/Icon';
import { useUnreadCount } from '../../hooks/useNotificaciones';

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.split('/')[1] || 'visitas';
  const { data: unreadCount = 0 } = useUnreadCount();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-esant-white border-t border-esant-gray-200 z-50 shadow-esant">
      <div
        className="flex justify-around items-center h-16"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.25rem)' }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = currentPath === item.id;
          const showBadge = item.id === 'notificaciones' && unreadCount > 0;

          return (
            <button
              key={item.id}
              onClick={() => navigate(`/${item.id}`)}
              className={`
                btn-touch flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg
                smooth-transition flex-1 active-scale relative
                ${isActive ? 'text-esant-black' : 'text-esant-gray-600 hover:text-esant-gray-800'}
              `}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon name={item.icon} size={22} strokeWidth={isActive ? 2.5 : 2} />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 bg-esant-red text-esant-white text-xs font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-esant-black rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
