import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { queryClient } from './services/queryClient';
import { useAuthStore } from './store/useAuthStore';
import { useProjectStore } from './store/useProjectStore';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Lazy load pages for code splitting
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const VisitasPage = lazy(() => import('./pages/Visitas').then(m => ({ default: m.VisitasPage })));
const PendientesPage = lazy(() => import('./pages/Pendientes').then(m => ({ default: m.PendientesPage })));
const EquipoPage = lazy(() => import('./pages/Equipo').then(m => ({ default: m.EquipoPage })));
const DocumentosPage = lazy(() => import('./pages/Documentos').then(m => ({ default: m.DocumentosPage })));
const PresupuestoPage = lazy(() => import('./pages/Presupuesto').then(m => ({ default: m.PresupuestoPage })));
const NotificacionesPage = lazy(() => import('./pages/Notificaciones').then(m => ({ default: m.NotificacionesPage })));

function AppContent() {
  const { user, isLoading, initialize } = useAuthStore();
  const { currentProject } = useProjectStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-esant-gray-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-esant-gray-100">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" replace /> : <Signup />}
        />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout
                projectName={currentProject?.nombre || 'Sin proyecto seleccionado'}
              >
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <Routes>
                    <Route path="/" element={<Navigate to="/visitas" replace />} />
                    <Route path="/visitas" element={<VisitasPage />} />
                    <Route path="/pendientes" element={<PendientesPage />} />
                    <Route path="/documentos" element={<DocumentosPage />} />
                    <Route path="/equipo" element={<EquipoPage />} />
                    <Route path="/presupuesto" element={<PresupuestoPage />} />
                    <Route path="/notificaciones" element={<NotificacionesPage />} />
                  </Routes>
                </Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <OfflineIndicator />
          <AppContent />
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
