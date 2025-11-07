import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LoadingSpinner } from './common/LoadingSpinner';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give auth store time to rehydrate from localStorage
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login, but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
