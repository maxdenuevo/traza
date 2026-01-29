import { supabase } from './supabase';
import type { Material, MaterialEstado } from '../types';

// Check if we're in mock mode
const isMockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Mock data for development
const mockMateriales: Material[] = [
  {
    id: 'mat-1',
    proyectoId: 'proyecto-1',
    codigo: 'CER-001',
    descripcion: 'Cerámico 60x60 Gris Mate',
    marca: 'Porcelanato',
    modelo: 'Stone Grey',
    sucursal: 'Easy Las Condes',
    cantidad: 45,
    proveedor: 'Easy Chile',
    ubicacion: 'Bodega obra',
    sectorNombre: 'Cocina',
    estado: 'disponible',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mat-2',
    proyectoId: 'proyecto-1',
    codigo: 'GRI-001',
    descripcion: 'Grifería Lavaplatos Monocomando',
    marca: 'Grohe',
    modelo: 'Eurosmart',
    sucursal: 'Sodimac Costanera',
    cantidad: 1,
    proveedor: 'Sodimac',
    ubicacion: 'Por instalar',
    sectorNombre: 'Cocina',
    estado: 'disponible',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mat-3',
    proyectoId: 'proyecto-1',
    codigo: 'PIN-001',
    descripcion: 'Pintura Látex Interior Blanco 20L',
    marca: 'Sherwin Williams',
    modelo: 'SuperPaint',
    sucursal: 'Tienda Directa',
    cantidad: 8,
    proveedor: 'Sherwin Williams',
    ubicacion: 'Bodega obra',
    sectorNombre: 'General',
    estado: 'disponible',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mat-4',
    proyectoId: 'proyecto-1',
    codigo: 'MAD-001',
    descripcion: 'Deck Pino Impregnado 1x4',
    marca: 'Arauco',
    modelo: 'Premium',
    sucursal: 'Sodimac Kennedy',
    cantidad: 0,
    proveedor: 'Sodimac',
    ubicacion: 'Pendiente entrega',
    sectorNombre: 'Terraza',
    estado: 'agotado',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mat-5',
    proyectoId: 'proyecto-1',
    codigo: 'ILU-001',
    descripcion: 'Foco LED Empotrable 7W',
    marca: 'Philips',
    modelo: 'Essential',
    cantidad: 24,
    proveedor: 'Homy',
    ubicacion: 'Por comprar',
    sectorNombre: 'Sala de estar',
    estado: 'por_comprar',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const materialesService = {
  /**
   * Get all materiales for a project
   */
  async getAll(proyectoId: string): Promise<Material[]> {
    if (isMockMode) {
      return mockMateriales.filter(m => m.proyectoId === proyectoId);
    }

    const { data, error } = await supabase
      .from('materiales')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((m) => ({
      id: m.id,
      proyectoId: m.proyecto_id,
      codigo: m.codigo,
      descripcion: m.descripcion,
      marca: m.marca,
      modelo: m.modelo,
      sucursal: m.sucursal,
      cantidad: m.cantidad,
      proveedor: m.proveedor,
      ubicacion: m.ubicacion,
      facturaId: m.factura_id,
      sectorNombre: m.sector_nombre,
      estado: m.estado as MaterialEstado,
      createdAt: new Date(m.created_at),
      updatedAt: new Date(m.updated_at),
    }));
  },

  /**
   * Get materiales grouped by sector
   */
  async getBySector(proyectoId: string): Promise<{ sector: string; materiales: Material[] }[]> {
    const materiales = await this.getAll(proyectoId);

    const sectorMap = new Map<string, Material[]>();
    materiales.forEach(m => {
      const sector = m.sectorNombre || 'Sin sector';
      if (!sectorMap.has(sector)) {
        sectorMap.set(sector, []);
      }
      sectorMap.get(sector)!.push(m);
    });

    return Array.from(sectorMap.entries())
      .map(([sector, materiales]) => ({ sector, materiales }))
      .sort((a, b) => a.sector.localeCompare(b.sector));
  },

  /**
   * Get materiales grouped by proveedor
   */
  async getByProveedor(proyectoId: string): Promise<{ proveedor: string; materiales: Material[] }[]> {
    const materiales = await this.getAll(proyectoId);

    const proveedorMap = new Map<string, Material[]>();
    materiales.forEach(m => {
      const proveedor = m.proveedor || 'Sin proveedor';
      if (!proveedorMap.has(proveedor)) {
        proveedorMap.set(proveedor, []);
      }
      proveedorMap.get(proveedor)!.push(m);
    });

    return Array.from(proveedorMap.entries())
      .map(([proveedor, materiales]) => ({ proveedor, materiales }))
      .sort((a, b) => a.proveedor.localeCompare(b.proveedor));
  },

  /**
   * Get a single material by ID
   */
  async getById(id: string): Promise<Material | null> {
    if (isMockMode) {
      return mockMateriales.find(m => m.id === id) || null;
    }

    const { data, error } = await supabase
      .from('materiales')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      id: data.id,
      proyectoId: data.proyecto_id,
      codigo: data.codigo,
      descripcion: data.descripcion,
      marca: data.marca,
      modelo: data.modelo,
      sucursal: data.sucursal,
      cantidad: data.cantidad,
      proveedor: data.proveedor,
      ubicacion: data.ubicacion,
      facturaId: data.factura_id,
      sectorNombre: data.sector_nombre,
      estado: data.estado as MaterialEstado,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  /**
   * Create a new material
   */
  async create(material: Partial<Material>): Promise<Material> {
    if (isMockMode) {
      const newMaterial: Material = {
        id: `mat-${Date.now()}`,
        proyectoId: material.proyectoId!,
        codigo: material.codigo,
        descripcion: material.descripcion!,
        marca: material.marca,
        modelo: material.modelo,
        sucursal: material.sucursal,
        cantidad: material.cantidad || 0,
        proveedor: material.proveedor,
        ubicacion: material.ubicacion,
        facturaId: material.facturaId,
        sectorNombre: material.sectorNombre,
        estado: material.estado || 'disponible',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockMateriales.unshift(newMaterial);
      return newMaterial;
    }

    const { data, error } = await supabase
      .from('materiales')
      .insert({
        proyecto_id: material.proyectoId,
        codigo: material.codigo,
        descripcion: material.descripcion,
        marca: material.marca,
        modelo: material.modelo,
        sucursal: material.sucursal,
        cantidad: material.cantidad || 0,
        proveedor: material.proveedor,
        ubicacion: material.ubicacion,
        factura_id: material.facturaId,
        sector_nombre: material.sectorNombre,
        estado: material.estado || 'disponible',
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      proyectoId: data.proyecto_id,
      codigo: data.codigo,
      descripcion: data.descripcion,
      marca: data.marca,
      modelo: data.modelo,
      sucursal: data.sucursal,
      cantidad: data.cantidad,
      proveedor: data.proveedor,
      ubicacion: data.ubicacion,
      facturaId: data.factura_id,
      sectorNombre: data.sector_nombre,
      estado: data.estado as MaterialEstado,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  /**
   * Update a material
   */
  async update(id: string, updates: Partial<Material>): Promise<Material> {
    if (isMockMode) {
      const idx = mockMateriales.findIndex(m => m.id === id);
      if (idx >= 0) {
        mockMateriales[idx] = { ...mockMateriales[idx], ...updates, updatedAt: new Date() };
        return mockMateriales[idx];
      }
      throw new Error('Material not found');
    }

    const updateData: Record<string, unknown> = {};
    if (updates.codigo !== undefined) updateData.codigo = updates.codigo;
    if (updates.descripcion !== undefined) updateData.descripcion = updates.descripcion;
    if (updates.marca !== undefined) updateData.marca = updates.marca;
    if (updates.modelo !== undefined) updateData.modelo = updates.modelo;
    if (updates.sucursal !== undefined) updateData.sucursal = updates.sucursal;
    if (updates.cantidad !== undefined) updateData.cantidad = updates.cantidad;
    if (updates.proveedor !== undefined) updateData.proveedor = updates.proveedor;
    if (updates.ubicacion !== undefined) updateData.ubicacion = updates.ubicacion;
    if (updates.facturaId !== undefined) updateData.factura_id = updates.facturaId;
    if (updates.sectorNombre !== undefined) updateData.sector_nombre = updates.sectorNombre;
    if (updates.estado !== undefined) updateData.estado = updates.estado;

    const { data, error } = await supabase
      .from('materiales')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      proyectoId: data.proyecto_id,
      codigo: data.codigo,
      descripcion: data.descripcion,
      marca: data.marca,
      modelo: data.modelo,
      sucursal: data.sucursal,
      cantidad: data.cantidad,
      proveedor: data.proveedor,
      ubicacion: data.ubicacion,
      facturaId: data.factura_id,
      sectorNombre: data.sector_nombre,
      estado: data.estado as MaterialEstado,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  /**
   * Delete a material
   */
  async delete(id: string): Promise<void> {
    if (isMockMode) {
      const idx = mockMateriales.findIndex(m => m.id === id);
      if (idx >= 0) {
        mockMateriales.splice(idx, 1);
      }
      return;
    }

    const { error } = await supabase
      .from('materiales')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get statistics for materiales
   */
  async getStats(proyectoId: string) {
    const materiales = await this.getAll(proyectoId);

    return {
      total: materiales.length,
      disponible: materiales.filter(m => m.estado === 'disponible').length,
      agotado: materiales.filter(m => m.estado === 'agotado').length,
      por_comprar: materiales.filter(m => m.estado === 'por_comprar').length,
      sectores: new Set(materiales.map(m => m.sectorNombre).filter(Boolean)).size,
      proveedores: new Set(materiales.map(m => m.proveedor).filter(Boolean)).size,
    };
  },
};
