import { get, set, del } from 'idb-keyval';

// Types
export interface QueuedFile {
  id: string;
  file: {
    name: string;
    type: string;
    size: number;
    base64: string; // Store as base64 for IndexedDB
  };
  entityType: 'pendiente' | 'factura' | 'documento';
  entityId: string;
  proyectoId: string;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'uploading' | 'failed';
  error?: string;
}

const QUEUE_KEY = 'esant-maria-file-upload-queue';
const MAX_QUEUE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB max total queue size
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB max per file
const MAX_RETRIES = 3;

// Helper to convert File to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Helper to convert base64 back to Blob
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeType });
}

// Generate unique ID
function generateId(): string {
  return `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Get queue
export async function getFileQueue(): Promise<QueuedFile[]> {
  const queue = await get<QueuedFile[]>(QUEUE_KEY);
  return queue || [];
}

// Save queue
async function saveFileQueue(queue: QueuedFile[]): Promise<void> {
  await set(QUEUE_KEY, queue);
}

// Get current queue size in bytes
export async function getQueueSizeBytes(): Promise<number> {
  const queue = await getFileQueue();
  return queue.reduce((total, item) => total + item.file.size, 0);
}

// Check if queue can accept a new file
export async function canAddFile(fileSize: number): Promise<{ allowed: boolean; reason?: string }> {
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return { allowed: false, reason: `El archivo excede el tamaño máximo de ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB` };
  }

  const currentSize = await getQueueSizeBytes();
  if (currentSize + fileSize > MAX_QUEUE_SIZE_BYTES) {
    return { allowed: false, reason: 'La cola de archivos está llena. Espera a tener conexión para subir más archivos.' };
  }

  return { allowed: true };
}

// Add file to queue
export async function addFileToQueue(
  file: File,
  entityType: QueuedFile['entityType'],
  entityId: string,
  proyectoId: string
): Promise<QueuedFile | null> {
  // Check size limits
  const canAdd = await canAddFile(file.size);
  if (!canAdd.allowed) {
    throw new Error(canAdd.reason);
  }

  const queue = await getFileQueue();

  // Convert file to base64 for storage
  const base64 = await fileToBase64(file);

  const queuedFile: QueuedFile = {
    id: generateId(),
    file: {
      name: file.name,
      type: file.type,
      size: file.size,
      base64,
    },
    entityType,
    entityId,
    proyectoId,
    timestamp: Date.now(),
    retryCount: 0,
    status: 'pending',
  };

  queue.push(queuedFile);
  await saveFileQueue(queue);

  return queuedFile;
}

// Update a queued file
export async function updateQueuedFile(
  id: string,
  updates: Partial<QueuedFile>
): Promise<QueuedFile | null> {
  const queue = await getFileQueue();
  const index = queue.findIndex(f => f.id === id);

  if (index === -1) return null;

  queue[index] = { ...queue[index], ...updates };
  await saveFileQueue(queue);
  return queue[index];
}

// Remove file from queue
export async function removeFileFromQueue(id: string): Promise<boolean> {
  const queue = await getFileQueue();
  const newQueue = queue.filter(f => f.id !== id);

  if (newQueue.length === queue.length) return false;

  await saveFileQueue(newQueue);
  return true;
}

// Get pending files
export async function getPendingFiles(): Promise<QueuedFile[]> {
  const queue = await getFileQueue();
  return queue.filter(
    f => f.status === 'pending' || (f.status === 'failed' && f.retryCount < MAX_RETRIES)
  );
}

// Get failed files
export async function getFailedFiles(): Promise<QueuedFile[]> {
  const queue = await getFileQueue();
  return queue.filter(f => f.status === 'failed' && f.retryCount >= MAX_RETRIES);
}

// Clear failed files
export async function clearFailedFiles(): Promise<number> {
  const queue = await getFileQueue();
  const failed = queue.filter(f => f.status === 'failed' && f.retryCount >= MAX_RETRIES);
  const newQueue = queue.filter(f => !(f.status === 'failed' && f.retryCount >= MAX_RETRIES));

  await saveFileQueue(newQueue);
  return failed.length;
}

// Clear entire file queue
export async function clearFileQueue(): Promise<void> {
  await del(QUEUE_KEY);
}

// Process file upload (called by sync manager)
export async function processFileUpload(
  queuedFile: QueuedFile,
  uploadFn: (file: File, entityType: string, entityId: string, proyectoId: string) => Promise<string>
): Promise<string | null> {
  try {
    // Mark as uploading
    await updateQueuedFile(queuedFile.id, { status: 'uploading' });

    // Convert back to File
    const blob = base64ToBlob(queuedFile.file.base64, queuedFile.file.type);
    const file = new File([blob], queuedFile.file.name, { type: queuedFile.file.type });

    // Upload
    const url = await uploadFn(file, queuedFile.entityType, queuedFile.entityId, queuedFile.proyectoId);

    // Success - remove from queue
    await removeFileFromQueue(queuedFile.id);

    return url;
  } catch (error) {
    // Mark as failed
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    await updateQueuedFile(queuedFile.id, {
      status: 'failed',
      retryCount: queuedFile.retryCount + 1,
      error: errorMessage,
    });

    return null;
  }
}

// Get counts for UI
export async function getFileQueueStats(): Promise<{
  pending: number;
  failed: number;
  totalSizeBytes: number;
  totalSizeMB: string;
}> {
  const queue = await getFileQueue();
  const pending = queue.filter(
    f => f.status === 'pending' || (f.status === 'failed' && f.retryCount < MAX_RETRIES)
  );
  const failed = queue.filter(f => f.status === 'failed' && f.retryCount >= MAX_RETRIES);
  const totalSizeBytes = queue.reduce((total, f) => total + f.file.size, 0);

  return {
    pending: pending.length,
    failed: failed.length,
    totalSizeBytes,
    totalSizeMB: (totalSizeBytes / (1024 * 1024)).toFixed(2),
  };
}
