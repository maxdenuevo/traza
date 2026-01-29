import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { storageService } from '../services/storage';
import { pendientesService } from '../services/pendientes';
import { toast } from 'sonner';

interface UseAttachmentsOptions {
  proyectoId: string;
  pendienteId: string;
  currentAttachments: string[];
}

export const useAttachments = ({
  proyectoId,
  pendienteId,
  currentAttachments,
}: UseAttachmentsOptions) => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Mutation to update pendiente with new attachments
  const updateAttachmentsMutation = useMutation({
    mutationFn: async (attachments: string[]) => {
      return pendientesService.update(pendienteId, { attachments });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendientes'] });
    },
  });

  // Upload files
  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      if (fileArray.length === 0) return;

      // Validate all files first
      for (const file of fileArray) {
        const validation = storageService.validateFile(file);
        if (!validation.valid) {
          toast.error(validation.error || 'Archivo inválido');
          return;
        }
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        const newUrls: string[] = [];

        for (let i = 0; i < fileArray.length; i++) {
          const file = fileArray[i];
          const result = await storageService.uploadPendienteAttachment(
            proyectoId,
            pendienteId,
            file
          );
          newUrls.push(result.url);
          setUploadProgress(Math.round(((i + 1) / fileArray.length) * 100));
        }

        // Update pendiente with new attachments
        const updatedAttachments = [...currentAttachments, ...newUrls];
        await updateAttachmentsMutation.mutateAsync(updatedAttachments);

        toast.success(
          fileArray.length === 1
            ? 'Archivo subido correctamente'
            : `${fileArray.length} archivos subidos correctamente`
        );

        return newUrls;
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Error al subir archivos');
        throw error;
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [proyectoId, pendienteId, currentAttachments, updateAttachmentsMutation]
  );

  // Remove attachment
  const removeAttachment = useCallback(
    async (urlToRemove: string) => {
      try {
        // Remove from storage (only if it's a storage path, not blob URL)
        if (!urlToRemove.startsWith('blob:')) {
          // Extract path from URL - this depends on your URL structure
          const pathMatch = urlToRemove.match(/pendiente-attachments\/(.+)$/);
          if (pathMatch) {
            await storageService.deletePendienteAttachment(pathMatch[1]);
          }
        }

        // Update pendiente
        const updatedAttachments = currentAttachments.filter(
          (url) => url !== urlToRemove
        );
        await updateAttachmentsMutation.mutateAsync(updatedAttachments);

        toast.success('Archivo eliminado');
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Error al eliminar archivo');
        throw error;
      }
    },
    [currentAttachments, updateAttachmentsMutation]
  );

  return {
    uploadFiles,
    removeAttachment,
    isUploading,
    uploadProgress,
    isUpdating: updateAttachmentsMutation.isPending,
  };
};
