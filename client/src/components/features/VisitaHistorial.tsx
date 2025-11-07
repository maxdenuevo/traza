import { useState } from 'react';
import { formatDate } from '../../utils/dateUtils';
import { Icon } from '../common/Icon';
import type { Visita } from '../../types';

interface VisitaHistorialProps {
  visitas: Visita[];
}

export const VisitaHistorial = ({ visitas }: VisitaHistorialProps) => {
  const [expandedVisitas, setExpandedVisitas] = useState<Set<string>>(new Set());

  const toggleVisita = (visitaId: string) => {
    setExpandedVisitas(prev => {
      const next = new Set(prev);
      if (next.has(visitaId)) {
        next.delete(visitaId);
      } else {
        next.add(visitaId);
      }
      return next;
    });
  };

  // Sort by date descending
  const sortedVisitas = [...visitas].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  if (visitas.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-medium mb-3">Historial de visitas</h3>
        <div className="text-center text-gray-400 py-8">
          No hay visitas registradas
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="font-medium mb-3">Historial de visitas</h3>
      <div className="space-y-2">
        {sortedVisitas.map((visita) => {
          const isExpanded = expandedVisitas.has(visita.id);
          const areas = [...new Set(visita.asuntos.map(a => a.area))].join(', ');

          return (
            <div key={visita.id}>
              <button
                onClick={() => toggleVisita(visita.id)}
                className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 btn-touch active-scale"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {formatDate(new Date(visita.fecha))}
                      {visita.hora && ` - ${visita.hora} hrs`}
                    </span>
                    {visita.asuntos.length > 0 && (
                      <span className="text-xs bg-esant-black text-esant-white px-2 py-0.5 rounded-full">
                        {visita.asuntos.length}
                      </span>
                    )}
                  </div>
                  <Icon
                    name="chevron-down"
                    size={16}
                    className={`smooth-transition ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              <div className={isExpanded ? 'area-expanded' : 'area-collapsed'}>
                <div className="p-3 bg-white border rounded-lg text-xs text-gray-600 ml-2 mt-2">
                  {visita.notasGenerales && (
                    <p className="mb-2">
                      <strong>Notas:</strong> {visita.notasGenerales}
                    </p>
                  )}
                  {areas && (
                    <p>
                      <strong>Áreas:</strong> {areas || 'Sin áreas registradas'}
                    </p>
                  )}
                  {visita.asuntos.length > 0 && (
                    <div className="mt-2">
                      <strong>Asuntos:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        {visita.asuntos.map(asunto => (
                          <li key={asunto.id}>
                            <span className="font-medium">{asunto.area}:</span> {asunto.descripcion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
