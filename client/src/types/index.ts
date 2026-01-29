// ==================== User & Authentication ====================

export type UserRole = 'admin' | 'jefe_proyecto' | 'especialista' | 'trabajador' | 'subcontratado' | 'cliente';

export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: UserRole;
  telefono: string;
  especialidad?: string;
  avatar?: string;
  proyectos: Proyecto[];
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Proyecto ====================

export type ProyectoEstado = 'planificacion' | 'en_obra' | 'pausado' | 'terminado';

export interface Proyecto {
  id: string;
  nombre: string;
  cliente: string;
  estado: ProyectoEstado;
  fechaInicio: Date;
  fechaEstimadaFin?: Date;
  direccion?: string;
  descripcion?: string;
  presupuestoTotal?: number;
  usuarios: User[];
  visitas: Visita[];
  pendientes: Pendiente[];
  documentos: Documento[];
  presupuestoItems: PresupuestoItem[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Proyecto list item - lightweight version for list views
 * Contains only basic info and team members, not full relationships
 */
export interface ProyectoListItem {
  id: string;
  nombre: string;
  cliente: string;
  estado: ProyectoEstado;
  fechaInicio: Date;
  fechaEstimadaFin?: Date;
  direccion?: string;
  descripcion?: string;
  presupuestoTotal?: number;
  usuarios: User[];
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Visita ====================

export type VisitaEstado = 'programada' | 'en_curso' | 'completada';

export interface Visita {
  id: string;
  proyectoId: string;
  fecha: Date;
  hora?: string;
  estado: VisitaEstado;
  notasGenerales?: string;
  asuntos: Asunto[];
  creadoPor: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Asunto {
  id: string;
  visitaId: string;
  area: string;
  descripcion: string;
  encargadoId?: string;
  notasAdicionales?: string;
  convertidoAPendiente: boolean;
  pendienteId?: string;
  createdAt: Date;
}

// ==================== Pendiente (Tarea) ====================

export type PendienteEstado = 'creada' | 'en_progreso' | 'pausada' | 'completada' | 'cancelada';
export type PendientePrioridad = 'baja' | 'media' | 'alta';

export interface PendientePauseLog {
  id: string;
  pendienteId: string;
  pausedAt: Date;
  resumedAt?: Date;
  motivo?: string;
  pausedBy: string;
  pausedByName?: string;
}

export interface Pendiente {
  id: string;
  proyectoId: string;
  area: string;
  tarea: string;
  descripcion?: string;
  encargadoId: string;
  encargado?: {
    id: string;
    nombre: string;
    especialidad?: string;
    telefono?: string;
  };
  estado: PendienteEstado;
  prioridad?: PendientePrioridad;
  fechaCreacion: Date;
  fechaVencimiento?: Date;
  fechaCompletado?: Date;
  notasAdicionales?: string;
  attachments?: string[];
  pauseLogs?: PendientePauseLog[];
  creadoPor: string;
  visitaId?: string;
  asuntoId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Documento ====================

export type DocumentoTipo = 'pdf' | 'docx' | 'xlsx' | 'dwg' | 'jpg' | 'png' | 'otro';
export type DocumentoCategoria = 'planos' | 'permisos' | 'anteproyecto' | 'presupuesto' | 'contratos' | 'fotos' | 'otro';
export type DocumentoEstado = 'borrador' | 'revision' | 'aprobado' | 'vigente' | 'vencido';

export interface Documento {
  id: string;
  proyectoId: string;
  nombre: string;
  tipo: DocumentoTipo;
  categoria: DocumentoCategoria;
  url: string;
  tamaño: number;
  estado?: DocumentoEstado;
  fechaAprobacion?: Date;
  subioPor: string;
  autor?: {
    id: string;
    nombre: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Notificacion ====================

export type NotificacionTipo =
  | 'tarea_asignada'
  | 'tarea_actualizada'
  | 'visita_programada'
  | 'documento_subido'
  | 'presupuesto_actualizado'
  | 'mensaje';

export interface Notificacion {
  id: string;
  usuarioId: string;
  tipo: NotificacionTipo;
  titulo: string;
  mensaje: string;
  leida: boolean;
  metadata?: Record<string, any>;
  enlaceAccion?: string;
  createdAt: Date;
}

// ==================== Presupuesto ====================

export type PresupuestoCategoria = 'diseño' | 'construccion' | 'materiales' | 'mobiliario' | 'otro';

export interface PresupuestoItem {
  id: string;
  proyectoId: string;
  categoria: PresupuestoCategoria;
  descripcion: string;
  montoEstimado: number;
  montoReal?: number;
  porcentajeEjecutado: number;
  archivoUrl?: string;
  notificaCambios: boolean;
  ultimaActualizacion?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Permiso ====================

export type PermisoTipo = 'edificacion' | 'municipal' | 'recepcion_obra' | 'otro';
export type PermisoEstado = 'pendiente' | 'en_tramite' | 'aprobado' | 'vencido';

export interface Permiso {
  id: string;
  proyectoId: string;
  nombre: string;
  tipo: PermisoTipo;
  estado: PermisoEstado;
  fechaSolicitud?: Date;
  fechaAprobacion?: Date;
  fechaVencimiento?: Date;
  vigenciaMeses?: number;
  documentoId?: string;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Helpers & Utilities ====================

export interface SelectOption {
  value: string;
  label: string;
}

export interface StatusColor {
  bg: string;
  text: string;
  indicator: string;
}

// ==================== Programa (ex Cronograma) ====================

export type SectorStatus = 'pendiente' | 'en_curso' | 'pausado' | 'entregado' | 'cancelado';

export interface ProgramaSector {
  id: string;
  proyectoId: string;
  sectorNombre: string;
  fechaInicio?: Date;
  fechaEntregaPropuesta?: Date;
  fechaEntregaReal?: Date;
  obras?: string;
  valorEstimado?: number;
  valorActual?: number;
  status: SectorStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Material ====================

export type MaterialEstado = 'disponible' | 'agotado' | 'por_comprar';

export interface Material {
  id: string;
  proyectoId: string;
  codigo?: string;
  descripcion: string;
  marca?: string;
  modelo?: string;
  sucursal?: string;
  cantidad: number;
  proveedor?: string;
  ubicacion?: string;
  facturaId?: string;
  sectorNombre?: string;
  estado: MaterialEstado;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Factura ====================

export interface Factura {
  id: string;
  proyectoId: string;
  numero: string;
  fecha: Date;
  valor: number;
  valorConIva: number;
  proveedor: string;
  pagadoPor?: string;
  detalle?: string;
  sucursal?: string;
  rut?: string;
  direccion?: string;
  archivoUrl?: string;
  sectorNombre?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Checkbox ====================

export type Periodicidad = 'diario' | 'semanal' | 'quincenal' | 'mensual';

export interface CheckboxItem {
  id: string;
  proyectoId: string;
  sectorNombre?: string;
  descripcion: string;
  periodicidad: Periodicidad;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckboxCheck {
  id: string;
  itemId: string;
  fecha: Date;
  completado: boolean;
  checkedBy: string;
  createdAt: Date;
}

// ==================== Asistencia ====================

export interface Asistencia {
  id: string;
  proyectoId: string;
  trabajadorId: string;
  fecha: Date;
  presente: boolean;
  registradoPor: string;
  createdAt: Date;
}

// ==================== Informe ====================

export interface InformeContenido {
  resumen: string;
  pendientesCompletados: number;
  pendientesTotales: number;
  asistenciaPromedio: number;
  sectoresEstado: { sectorNombre: string; status: SectorStatus }[];
  observaciones: string;
}

export interface Informe {
  id: string;
  proyectoId: string;
  numero: number;
  fecha: Date;
  periodicidad: Periodicidad;
  contenido: InformeContenido;
  archivoUrl?: string;
  generadoPor: string;
  createdAt: Date;
}
