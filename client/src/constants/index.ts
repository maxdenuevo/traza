import type { StatusColor } from '../types';

// ==================== Estado Colors ====================

export const PENDIENTE_ESTADO_COLORS: Record<string, StatusColor> = {
  creada: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    indicator: 'bg-blue-400'
  },
  en_progreso: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    indicator: 'bg-yellow-400'
  },
  pausada: {
    bg: 'bg-esant-gray-100',
    text: 'text-esant-gray-600',
    indicator: 'bg-esant-gray-400'
  },
  completada: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    indicator: 'bg-green-500'
  },
  cancelada: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    indicator: 'bg-red-400'
  }
};

export const PENDIENTE_ESTADO_LABELS: Record<string, string> = {
  creada: 'Creada',
  en_progreso: 'En progreso',
  pausada: 'Pausada',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

export const PERMISO_ESTADO_COLORS: Record<string, StatusColor> = {
  pendiente: {
    bg: 'bg-esant-gray-100',
    text: 'text-esant-gray-600',
    indicator: 'bg-esant-gray-400'
  },
  en_tramite: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    indicator: 'bg-yellow-400'
  },
  aprobado: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    indicator: 'bg-esant-green'
  },
  vencido: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    indicator: 'bg-esant-red'
  }
};

export const PROYECTO_ESTADO_COLORS: Record<string, StatusColor> = {
  planificacion: {
    bg: 'bg-esant-gray-100',
    text: 'text-esant-gray-600',
    indicator: 'bg-esant-gray-400'
  },
  en_obra: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    indicator: 'bg-yellow-400'
  },
  pausado: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    indicator: 'bg-esant-red'
  },
  terminado: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    indicator: 'bg-esant-green'
  }
};

export const NOTIFICACION_TIPO_COLORS: Record<string, StatusColor> = {
  tarea_asignada: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    indicator: 'bg-blue-400'
  },
  tarea_actualizada: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    indicator: 'bg-yellow-400'
  },
  visita_programada: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    indicator: 'bg-purple-400'
  },
  documento_subido: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    indicator: 'bg-esant-green'
  },
  presupuesto_actualizado: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    indicator: 'bg-orange-400'
  },
  mensaje: {
    bg: 'bg-esant-gray-100',
    text: 'text-esant-gray-600',
    indicator: 'bg-esant-gray-400'
  }
};

// ==================== Navigation ====================

export const NAV_ITEMS = [
  { id: 'visitas', label: 'Visitas', icon: 'calendar' },
  { id: 'pendientes', label: 'Tareas', icon: 'clipboard-list' },
  { id: 'documentos', label: 'Docs', icon: 'file-text' },
  { id: 'equipo', label: 'Equipo', icon: 'users' },
  { id: 'presupuesto', label: 'Gastos', icon: 'wallet' },
  { id: 'notificaciones', label: 'Alertas', icon: 'bell' },
];

// ==================== WhatsApp ====================

export const generateWhatsAppLink = (phoneNumber: string, message: string): string => {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

export const generateTaskWhatsAppMessage = (
  userName: string,
  taskName: string
): string => {
  return `Hola ${userName}, te escribo sobre la tarea: ${taskName}`;
};

// ==================== Areas comunes ====================

export const AREAS_COMUNES = [
  'Sala de estar',
  'Cocina',
  'Hall entrada',
  'Terraza',
  'Baño',
  'Dormitorio principal',
  'Dormitorio secundario',
  'Comedor',
  'Jardín',
  'Estacionamiento',
  'Otro'
];

// ==================== Categorías ====================

export const EQUIPO_CATEGORIAS = [
  'Arquitectura',
  'Construcción',
  'Especialistas'
];

export const DOCUMENTO_CATEGORIAS = [
  'planos',
  'permisos',
  'anteproyecto',
  'presupuesto',
  'contratos',
  'fotos',
  'otro'
];

export const PRESUPUESTO_CATEGORIAS = [
  'servicio',
  'mano_de_obra',
  'materiales',
  'adicionales',
  'otro'
];

export const PRESUPUESTO_CATEGORIA_LABELS: Record<string, string> = {
  servicio: 'Servicio',
  mano_de_obra: 'Mano de obra',
  materiales: 'Materiales',
  adicionales: 'Adicionales',
  otro: 'Otro',
  // Keep old labels for backwards compatibility
  diseño: 'Diseño',
  construccion: 'Construcción',
  mobiliario: 'Mobiliario',
};

export const PRESUPUESTO_CATEGORIA_COLORS: Record<string, StatusColor> = {
  servicio: {
    bg: 'bg-esant-gray-100',
    text: 'text-esant-gray-700',
    indicator: 'bg-esant-gray-500'
  },
  mano_de_obra: {
    bg: 'bg-esant-gray-100',
    text: 'text-esant-gray-700',
    indicator: 'bg-esant-gray-600'
  },
  materiales: {
    bg: 'bg-esant-gray-100',
    text: 'text-esant-gray-700',
    indicator: 'bg-esant-gray-400'
  },
  adicionales: {
    bg: 'bg-red-50',
    text: 'text-esant-red',
    indicator: 'bg-esant-red'
  },
  otro: {
    bg: 'bg-esant-gray-50',
    text: 'text-esant-gray-600',
    indicator: 'bg-esant-gray-300'
  },
  // Keep old colors for backwards compatibility
  diseño: {
    bg: 'bg-esant-gray-100',
    text: 'text-esant-gray-700',
    indicator: 'bg-esant-gray-500'
  },
  construccion: {
    bg: 'bg-esant-gray-100',
    text: 'text-esant-gray-700',
    indicator: 'bg-esant-gray-600'
  },
  mobiliario: {
    bg: 'bg-esant-gray-100',
    text: 'text-esant-gray-700',
    indicator: 'bg-esant-gray-400'
  }
};

// ==================== User Roles ====================

export const USER_ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  jefe_proyecto: 'Jefe de Proyecto',
  especialista: 'Especialista',
  trabajador: 'Trabajador',
  subcontratado: 'Subcontratado',
  cliente: 'Cliente',
};

export const USER_ROLE_COLORS: Record<string, StatusColor> = {
  admin: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    indicator: 'bg-purple-400'
  },
  jefe_proyecto: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    indicator: 'bg-blue-400'
  },
  especialista: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    indicator: 'bg-esant-green'
  },
  trabajador: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    indicator: 'bg-yellow-400'
  },
  subcontratado: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    indicator: 'bg-orange-400'
  },
  cliente: {
    bg: 'bg-esant-gray-100',
    text: 'text-esant-gray-600',
    indicator: 'bg-esant-gray-400'
  }
};

// ==================== Document Categories ====================

export const DOCUMENTO_CATEGORIA_LABELS: Record<string, string> = {
  planos: 'Planos',
  permisos: 'Permisos',
  anteproyecto: 'Anteproyecto',
  presupuesto: 'Presupuesto',
  contratos: 'Contratos',
  fotos: 'Fotos',
  otro: 'Otro',
};

export const DOCUMENTO_CATEGORIA_COLORS: Record<string, StatusColor> = {
  planos: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    indicator: 'bg-blue-400'
  },
  permisos: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    indicator: 'bg-purple-400'
  },
  anteproyecto: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    indicator: 'bg-orange-400'
  },
  presupuesto: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    indicator: 'bg-esant-green'
  },
  contratos: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    indicator: 'bg-esant-red'
  },
  fotos: {
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    indicator: 'bg-pink-400'
  },
  otro: {
    bg: 'bg-esant-gray-100',
    text: 'text-esant-gray-600',
    indicator: 'bg-esant-gray-400'
  }
};

// ==================== Helpers ====================

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
