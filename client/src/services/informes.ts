import { supabase } from './supabase';
import type { Informe, InformeContenido, Periodicidad, SectorStatus } from '../types';

const isMockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Mock data
const mockInformes: Informe[] = [
  {
    id: 'informe-1',
    proyectoId: 'project-1',
    numero: 1,
    fecha: new Date('2026-01-06'),
    periodicidad: 'semanal',
    contenido: {
      resumen: 'Semana de buen avance en sector Cocina y Baño principal. Se completaron instalaciones eléctricas.',
      pendientesCompletados: 12,
      pendientesTotales: 18,
      asistenciaPromedio: 92,
      sectoresEstado: [
        { sectorNombre: 'Cocina', status: 'en_curso' },
        { sectorNombre: 'Baño principal', status: 'en_curso' },
        { sectorNombre: 'Living', status: 'pendiente' },
      ],
      observaciones: 'Se requiere coordinar llegada de materiales para próxima semana.',
    },
    generadoPor: 'user-1',
    createdAt: new Date('2026-01-06'),
  },
  {
    id: 'informe-2',
    proyectoId: 'project-1',
    numero: 2,
    fecha: new Date('2026-01-13'),
    periodicidad: 'semanal',
    contenido: {
      resumen: 'Avance según cronograma. Sector Cocina al 80% de completitud.',
      pendientesCompletados: 8,
      pendientesTotales: 15,
      asistenciaPromedio: 88,
      sectoresEstado: [
        { sectorNombre: 'Cocina', status: 'en_curso' },
        { sectorNombre: 'Baño principal', status: 'entregado' },
        { sectorNombre: 'Living', status: 'en_curso' },
      ],
      observaciones: 'Cliente aprobó cambio de porcelanato en cocina.',
    },
    generadoPor: 'user-1',
    createdAt: new Date('2026-01-13'),
  },
  {
    id: 'informe-3',
    proyectoId: 'project-1',
    numero: 3,
    fecha: new Date('2026-01-20'),
    periodicidad: 'semanal',
    contenido: {
      resumen: 'Semana con retrasos por lluvia. Se reprogramaron trabajos exteriores.',
      pendientesCompletados: 5,
      pendientesTotales: 14,
      asistenciaPromedio: 75,
      sectoresEstado: [
        { sectorNombre: 'Cocina', status: 'entregado' },
        { sectorNombre: 'Living', status: 'en_curso' },
        { sectorNombre: 'Terraza', status: 'pausado' },
      ],
      observaciones: 'Terraza pausada por condiciones climáticas. Se retomará la próxima semana.',
    },
    generadoPor: 'user-1',
    createdAt: new Date('2026-01-20'),
  },
];

let nextNumero = 4;

export const informesService = {
  /**
   * Get all reports for a project
   */
  async getAll(proyectoId: string): Promise<Informe[]> {
    if (isMockMode) {
      return mockInformes
        .filter(i => i.proyectoId === proyectoId)
        .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    }

    const { data, error } = await supabase
      .from('informes')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .order('fecha', { ascending: false });

    if (error) throw error;

    return data.map((i) => ({
      id: i.id,
      proyectoId: i.proyecto_id,
      numero: i.numero,
      fecha: new Date(i.fecha),
      periodicidad: i.periodicidad as Periodicidad,
      contenido: i.contenido as InformeContenido,
      archivoUrl: i.archivo_url,
      generadoPor: i.generado_por,
      createdAt: new Date(i.created_at),
    }));
  },

  /**
   * Get a single report by ID
   */
  async getById(id: string): Promise<Informe | null> {
    if (isMockMode) {
      return mockInformes.find(i => i.id === id) || null;
    }

    const { data, error } = await supabase
      .from('informes')
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
      periodicidad: data.periodicidad as Periodicidad,
      contenido: data.contenido as InformeContenido,
      archivoUrl: data.archivo_url,
      generadoPor: data.generado_por,
      createdAt: new Date(data.created_at),
    };
  },

  /**
   * Generate a new report
   */
  async generate(data: {
    proyectoId: string;
    periodicidad: Periodicidad;
    contenido: InformeContenido;
    userId: string;
  }): Promise<Informe> {
    if (isMockMode) {
      const newInforme: Informe = {
        id: 'informe-' + Date.now(),
        proyectoId: data.proyectoId,
        numero: nextNumero++,
        fecha: new Date(),
        periodicidad: data.periodicidad,
        contenido: data.contenido,
        generadoPor: data.userId,
        createdAt: new Date(),
      };
      mockInformes.unshift(newInforme);
      return newInforme;
    }

    // Get next numero
    const { data: lastInforme } = await supabase
      .from('informes')
      .select('numero')
      .eq('proyecto_id', data.proyectoId)
      .order('numero', { ascending: false })
      .limit(1)
      .single();

    const numero = (lastInforme?.numero || 0) + 1;

    const { data: newData, error } = await supabase
      .from('informes')
      .insert({
        proyecto_id: data.proyectoId,
        numero,
        fecha: new Date().toISOString().split('T')[0],
        periodicidad: data.periodicidad,
        contenido: data.contenido,
        generado_por: data.userId,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: newData.id,
      proyectoId: newData.proyecto_id,
      numero: newData.numero,
      fecha: new Date(newData.fecha),
      periodicidad: newData.periodicidad as Periodicidad,
      contenido: newData.contenido as InformeContenido,
      archivoUrl: newData.archivo_url,
      generadoPor: newData.generado_por,
      createdAt: new Date(newData.created_at),
    };
  },

  /**
   * Delete a report
   */
  async delete(id: string): Promise<void> {
    if (isMockMode) {
      const idx = mockInformes.findIndex(i => i.id === id);
      if (idx >= 0) mockInformes.splice(idx, 1);
      return;
    }

    const { error } = await supabase
      .from('informes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get report stats for dashboard
   */
  async getStats(proyectoId: string): Promise<{
    total: number;
    ultimoInforme?: Informe;
    porPeriodicidad: Record<Periodicidad, number>;
  }> {
    const all = await this.getAll(proyectoId);
    
    const porPeriodicidad: Record<Periodicidad, number> = {
      diario: 0,
      semanal: 0,
      quincenal: 0,
      mensual: 0,
    };

    all.forEach(i => {
      porPeriodicidad[i.periodicidad]++;
    });

    return {
      total: all.length,
      ultimoInforme: all[0],
      porPeriodicidad,
    };
  },

  /**
   * Export report as PDF (generates blob URL for mock)
   */
  async exportPDF(informe: Informe): Promise<string> {
    // In a real implementation, this would call an API to generate PDF
    // For now, we create a simple HTML representation
    const html = generateReportHTML(informe);
    
    if (isMockMode) {
      // Create a blob with HTML content
      const blob = new Blob([html], { type: 'text/html' });
      return URL.createObjectURL(blob);
    }

    // In production, call API to generate PDF
    const { data, error } = await supabase.functions.invoke('generate-pdf', {
      body: { informeId: informe.id },
    });

    if (error) throw error;
    return data.url;
  },
};

// Helper to generate HTML for report
function generateReportHTML(informe: Informe): string {
  const statusLabels: Record<SectorStatus, string> = {
    pendiente: 'Pendiente',
    en_curso: 'En Curso',
    pausado: 'Pausado',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  };

  const statusColors: Record<SectorStatus, string> = {
    pendiente: '#6B7280',
    en_curso: '#2563EB',
    pausado: '#F59E0B',
    entregado: '#10B981',
    cancelado: '#EF4444',
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Informe #${informe.numero}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1F2937; }
    h1 { color: #DC2626; margin-bottom: 8px; }
    .subtitle { color: #6B7280; margin-bottom: 32px; }
    .section { margin-bottom: 24px; }
    .section-title { font-weight: 600; margin-bottom: 8px; border-bottom: 2px solid #E5E7EB; padding-bottom: 4px; }
    .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: #F9FAFB; padding: 16px; border-radius: 8px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: 700; color: #111827; }
    .stat-label { font-size: 12px; color: #6B7280; margin-top: 4px; }
    .sector-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E7EB; }
    .sector-status { padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
    .resumen { background: #F9FAFB; padding: 16px; border-radius: 8px; line-height: 1.6; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #E5E7EB; font-size: 12px; color: #9CA3AF; }
  </style>
</head>
<body>
  <h1>Informe #${informe.numero}</h1>
  <p class="subtitle">${informe.periodicidad.charAt(0).toUpperCase() + informe.periodicidad.slice(1)} - ${informe.fecha.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
  
  <div class="stat-grid">
    <div class="stat-card">
      <div class="stat-value">${informe.contenido.pendientesCompletados}/${informe.contenido.pendientesTotales}</div>
      <div class="stat-label">Pendientes Completados</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${informe.contenido.asistenciaPromedio}%</div>
      <div class="stat-label">Asistencia Promedio</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${informe.contenido.sectoresEstado.length}</div>
      <div class="stat-label">Sectores Activos</div>
    </div>
  </div>

  <div class="section">
    <h3 class="section-title">Resumen</h3>
    <div class="resumen">${informe.contenido.resumen}</div>
  </div>

  <div class="section">
    <h3 class="section-title">Estado de Sectores</h3>
    ${informe.contenido.sectoresEstado.map(s => `
      <div class="sector-item">
        <span>${s.sectorNombre}</span>
        <span class="sector-status" style="background: ${statusColors[s.status]}20; color: ${statusColors[s.status]}">${statusLabels[s.status]}</span>
      </div>
    `).join('')}
  </div>

  ${informe.contenido.observaciones ? `
  <div class="section">
    <h3 class="section-title">Observaciones</h3>
    <p>${informe.contenido.observaciones}</p>
  </div>
  ` : ''}

  <div class="footer">
    <p>Generado el ${informe.createdAt.toLocaleDateString('es-CL')} | ESANT MARIA - Libro de Obra Digital</p>
  </div>
</body>
</html>
  `;
}
