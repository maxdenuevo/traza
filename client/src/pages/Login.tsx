import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/auth';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export default function Login() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen bg-esant-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header - Minimalista ESANT MARIA */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-esant-black mb-1">ESANT MARIA</h1>
          <p className="text-esant-gray-600 text-base">Gestión de Proyectos Arquitectónicos</p>
        </div>

        {/* Login Card */}
        <Card className="p-8">
          <h2 className="text-xl font-semibold text-esant-black mb-6">Iniciar Sesión</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-esant-red rounded-lg">
              <p className="text-sm text-esant-red">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email - Diseño minimalista sin iconos decorativos */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-esant-gray-600 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full px-0 py-3 bg-transparent border-0 border-b-2 border-esant-gray-200 text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors text-base"
                placeholder="tu@email.com"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-esant-gray-600 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full px-0 py-3 bg-transparent border-0 border-b-2 border-esant-gray-200 text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors text-base"
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
          <div className="mt-6 text-center space-y-3">
            <Link
              to="/forgot-password"
              className="text-sm text-esant-gray-600 hover:text-esant-black transition-colors inline-block"
            >
              ¿Olvidaste tu contraseña?
            </Link>

            <div className="text-sm text-esant-gray-600">
              ¿No tienes cuenta?{' '}
              <Link to="/signup" className="text-esant-black font-medium hover:underline">
                Regístrate
              </Link>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-esant-gray-400 text-sm mt-8">
          ESANT MARIA
        </p>
      </div>
    </div>
  );
}
