import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/auth';
import { isMockMode } from '../services/supabase';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export default function Login() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState(isMockMode ? 'demo@esantmaria.cl' : '');
  const [password, setPassword] = useState(isMockMode ? 'demo123' : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user } = await authService.signIn(email, password);
      setUser(user);
      toast.success(`Bienvenido, ${user.nombre}`);
      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Mock Mode Banner */}
        {isMockMode && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
            <p className="text-sm text-yellow-800 text-center">
              <strong>Modo Demo</strong> - Sin conexión a Supabase
              <br />
              <span className="text-xs">Usa cualquier credencial para entrar</span>
            </p>
          </div>
        )}

        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">ESANT MARIA</h1>
          <p className="text-gray-600 text-base">Libro de Obra Digital</p>
        </div>

        {/* Login Card */}
        <Card className="p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Iniciar Sesión</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full px-0 py-3 bg-transparent border-0 border-b-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors text-base"
                placeholder="tu@email.com"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full px-0 py-3 bg-transparent border-0 border-b-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors text-base"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              fullWidth
              size="lg"
              className="mt-8"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link to="/signup" className="text-gray-900 font-medium hover:underline">
                Regístrate
              </Link>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-8">
          ESANT MARIA - Gestión de Construcción
        </p>
      </div>
    </div>
  );
}
