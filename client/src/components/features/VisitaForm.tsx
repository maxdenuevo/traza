import { useState } from 'react';
import { Button } from '../common/Button';
import type { Visita } from '../../types';

interface VisitaFormProps {
  onSubmit: (visita: Partial<Visita>) => void;
  onCancel: () => void;
}

export const VisitaForm = ({ onSubmit, onCancel }: VisitaFormProps) => {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState('09:00');
  const [notasGenerales, setNotasGenerales] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      fecha: new Date(fecha),
      hora,
      estado: 'en_curso',
      notasGenerales,
      asuntos: [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fecha de la visita
        </label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-esant-black focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hora (opcional)
        </label>
        <input
          type="time"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-esant-black focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notas generales
        </label>
        <textarea
          value={notasGenerales}
          onChange={(e) => setNotasGenerales(e.target.value)}
          rows={4}
          placeholder="Observaciones generales de la visita..."
          className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-esant-black focus:border-transparent"
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="secondary" fullWidth onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" fullWidth>
          Crear Visita
        </Button>
      </div>
    </form>
  );
};
