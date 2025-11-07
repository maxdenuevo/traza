import { useState } from 'react';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import type { Asunto } from '../../types';
import { AREAS_COMUNES } from '../../constants';

interface AreaAsuntosListProps {
  areas: Array<{
    area: string;
    asuntos: Asunto[];
  }>;
  onAddArea: (area: string) => void;
  onAddAsunto: (area: string, asunto: Partial<Asunto>) => void;
  onRemoveAsunto: (area: string, asuntoId: string) => void;
  onConvertToPendientes?: () => void;
}

export const AreaAsuntosList = ({
  areas,
  onAddArea,
  onAddAsunto,
  onRemoveAsunto,
  onConvertToPendientes,
}: AreaAsuntosListProps) => {
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [showAreaSelector, setShowAreaSelector] = useState(false);
  const [newAsuntoTexts, setNewAsuntoTexts] = useState<Record<string, string>>({});

  const toggleArea = (area: string) => {
    setExpandedAreas(prev => {
      const next = new Set(prev);
      if (next.has(area)) {
        next.delete(area);
      } else {
        next.add(area);
      }
      return next;
    });
  };

  const handleAddAsunto = (area: string) => {
    const text = newAsuntoTexts[area]?.trim();
    if (text) {
      onAddAsunto(area, {
        area,
        descripcion: text,
        convertidoAPendiente: false,
        createdAt: new Date(),
      });
      setNewAsuntoTexts({ ...newAsuntoTexts, [area]: '' });
    }
  };

  const availableAreas = AREAS_COMUNES.filter(
    area => !areas.some(a => a.area === area)
  );

  const totalAsuntos = areas.reduce((sum, a) => sum + a.asuntos.length, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">
          Áreas visitadas ({areas.length})
        </label>
        <button
          onClick={() => setShowAreaSelector(!showAreaSelector)}
          className="text-xs text-esant-black font-medium hover:underline"
        >
          + Agregar área
        </button>
      </div>

      {/* Area selector */}
      {showAreaSelector && availableAreas.length > 0 && (
        <div className="bg-gray-50 p-3 rounded-lg border">
          <p className="text-sm font-medium mb-2">Selecciona un área:</p>
          <div className="flex flex-wrap gap-2">
            {availableAreas.map(area => (
              <button
                key={area}
                onClick={() => {
                  onAddArea(area);
                  setShowAreaSelector(false);
                  setExpandedAreas(prev => new Set(prev).add(area));
                }}
                className="px-3 py-1.5 bg-white border rounded-lg text-sm hover:bg-gray-50 btn-touch"
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Areas list */}
      <div className="space-y-2">
        {areas.map(({ area, asuntos }) => (
          <div key={area} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleArea(area)}
              className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between btn-touch active-scale"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{area}</span>
                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                  {asuntos.length}
                </span>
              </div>
              <Icon
                name="chevron-down"
                size={16}
                className={`text-gray-400 smooth-transition ${
                  expandedAreas.has(area) ? 'rotate-180' : ''
                }`}
              />
            </button>

            <div
              className={`${
                expandedAreas.has(area) ? 'area-expanded' : 'area-collapsed'
              } bg-white`}
            >
              <div className="p-3 space-y-2">
                {/* Asuntos existentes */}
                {asuntos.map((asunto) => (
                  <div key={asunto.id} className="p-3 bg-gray-50 border rounded-lg">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm flex-1">{asunto.descripcion}</p>
                      <button
                        onClick={() => onRemoveAsunto(area, asunto.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Icon name="x" size={16} />
                      </button>
                    </div>
                    {asunto.encargadoId && (
                      <p className="text-xs text-gray-500 mt-1">
                        Encargado: Usuario {asunto.encargadoId}
                      </p>
                    )}
                  </div>
                ))}

                {/* Nuevo asunto input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAsuntoTexts[area] || ''}
                    onChange={(e) =>
                      setNewAsuntoTexts({ ...newAsuntoTexts, [area]: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAsunto(area);
                      }
                    }}
                    placeholder="Descripción del asunto..."
                    className="flex-1 p-2 border rounded text-sm focus:ring-2 focus:ring-esant-black focus:border-transparent"
                  />
                  <button
                    onClick={() => handleAddAsunto(area)}
                    className="btn-touch px-3 py-2 bg-esant-black text-esant-white rounded text-sm hover:bg-esant-gray-900"
                  >
                    <Icon name="plus" size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Convert to Pendientes button */}
      {totalAsuntos > 0 && onConvertToPendientes && (
        <Button variant="primary" fullWidth onClick={onConvertToPendientes}>
          Convertir en Pendientes ({totalAsuntos})
        </Button>
      )}
    </div>
  );
};
