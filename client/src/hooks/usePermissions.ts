import { useAuthStore } from '../store/useAuthStore';
import type { UserRole } from '../types';

// Definición de permisos disponibles
export type Permission =
  | 'ver_todo'
  | 'libro_obra'
  | 'calendario'
  | 'checkbox'
  | 'asistencia'
  | 'pendientes_ver'
  | 'pendientes_crear'
  | 'pendientes_editar'
  | 'programa_ver'
  | 'programa_editar'
  | 'equipo_ver'
  | 'equipo_gestionar'
  | 'materiales'
  | 'presupuesto'
  | 'facturas'
  | 'documentos'
  | 'informes_ver'
  | 'informes_generar';

// Matriz de permisos por rol
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'ver_todo',
    'libro_obra',
    'calendario',
    'checkbox',
    'asistencia',
    'pendientes_ver',
    'pendientes_crear',
    'pendientes_editar',
    'programa_ver',
    'programa_editar',
    'equipo_ver',
    'equipo_gestionar',
    'materiales',
    'presupuesto',
    'facturas',
    'documentos',
    'informes_ver',
    'informes_generar',
  ],
  jefe_proyecto: [
    'ver_todo',
    'libro_obra',
    'calendario',
    'checkbox',
    'asistencia',
    'pendientes_ver',
    'pendientes_crear',
    'pendientes_editar',
    'programa_ver',
    'equipo_ver',
    'equipo_gestionar',
    'materiales',
    'presupuesto',
    'facturas',
    'documentos',
    'informes_ver',
  ],
  especialista: [
    'ver_todo',
    'libro_obra',
    'calendario',
    'checkbox',
    'asistencia',
    'pendientes_ver',
    'pendientes_crear',
    'pendientes_editar',
    'programa_ver',
    'equipo_ver',
    'materiales',
    'presupuesto',
    'facturas',
    'documentos',
  ],
  trabajador: [
    'libro_obra',
    'calendario',
    'checkbox',
    'pendientes_ver',
    'equipo_ver',
  ],
  subcontratado: [
    'pendientes_ver',
    'equipo_ver',
  ],
  cliente: [
    'informes_ver',
  ],
};

export interface PermissionsResult {
  // Estado del usuario
  isAuthenticated: boolean;
  userRole: UserRole | null;

  // Verificación de permisos
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;

  // Verificación de roles
  isAdmin: boolean;
  isJefeProyecto: boolean;
  isEspecialista: boolean;
  isTrabajador: boolean;
  isSubcontratado: boolean;
  isCliente: boolean;

  // Helpers de módulos
  canViewLibroObra: boolean;
  canManageCheckbox: boolean;
  canManageAsistencia: boolean;
  canViewPendientes: boolean;
  canCreatePendientes: boolean;
  canEditPendientes: boolean;
  canViewPrograma: boolean;
  canEditPrograma: boolean;
  canViewEquipo: boolean;
  canManageEquipo: boolean;
  canViewMateriales: boolean;
  canViewPresupuesto: boolean;
  canViewFacturas: boolean;
  canViewDocumentos: boolean;
  canViewInformes: boolean;
  canGenerateInformes: boolean;
}

export const usePermissions = (): PermissionsResult => {
  const { user, isAuthenticated } = useAuthStore();

  const userRole = user?.rol as UserRole | null;

  // Función para verificar un permiso específico
  const hasPermission = (permission: Permission): boolean => {
    if (!userRole) return false;
    const permissions = ROLE_PERMISSIONS[userRole] || [];
    return permissions.includes(permission) || permissions.includes('ver_todo');
  };

  // Verificar si tiene alguno de los permisos
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };

  // Verificar si tiene todos los permisos
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };

  // Verificación de roles específicos
  const isAdmin = userRole === 'admin';
  const isJefeProyecto = userRole === 'jefe_proyecto';
  const isEspecialista = userRole === 'especialista';
  const isTrabajador = userRole === 'trabajador';
  const isSubcontratado = userRole === 'subcontratado';
  const isCliente = userRole === 'cliente';

  return {
    // Estado
    isAuthenticated,
    userRole,

    // Verificación de permisos
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // Verificación de roles
    isAdmin,
    isJefeProyecto,
    isEspecialista,
    isTrabajador,
    isSubcontratado,
    isCliente,

    // Helpers de módulos
    canViewLibroObra: hasPermission('libro_obra'),
    canManageCheckbox: hasPermission('checkbox'),
    canManageAsistencia: hasPermission('asistencia'),
    canViewPendientes: hasPermission('pendientes_ver'),
    canCreatePendientes: hasPermission('pendientes_crear'),
    canEditPendientes: hasPermission('pendientes_editar'),
    canViewPrograma: hasPermission('programa_ver'),
    canEditPrograma: hasPermission('programa_editar'),
    canViewEquipo: hasPermission('equipo_ver'),
    canManageEquipo: hasPermission('equipo_gestionar'),
    canViewMateriales: hasPermission('materiales'),
    canViewPresupuesto: hasPermission('presupuesto'),
    canViewFacturas: hasPermission('facturas'),
    canViewDocumentos: hasPermission('documentos'),
    canViewInformes: hasPermission('informes_ver'),
    canGenerateInformes: hasPermission('informes_generar'),
  };
};

// Hook para verificar acceso a una ruta
export const useRouteAccess = (requiredPermissions: Permission[]): boolean => {
  const { hasAllPermissions, isAuthenticated } = usePermissions();

  if (!isAuthenticated) return false;
  if (requiredPermissions.length === 0) return true;

  return hasAllPermissions(requiredPermissions);
};

// Mapa de permisos requeridos por ruta
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/': ['libro_obra'],
  '/visitas': ['libro_obra'],
  '/pendientes': ['pendientes_ver'],
  '/programa': ['programa_ver'],
  '/equipo': ['equipo_ver'],
  '/materiales': ['materiales'],
  '/presupuesto': ['presupuesto'],
  '/facturas': ['facturas'],
  '/documentos': ['documentos'],
  '/informes': ['informes_ver'],
  '/seguimiento': ['programa_ver'],
};
