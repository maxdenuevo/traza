import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentosService } from '../services/documentos';
import type { DocumentoCategoria, DocumentoEstado } from '../types';

/**
 * Get all documents for a project
 */
export const useDocumentos = (proyectoId: string) => {
  return useQuery({
    queryKey: ['documentos', proyectoId],
    queryFn: () => documentosService.getAll(proyectoId),
    enabled: !!proyectoId,
  });
};

/**
 * Get documents grouped by category
 */
export const useDocumentosByCategory = (proyectoId: string) => {
  return useQuery({
    queryKey: ['documentos', 'by-category', proyectoId],
    queryFn: () => documentosService.getByCategory(proyectoId),
    enabled: !!proyectoId,
  });
};

/**
 * Get document statistics
 */
export const useDocumentosStats = (proyectoId: string) => {
  return useQuery({
    queryKey: ['documentos', 'stats', proyectoId],
    queryFn: () => documentosService.getStats(proyectoId),
    enabled: !!proyectoId,
  });
};

/**
 * Get a single document by ID
 */
export const useDocumento = (id: string) => {
  return useQuery({
    queryKey: ['documentos', id],
    queryFn: () => documentosService.getById(id),
    enabled: !!id,
  });
};

/**
 * Upload and create a document
 */
export const useUploadDocumento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      proyectoId,
      categoria,
      userId,
    }: {
      file: File;
      proyectoId: string;
      categoria: DocumentoCategoria;
      userId: string;
    }) => {
      // First upload the file
      const url = await documentosService.uploadFile(file, proyectoId, categoria);

      // Then create the document record
      return await documentosService.create(
        {
          proyectoId,
          nombre: file.name,
          url,
          categoria,
          tamaño: file.size,
        },
        userId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
    },
  });
};

/**
 * Update a document
 */
export const useUpdateDocumento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: {
        nombre?: string;
        categoria?: DocumentoCategoria;
        estado?: DocumentoEstado;
        fechaAprobacion?: Date;
      };
    }) => documentosService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
    },
  });
};

/**
 * Delete a document
 */
export const useDeleteDocumento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
    },
  });
};
