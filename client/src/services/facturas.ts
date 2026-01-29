import { supabase } from './supabase';
import type { Factura } from '../types';

// Check if we're in mock mode
const isMockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Mock data for development
const mockFacturas: Factura[] = [
  {
    id: 'fact-1',
    proyectoId: 'proyecto-1',
    numero: '001-2024',
    fecha: new Date('2024-01-15'),
    valor: 850000,
    valorConIva: 1011500,
    proveedor: 'Sodimac',
    pagadoPor: 'Empresa',
    detalle: 'Materiales de construcción: cemento, arena, gravilla',
    sucursal: 'Sodimac Costanera Center',
    rut: '96.792.430-K',
    direccion: 'Av. Andrés Bello 2447, Providencia',
    sectorNombre: 'General',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'fact-2',
    proyectoId: 'proyecto-1',
    numero: '002-2024',
    fecha: new Date('2024-01-20'),
    valor: 1250000,
    valorConIva: 1487500,
    proveedor: 'Sodimac',
    pagadoPor: 'Cliente',
    detalle: 'Cerámicos baño principal y cocina',
    sucursal: 'Sodimac Kennedy',
    rut: '96.792.430-K',
    direccion: 'Av. Kennedy 9001, Las Condes',
    sectorNombre: 'Baño principal',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'fact-3',
    proyectoId: 'proyecto-1',
    numero: '003-2024',
    fecha: new Date('2024-02-01'),
    valor: 420000,
    valorConIva: 499800,
    proveedor: 'Easy',
    pagadoPor: 'Empresa',
    detalle: 'Grifería y sanitarios',
    sucursal: 'Easy Las Condes',
    rut: '96.671.750-5',
    direccion: 'Av. Las Condes 13451',
    sectorNombre: 'Baño principal',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'fact-4',
    proyectoId: 'proyecto-1',
    numero: '004-2024',
    fecha: new Date('2024-02-10'),
    valor: 680000,
    valorConIva: 809200,
    proveedor: 'Sherwin Williams',
    pagadoPor: 'Empresa',
    detalle: 'Pintura interior y exterior, brochas, rodillos',
    sucursal: 'Tienda Directa Providencia',
    rut: '96.885.860-9',
    direccion: 'Av. Providencia 2124',
    sectorNombre: 'General',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: 'fact-5',
    proyectoId: 'proyecto-1',
    numero: '005-2024',
    fecha: new Date('2024-02-15'),
    valor: 2100000,
    valorConIva: 2499000,
    proveedor: 'Mueblería Silva',
    pagadoPor: 'Cliente',
    detalle: 'Muebles de cocina a medida',
    sucursal: 'Taller central',
    rut: '76.123.456-7',
    direccion: 'San Diego 1234, Santiago',
    sectorNombre: 'Cocina',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
  },
];

export const facturasService = {
  /**
   * Get all facturas for a project
   */
  async getAll(proyectoId: string): Promise<Factura[]> {
    if (isMockMode) {
      return mockFacturas.filter(f => f.proyectoId === proyectoId);
    }

    const { data, error } = await supabase
      .from('facturas')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .order('fecha', { ascending: false });

    if (error) throw error;

    return data.map((f) => ({
      id: f.id,
      proyectoId: f.proyecto_id,
      numero: f.numero,
      fecha: new Date(f.fecha),
      valor: f.valor,
      valorConIva: f.valor_con_iva,
      proveedor: f.proveedor,
      pagadoPor: f.pagado_por,
      detalle: f.detalle,
      sucursal: f.sucursal,
      rut: f.rut,
      direccion: f.direccion,
      archivoUrl: f.archivo_url,
      sectorNombre: f.sector_nombre,
      createdAt: new Date(f.created_at),
      updatedAt: new Date(f.updated_at),
    }));
  },

  /**
   * Get facturas grouped by proveedor
   */
  async getByProveedor(proyectoId: string): Promise<{ proveedor: string; facturas: Factura[]; total: number; totalConIva: number }[]> {
    const facturas = await this.getAll(proyectoId);

    const proveedorMap = new Map<string, Factura[]>();
    facturas.forEach(f => {
      const proveedor = f.proveedor || 'Sin proveedor';
      if (!proveedorMap.has(proveedor)) {
        proveedorMap.set(proveedor, []);
      }
      proveedorMap.get(proveedor)!.push(f);
    });

    return Array.from(proveedorMap.entries())
      .map(([proveedor, facturas]) => ({
        proveedor,
        facturas,
        total: facturas.reduce((sum, f) => sum + f.valor, 0),
        totalConIva: facturas.reduce((sum, f) => sum + f.valorConIva, 0),
      }))
      .sort((a, b) => b.totalConIva - a.totalConIva); // Sort by highest total
  },

  /**
   * Get a single factura by ID
   */
  async getById(id: string): Promise<Factura | null> {
    if (isMockMode) {
      return mockFacturas.find(f => f.id === id) || null;
    }

    const { data, error } = await supabase
      .from('facturas')
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
      numero: data.numero,
      fecha: new Date(data.fecha),
      valor: data.valor,
      valorConIva: data.valor_con_iva,
      proveedor: data.proveedor,
      pagadoPor: data.pagado_por,
      detalle: data.detalle,
      sucursal: data.sucursal,
      rut: data.rut,
      direccion: data.direccion,
      archivoUrl: data.archivo_url,
      sectorNombre: data.sector_nombre,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  /**
   * Create a new factura
   */
  async create(factura: Partial<Factura>): Promise<Factura> {
    if (isMockMode) {
      const newFactura: Factura = {
        id: `fact-${Date.now()}`,
        proyectoId: factura.proyectoId!,
        numero: factura.numero!,
        fecha: factura.fecha!,
        valor: factura.valor!,
        valorConIva: factura.valorConIva!,
        proveedor: factura.proveedor!,
        pagadoPor: factura.pagadoPor,
        detalle: factura.detalle,
        sucursal: factura.sucursal,
        rut: factura.rut,
        direccion: factura.direccion,
        archivoUrl: factura.archivoUrl,
        sectorNombre: factura.sectorNombre,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockFacturas.unshift(newFactura);
      return newFactura;
    }

    const { data, error } = await supabase
      .from('facturas')
      .insert({
        proyecto_id: factura.proyectoId,
        numero: factura.numero,
        fecha: factura.fecha,
        valor: factura.valor,
        valor_con_iva: factura.valorConIva,
        proveedor: factura.proveedor,
        pagado_por: factura.pagadoPor,
        detalle: factura.detalle,
        sucursal: factura.sucursal,
        rut: factura.rut,
        direccion: factura.direccion,
        archivo_url: factura.archivoUrl,
        sector_nombre: factura.sectorNombre,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      proyectoId: data.proyecto_id,
      numero: data.numero,
      fecha: new Date(data.fecha),
      valor: data.valor,
      valorConIva: data.valor_con_iva,
      proveedor: data.proveedor,
      pagadoPor: data.pagado_por,
      detalle: data.detalle,
      sucursal: data.sucursal,
      rut: data.rut,
      direccion: data.direccion,
      archivoUrl: data.archivo_url,
      sectorNombre: data.sector_nombre,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  /**
   * Update a factura
   */
  async update(id: string, updates: Partial<Factura>): Promise<Factura> {
    if (isMockMode) {
      const idx = mockFacturas.findIndex(f => f.id === id);
      if (idx >= 0) {
        mockFacturas[idx] = { ...mockFacturas[idx], ...updates, updatedAt: new Date() };
        return mockFacturas[idx];
      }
      throw new Error('Factura not found');
    }

    const updateData: Record<string, unknown> = {};
    if (updates.numero !== undefined) updateData.numero = updates.numero;
    if (updates.fecha !== undefined) updateData.fecha = updates.fecha;
    if (updates.valor !== undefined) updateData.valor = updates.valor;
    if (updates.valorConIva !== undefined) updateData.valor_con_iva = updates.valorConIva;
    if (updates.proveedor !== undefined) updateData.proveedor = updates.proveedor;
    if (updates.pagadoPor !== undefined) updateData.pagado_por = updates.pagadoPor;
    if (updates.detalle !== undefined) updateData.detalle = updates.detalle;
    if (updates.sucursal !== undefined) updateData.sucursal = updates.sucursal;
    if (updates.rut !== undefined) updateData.rut = updates.rut;
    if (updates.direccion !== undefined) updateData.direccion = updates.direccion;
    if (updates.archivoUrl !== undefined) updateData.archivo_url = updates.archivoUrl;
    if (updates.sectorNombre !== undefined) updateData.sector_nombre = updates.sectorNombre;

    const { data, error } = await supabase
      .from('facturas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      proyectoId: data.proyecto_id,
      numero: data.numero,
      fecha: new Date(data.fecha),
      valor: data.valor,
      valorConIva: data.valor_con_iva,
      proveedor: data.proveedor,
      pagadoPor: data.pagado_por,
      detalle: data.detalle,
      sucursal: data.sucursal,
      rut: data.rut,
      direccion: data.direccion,
      archivoUrl: data.archivo_url,
      sectorNombre: data.sector_nombre,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  /**
   * Delete a factura
   */
  async delete(id: string): Promise<void> {
    if (isMockMode) {
      const idx = mockFacturas.findIndex(f => f.id === id);
      if (idx >= 0) {
        mockFacturas.splice(idx, 1);
      }
      return;
    }

    const { error } = await supabase
      .from('facturas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get statistics for facturas
   */
  async getStats(proyectoId: string) {
    const facturas = await this.getAll(proyectoId);

    const proveedores = new Set(facturas.map(f => f.proveedor));

    return {
      total: facturas.length,
      totalValor: facturas.reduce((sum, f) => sum + f.valor, 0),
      totalConIva: facturas.reduce((sum, f) => sum + f.valorConIva, 0),
      proveedores: proveedores.size,
      pagadoPorEmpresa: facturas.filter(f => f.pagadoPor === 'Empresa').reduce((sum, f) => sum + f.valorConIva, 0),
      pagadoPorCliente: facturas.filter(f => f.pagadoPor === 'Cliente').reduce((sum, f) => sum + f.valorConIva, 0),
    };
  },
};
