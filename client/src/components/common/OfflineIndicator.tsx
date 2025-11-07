import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-esant-red text-white py-2 px-4 flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-300">
      <WifiOff size={18} />
      <span className="text-sm font-medium">
        Modo sin conexión - Los cambios se sincronizarán cuando vuelvas a conectarte
      </span>
    </div>
  );
};
