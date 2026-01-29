import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions, ROUTE_PERMISSIONS, type Permission } from '../../hooks/usePermissions';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permissions?: Permission[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute = ({
  children,
  permissions,
  fallback,
  redirectTo = '/login',
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, hasAllPermissions } = usePermissions();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give auth store time to rehydrate from localStorage
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Mostrar loading mientras se verifica autenticación
  if (isChecking) {
    return (
      <div className="min-h-screen bg-esant-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Determinar permisos requeridos
  const requiredPermissions = permissions || ROUTE_PERMISSIONS[location.pathname] || [];

  // Si no hay permisos requeridos o tiene todos los permisos, mostrar contenido
  if (requiredPermissions.length === 0 || hasAllPermissions(requiredPermissions)) {
    return <>{children}</>;
  }

  // Si hay un fallback, mostrarlo
  if (fallback) {
    return <>{fallback}</>;
  }

  // Por defecto, mostrar mensaje de acceso denegado
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
      <div className="w-16 h-16 rounded-full bg-esant-gray-100 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-esant-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-esant-gray-800 mb-2">
        Acceso Restringido
      </h2>
      <p className="text-sm text-esant-gray-500 text-center max-w-xs">
        No tienes permisos para acceder a esta sección. Contacta al administrador si crees que es un error.
      </p>
    </div>
  );
};

// Componente para ocultar contenido según permisos
interface PermissionGateProps {
  children: React.ReactNode;
  permissions: Permission[];
  fallback?: React.ReactNode;
  requireAll?: boolean;
}

export const PermissionGate = ({
  children,
  permissions,
  fallback = null,
  requireAll = true,
}: PermissionGateProps) => {
  const { hasAllPermissions, hasAnyPermission } = usePermissions();

  const hasAccess = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
