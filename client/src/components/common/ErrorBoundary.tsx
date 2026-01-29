import { Component, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  isChunkError: boolean;
}

// Detect if error is a chunk loading failure (happens after deployments)
function isChunkLoadError(error: Error): boolean {
  const message = error.message || '';
  return (
    message.includes('Loading chunk') ||
    message.includes('dynamically imported module') ||
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('error loading dynamically imported module')
  );
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isChunkError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const isChunkError = isChunkLoadError(error);
    return { hasError: true, error, isChunkError };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);

    // If it's a chunk loading error, try to auto-reload once
    if (isChunkLoadError(error)) {
      const hasReloaded = sessionStorage.getItem('chunk-error-reload');
      if (!hasReloaded) {
        sessionStorage.setItem('chunk-error-reload', 'true');
        // Clear service worker cache and reload
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            registrations.forEach((registration) => {
              registration.unregister();
            });
          });
          // Clear caches
          if ('caches' in window) {
            caches.keys().then((names) => {
              names.forEach((name) => {
                caches.delete(name);
              });
            });
          }
        }
        // Force reload from server
        window.location.reload();
      }
    }
  }

  handleReset = () => {
    // Clear the reload flag
    sessionStorage.removeItem('chunk-error-reload');
    this.setState({ hasError: false, error: undefined, isChunkError: false });

    // Clear caches and reload
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-esant-gray-100 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-esant-red/10 rounded-full flex items-center justify-center">
                <AlertCircle className="text-esant-red" size={32} />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-esant-dark mb-3">
              {this.state.isChunkError ? 'Nueva versión disponible' : 'Algo salió mal'}
            </h2>

            <p className="text-esant-gray-600 mb-6">
              {this.state.isChunkError
                ? 'Hay una actualización de la aplicación. Presiona el botón para cargar la nueva versión.'
                : 'Ha ocurrido un error inesperado. Por favor, intenta recargar la aplicación.'
              }
            </p>

            {this.state.error && !this.state.isChunkError && (
              <details className="mb-6 text-left">
                <summary className="text-sm text-esant-gray-500 cursor-pointer mb-2">
                  Detalles técnicos
                </summary>
                <pre className="text-xs bg-esant-gray-100 p-3 rounded overflow-auto max-h-40">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReset}
              className="w-full bg-esant-dark text-white py-3 px-6 rounded-lg font-medium hover:bg-esant-dark/90 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              {this.state.isChunkError ? 'Actualizar ahora' : 'Recargar aplicación'}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
