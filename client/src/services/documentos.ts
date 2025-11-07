import { supabase } from './supabase';
import type { Documento, DocumentoCategoria, DocumentoEstado } from '../types';

export const documentosService = {
  /**
   * Get all documents for a project
   */
  async getAll(proyectoId: string): Promise<Documento[]> {
    const { data, error } = await supabase
      .from('documentos')
      .select(`
        *,
        autor:profiles!documentos_subio_por_fkey(id, nombre)
      `)
      .eq('proyecto_id', proyectoId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((d) => ({
      id: d.id,
      proyectoId: d.proyecto_id,
      nombre: d.nombre,
      tipo: d.tipo,
      categoria: d.categoria,
      url: d.url,
      tamaño: d.tamaño,
      estado: d.estado,
      fechaAprobacion: d.fecha_aprobacion ? new Date(d.fecha_aprobacion) : undefined,
      subioPor: d.subio_por,
      autor: d.autor ? {
        id: d.autor.id,
        nombre: d.autor.nombre,
      } : undefined,
      createdAt: new Date(d.created_at),
      updatedAt: new Date(d.updated_at),
    }));
  },

  /**
   * Get documents grouped by category
   */
  async getByCategory(proyectoId: string) {
    const documentos = await this.getAll(proyectoId);

    const grouped = documentos.reduce((acc, documento) => {
      const categoria = documento.categoria || 'otro';
      if (!acc[categoria]) {
        acc[categoria] = [];
      }
      acc[categoria].push(documento);
      return acc;
    }, {} as Record<string, Documento[]>);

    return Object.entries(grouped).map(([categoria, docs]) => ({
      categoria,
      documentos: docs,
    }));
  },

  /**
   * Get a single document by ID
   */
  async getById(id: string): Promise<Documento> {
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      proyectoId: data.proyecto_id,
      nombre: data.nombre,
      tipo: data.tipo,
      categoria: data.categoria,
      url: data.url,
      tamaño: data.tamaño,
      estado: data.estado,
      fechaAprobacion: data.fecha_aprobacion ? new Date(data.fecha_aprobacion) : undefined,
      subioPor: data.subio_por,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  /**
   * Upload a document file to Supabase Storage
   */
  async uploadFile(file: File, proyectoId: string, categoria: DocumentoCategoria): Promise<string> {
    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${proyectoId}/${categoria}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('documentos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from('documentos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  /**
   * Create a document record after upload
   */
  async create(
    documento: {
      proyectoId: string;
      nombre: string;
      url: string;
      categoria: DocumentoCategoria;
      tamaño: number;
      estado?: DocumentoEstado;
    },
    userId: string
  ) {
    // Detect file type from URL
    const fileExt = documento.url.split('.').pop()?.toLowerCase() || 'otro';
    let tipo: Documento['tipo'] = 'otro';
    if (fileExt === 'pdf') tipo = 'pdf';
    else if (fileExt === 'docx' || fileExt === 'doc') tipo = 'docx';
    else if (fileExt === 'xlsx' || fileExt === 'xls') tipo = 'xlsx';
    else if (fileExt === 'dwg') tipo = 'dwg';
    else if (fileExt === 'jpg' || fileExt === 'jpeg') tipo = 'jpg';
    else if (fileExt === 'png') tipo = 'png';

    const { data, error } = await supabase
      .from('documentos')
      .insert({
        proyecto_id: documento.proyectoId,
        nombre: documento.nombre,
        tipo,
        categoria: documento.categoria,
        url: documento.url,
        tamaño: documento.tamaño,
        estado: documento.estado || 'vigente',
        subio_por: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a document
   */
  async update(
    id: string,
    updates: {
      nombre?: string;
      categoria?: DocumentoCategoria;
      estado?: DocumentoEstado;
      fechaAprobacion?: Date;
    }
  ) {
    const { data, error } = await supabase
      .from('documentos')
      .update({
        nombre: updates.nombre,
        categoria: updates.categoria,
        estado: updates.estado,
        fecha_aprobacion: updates.fechaAprobacion,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a document (and its file from storage)
   */
  async delete(id: string) {
    // First get the document to get its URL
    const documento = await this.getById(id);

    // Extract file path from URL
    const urlParts = documento.url.split('/');
    const bucketIndex = urlParts.indexOf('documentos');
    if (bucketIndex !== -1) {
      const filePath = urlParts.slice(bucketIndex + 1).join('/');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documentos')
        .remove([filePath]);

      if (storageError) console.error('Error deleting file from storage:', storageError);
    }

    // Delete record from database
    const { error } = await supabase
      .from('documentos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get document statistics for a project
   */
  async getStats(proyectoId: string) {
    const documentos = await this.getAll(proyectoId);

    return {
      total: documentos.length,
      planos: documentos.filter(d => d.categoria === 'planos').length,
      permisos: documentos.filter(d => d.categoria === 'permisos').length,
      fotos: documentos.filter(d => d.categoria === 'fotos').length,
      vigentes: documentos.filter(d => d.estado === 'vigente').length,
      enRevision: documentos.filter(d => d.estado === 'revision').length,
    };
  },

  /**
   * Download a document
   */
  downloadDocument(url: string, nombre: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = nombre;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
