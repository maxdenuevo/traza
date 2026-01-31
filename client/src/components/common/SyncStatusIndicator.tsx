import { useState } from 'react';
import { WifiOff, RefreshCw, Cloud, AlertCircle, Check, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useSyncStatus } from '../../hooks/useSyncStatus';
import { cn } from '../../utils/cn';

export const SyncStatusIndicator = () => {
  const {
    isOnline,
    syncState,
    pendingCount,
    hasPendingMutations,
    failedMutations,
    hasFailedMutations,
    lastSyncText,
    isSyncing,
    manualSync,
    clearFailed,
  } = useSyncStatus();

  const [isExpanded, setIsExpanded] = useState(false);

  // Don't show anything if online with nothing pending
  if (isOnline && !hasPendingMutations && !hasFailedMutations && syncState === 'idle') {
    return null;
  }

  // Determine the main status color and icon
  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        bgColor: 'bg-esant-gray-700',
        textColor: 'text-white',
        Icon: WifiOff,
        message: 'Sin conexión',
        subMessage: hasPendingMutations
          ? `${pendingCount.total} cambio${pendingCount.total === 1 ? '' : 's'} pendiente${pendingCount.total === 1 ? '' : 's'}`
          : 'Los cambios se guardarán localmente',
      };
    }

    if (isSyncing) {
      return {
        bgColor: 'bg-esant-gray-600',
        textColor: 'text-white',
        Icon: RefreshCw,
        message: 'Sincronizando...',
        subMessage: `${pendingCount.total} pendiente${pendingCount.total === 1 ? '' : 's'}`,
        iconSpin: true,
      };
    }

    if (hasFailedMutations) {
      return {
        bgColor: 'bg-esant-red',
        textColor: 'text-white',
        Icon: AlertCircle,
        message: 'Error de sincronización',
        subMessage: `${failedMutations.length} cambio${failedMutations.length === 1 ? '' : 's'} fallido${failedMutations.length === 1 ? '' : 's'}`,
      };
    }

    if (hasPendingMutations) {
      return {
        bgColor: 'bg-esant-gray-600',
        textColor: 'text-white',
        Icon: Cloud,
        message: 'Cambios pendientes',
        subMessage: `${pendingCount.total} por sincronizar`,
      };
    }

    return {
      bgColor: 'bg-green-600',
      textColor: 'text-white',
      Icon: Check,
      message: 'Sincronizado',
      subMessage: lastSyncText || 'Todo al día',
    };
  };

  const config = getStatusConfig();
  const { Icon, iconSpin } = config;

  const handleClearFailed = async () => {
    await clearFailed();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Main banner */}
      <div
        className={cn(
          config.bgColor,
          config.textColor,
          'py-2 px-4 shadow-md transition-all duration-300'
        )}
      >
        <div className="flex items-center justify-between max-w-screen-lg mx-auto">
          {/* Left: Status icon and message */}
          <div className="flex items-center gap-2">
            <Icon
              size={18}
              className={cn(iconSpin && 'animate-spin')}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{config.message}</span>
              <span className="text-xs opacity-80">{config.subMessage}</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Manual sync button */}
            {isOnline && hasPendingMutations && !isSyncing && (
              <button
                onClick={manualSync}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                title="Sincronizar ahora"
              >
                <RefreshCw size={16} />
              </button>
            )}

            {/* Expand/collapse button when there's more info */}
            {(hasPendingMutations || hasFailedMutations) && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (hasPendingMutations || hasFailedMutations) && (
        <div className="bg-esant-gray-800 text-white px-4 py-3 shadow-lg">
          <div className="max-w-screen-lg mx-auto space-y-3">
            {/* Pending by entity */}
            {hasPendingMutations && (
              <div>
                <h4 className="text-xs font-medium text-esant-gray-400 uppercase tracking-wider mb-2">
                  Cambios pendientes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {pendingCount.byEntity.asistencia > 0 && (
                    <span className="px-2 py-1 bg-esant-gray-700 rounded text-xs">
                      Asistencia: {pendingCount.byEntity.asistencia}
                    </span>
                  )}
                  {pendingCount.byEntity.checkbox > 0 && (
                    <span className="px-2 py-1 bg-esant-gray-700 rounded text-xs">
                      Verificación: {pendingCount.byEntity.checkbox}
                    </span>
                  )}
                  {pendingCount.byEntity.pendiente > 0 && (
                    <span className="px-2 py-1 bg-esant-gray-700 rounded text-xs">
                      Pendientes: {pendingCount.byEntity.pendiente}
                    </span>
                  )}
                  {pendingCount.byEntity.material > 0 && (
                    <span className="px-2 py-1 bg-esant-gray-700 rounded text-xs">
                      Materiales: {pendingCount.byEntity.material}
                    </span>
                  )}
                  {pendingCount.byEntity.factura > 0 && (
                    <span className="px-2 py-1 bg-esant-gray-700 rounded text-xs">
                      Facturas: {pendingCount.byEntity.factura}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Failed mutations */}
            {hasFailedMutations && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-esant-gray-400 uppercase tracking-wider">
                    Fallidos ({failedMutations.length})
                  </h4>
                  <button
                    onClick={handleClearFailed}
                    className="flex items-center gap-1 text-xs text-esant-red hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={12} />
                    Limpiar
                  </button>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {failedMutations.slice(0, 5).map((mutation) => (
                    <div
                      key={mutation.id}
                      className="flex items-center justify-between px-2 py-1 bg-esant-gray-700/50 rounded text-xs"
                    >
                      <span className="capitalize">{mutation.entity} - {mutation.type}</span>
                      <span className="text-esant-gray-400 truncate ml-2 max-w-[150px]">
                        {mutation.error || 'Error desconocido'}
                      </span>
                    </div>
                  ))}
                  {failedMutations.length > 5 && (
                    <div className="text-xs text-esant-gray-400 text-center py-1">
                      +{failedMutations.length - 5} más
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Last sync info */}
            {lastSyncText && (
              <div className="text-xs text-esant-gray-400">
                Última sincronización: {lastSyncText}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
