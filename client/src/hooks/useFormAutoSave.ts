import { useState, useEffect, useCallback, useRef } from 'react';
import { get, set, del } from 'idb-keyval';

interface AutoSaveOptions<T> {
  // Unique key for this form (e.g., 'pendiente-form', 'factura-create')
  formKey: string;
  // Interval in ms to auto-save (default: 5000ms)
  saveInterval?: number;
  // Initial values (merged with saved data if available)
  initialValues: T;
  // Called when saved data is restored
  onRestore?: (data: T) => void;
  // Whether auto-save is enabled
  enabled?: boolean;
}

interface AutoSaveState<T> {
  // Current form data
  data: T;
  // Whether there's saved data available
  hasSavedData: boolean;
  // Last saved timestamp
  lastSavedAt: number | null;
  // Whether currently saving
  isSaving: boolean;
}

interface AutoSaveReturn<T> extends AutoSaveState<T> {
  // Update form data
  setData: (data: T | ((prev: T) => T)) => void;
  // Manually trigger save
  save: () => Promise<void>;
  // Clear saved data
  clear: () => Promise<void>;
  // Restore saved data
  restore: () => Promise<void>;
  // Discard saved data and reset to initial
  discard: () => Promise<void>;
}

const STORAGE_PREFIX = 'esant-maria-form-autosave-';

interface SavedFormData<T> {
  data: T;
  savedAt: number;
  version: number;
}

const CURRENT_VERSION = 1;

/**
 * Hook for auto-saving form data to IndexedDB
 * Useful for long forms that might be interrupted by offline/app close
 */
export function useFormAutoSave<T extends Record<string, unknown>>({
  formKey,
  saveInterval = 5000,
  initialValues,
  onRestore,
  enabled = true,
}: AutoSaveOptions<T>): AutoSaveReturn<T> {
  const storageKey = `${STORAGE_PREFIX}${formKey}`;

  const [data, setDataState] = useState<T>(initialValues);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const dataRef = useRef(data);
  const lastSavedDataRef = useRef<string | null>(null);

  // Keep ref in sync
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Load saved data on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const saved = await get<SavedFormData<T>>(storageKey);
        if (saved && saved.version === CURRENT_VERSION) {
          setHasSavedData(true);
          setLastSavedAt(saved.savedAt);

          // Auto-restore if form is empty
          const isFormEmpty = Object.values(initialValues).every(
            v => v === '' || v === null || v === undefined || (Array.isArray(v) && v.length === 0)
          );

          if (isFormEmpty && saved.data) {
            setDataState(saved.data);
            onRestore?.(saved.data);
          }
        }
      } catch (error) {
        console.warn('Failed to load auto-saved form data:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    if (enabled) {
      loadSavedData();
    } else {
      setIsInitialized(true);
    }
  }, [storageKey, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save function
  const save = useCallback(async () => {
    if (!enabled || !isInitialized) return;

    const currentData = dataRef.current;
    const currentDataStr = JSON.stringify(currentData);

    // Skip if data hasn't changed
    if (currentDataStr === lastSavedDataRef.current) return;

    setIsSaving(true);
    try {
      const saveData: SavedFormData<T> = {
        data: currentData,
        savedAt: Date.now(),
        version: CURRENT_VERSION,
      };
      await set(storageKey, saveData);
      setLastSavedAt(saveData.savedAt);
      setHasSavedData(true);
      lastSavedDataRef.current = currentDataStr;
    } catch (error) {
      console.warn('Failed to auto-save form data:', error);
    } finally {
      setIsSaving(false);
    }
  }, [storageKey, enabled, isInitialized]);

  // Auto-save interval
  useEffect(() => {
    if (!enabled || !isInitialized) return;

    const intervalId = setInterval(save, saveInterval);

    return () => clearInterval(intervalId);
  }, [save, saveInterval, enabled, isInitialized]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (enabled && isInitialized) {
        // Sync save on unmount
        const currentData = dataRef.current;
        const currentDataStr = JSON.stringify(currentData);
        if (currentDataStr !== lastSavedDataRef.current) {
          const saveData: SavedFormData<T> = {
            data: currentData,
            savedAt: Date.now(),
            version: CURRENT_VERSION,
          };
          set(storageKey, saveData).catch(() => {});
        }
      }
    };
  }, [storageKey, enabled, isInitialized]);

  // Set data function
  const setData = useCallback((update: T | ((prev: T) => T)) => {
    setDataState((prev) => {
      const newData = typeof update === 'function' ? update(prev) : update;
      return newData;
    });
  }, []);

  // Clear saved data
  const clear = useCallback(async () => {
    try {
      await del(storageKey);
      setHasSavedData(false);
      setLastSavedAt(null);
      lastSavedDataRef.current = null;
    } catch (error) {
      console.warn('Failed to clear auto-saved form data:', error);
    }
  }, [storageKey]);

  // Restore saved data
  const restore = useCallback(async () => {
    try {
      const saved = await get<SavedFormData<T>>(storageKey);
      if (saved && saved.version === CURRENT_VERSION && saved.data) {
        setDataState(saved.data);
        onRestore?.(saved.data);
      }
    } catch (error) {
      console.warn('Failed to restore auto-saved form data:', error);
    }
  }, [storageKey, onRestore]);

  // Discard saved data and reset
  const discard = useCallback(async () => {
    await clear();
    setDataState(initialValues);
  }, [clear, initialValues]);

  return {
    data,
    setData,
    hasSavedData,
    lastSavedAt,
    isSaving,
    save,
    clear,
    restore,
    discard,
  };
}

/**
 * Helper to format last saved time
 */
export function formatLastSaved(timestamp: number | null): string | null {
  if (!timestamp) return null;

  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) {
    return 'Guardado hace un momento';
  } else if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `Guardado hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  } else {
    return `Guardado a las ${new Date(timestamp).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }
}
