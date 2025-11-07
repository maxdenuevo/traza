import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/auth';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import type { UserRole } from '../types';

export default function Signup() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    telefono: '',
    rol: 'especialista' as UserRole,
    especialidad: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      const errorMessage = 'Las contraseñas no coinciden';
      toast.error(errorMessage);
      setError(errorMessage);
      return;
    }

    if (formData.password.length < 6) {
      const errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      toast.error(errorMessage);
      setError(errorMessage);
      return;
    }

    setLoading(true);

    try {
      const { user } = await authService.signUp({
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        telefono: formData.telefono,
        rol: formData.rol,
        especialidad: formData.especialidad || undefined,
      });

      setUser(user);
      toast.success(`¡Bienvenido a ESANT MARIA, ${user.nombre}!`);
      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la cuenta';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-esant-gray-100 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo/Header - Minimalista ESANT MARIA */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-esant-black mb-1">ESANT MARIA</h1>
          <p className="text-esant-gray-600 text-base">Crea tu cuenta</p>
        </div>

        {/* Signup Card */}
        <Card className="p-8">
          <h2 className="text-xl font-semibold text-esant-black mb-6">Registro</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-esant-red rounded-lg">
              <p className="text-sm text-esant-red">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid de 2 columnas - Diseño minimalista */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-esant-gray-600 mb-2">
                  Nombre completo
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="block w-full px-0 py-3 bg-transparent border-0 border-b-2 border-esant-gray-200 text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors text-base"
                  placeholder="Juan Pérez"
                  disabled={loading}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-esant-gray-600 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="block w-full px-0 py-3 bg-transparent border-0 border-b-2 border-esant-gray-200 text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors text-base"
                  placeholder="tu@email.com"
                  disabled={loading}
                />
              </div>

              {/* Teléfono */}
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-esant-gray-600 mb-2">
                  Teléfono
                </label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                  className="block w-full px-0 py-3 bg-transparent border-0 border-b-2 border-esant-gray-200 text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors text-base"
                  placeholder="+56 9 1234 5678"
                  disabled={loading}
                />
              </div>

              {/* Rol */}
              <div>
                <label htmlFor="rol" className="block text-sm font-medium text-esant-gray-600 mb-2">
                  Rol
                </label>
                <select
                  id="rol"
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  required
                  className="block w-full px-0 py-3 bg-transparent border-0 border-b-2 border-esant-gray-200 text-esant-black focus:outline-none focus:border-esant-black transition-colors appearance-none text-base"
                  disabled={loading}
                >
                  <option value="especialista">Especialista</option>
                  <option value="jefe_proyecto">Jefe de Proyecto</option>
                  <option value="cliente">Cliente</option>
                </select>
              </div>
            </div>

            {/* Especialidad (opcional, solo para especialistas) */}
            {formData.rol === 'especialista' && (
              <div>
                <label htmlFor="especialidad" className="block text-sm font-medium text-esant-gray-600 mb-2">
                  Especialidad (opcional)
                </label>
                <input
                  id="especialidad"
                  name="especialidad"
                  type="text"
                  value={formData.especialidad}
                  onChange={handleChange}
                  className="block w-full px-0 py-3 bg-transparent border-0 border-b-2 border-esant-gray-200 text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors text-base"
                  placeholder="Ej: Arquitecto, Electricista, Paisajista"
                  disabled={loading}
                />
              </div>
            )}

            {/* Passwords en grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-esant-gray-600 mb-2">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="block w-full px-0 py-3 bg-transparent border-0 border-b-2 border-esant-gray-200 text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors text-base"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-esant-gray-600 mb-2">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="block w-full px-0 py-3 bg-transparent border-0 border-b-2 border-esant-gray-200 text-esant-black placeholder-esant-gray-400 focus:outline-none focus:border-esant-black transition-colors text-base"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              fullWidth
              size="lg"
              className="mt-8"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center text-sm text-esant-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-esant-black font-medium hover:underline">
              Inicia sesión
            </Link>
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
