import { supabase, isMockMode } from './supabase';

const BUCKET_PENDIENTES = 'pendiente-attachments';

// Mock storage for development
const mockStorage: Record<string, string> = {};
let mockIdCounter = 1;

export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
}

export const storageService = {
  /**
   * Upload a file to Supabase Storage
   */
  async uploadPendienteAttachment(
    proyectoId: string,
    pendienteId: string,
    file: File
  ): Promise<UploadResult> {
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const path = `${proyectoId}/${pendienteId}/${fileName}`;

    if (isMockMode) {
      // Create a mock URL using object URL for preview
      const objectUrl = URL.createObjectURL(file);
      const mockPath = `mock-${mockIdCounter++}`;
      mockStorage[mockPath] = objectUrl;

      return {
        url: objectUrl,
        path: mockPath,
        fileName: file.name,
      };
    }

    const { data, error } = await supabase.storage
      .from(BUCKET_PENDIENTES)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Error uploading file: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_PENDIENTES)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
      fileName: file.name,
    };
  },

  /**
   * Upload multiple files
   */
  async uploadMultiple(
    proyectoId: string,
    pendienteId: string,
    files: File[]
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (const file of files) {
      const result = await this.uploadPendienteAttachment(
        proyectoId,
        pendienteId,
        file
      );
      results.push(result);
    }

    return results;
  },

  /**
   * Delete a file from storage
   */
  async deletePendienteAttachment(path: string): Promise<void> {
    if (isMockMode) {
      if (mockStorage[path]) {
        URL.revokeObjectURL(mockStorage[path]);
        delete mockStorage[path];
      }
      return;
    }

    const { error } = await supabase.storage
      .from(BUCKET_PENDIENTES)
      .remove([path]);

    if (error) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  },

  /**
   * Get file type from URL or filename
   */
  getFileType(urlOrName: string): 'image' | 'pdf' | 'document' | 'other' {
    const ext = urlOrName.split('.').pop()?.toLowerCase() || '';

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'].includes(ext)) {
      return 'image';
    }
    if (ext === 'pdf') {
      return 'pdf';
    }
    if (['doc', 'docx', 'xls', 'xlsx', 'txt'].includes(ext)) {
      return 'document';
    }
    return 'other';
  },

  /**
   * Get file name from URL
   */
  getFileName(url: string): string {
    // Handle mock URLs
    if (url.startsWith('blob:')) {
      return 'archivo';
    }

    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    // Remove timestamp prefix if present
    const match = fileName.match(/^\d+-(.+)$/);
    return match ? match[1] : fileName;
  },

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/heic',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];

    if (file.size > MAX_SIZE) {
      return { valid: false, error: 'El archivo excede el tamaño máximo de 10MB' };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: 'Tipo de archivo no permitido' };
    }

    return { valid: true };
  },
};
