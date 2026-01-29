import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../components/common/Icon';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useSeguimiento } from '../../hooks/useSeguimiento';
import type { SectorTracking } from '../../hooks/useSeguimiento';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const HEALTH_CONFIG = {
  completado: {
    bg: 'bg-esant-gray-100',
    text: 'text-esant-black',
    border: 'border-esant-gray-300',
    indicator: 'bg-esant-black',
    label: 'Completado',
    icon: 'check-circle',
  },
  'en-tiempo': {
    bg: 'bg-esant-gray-50',
    text: 'text-esant-gray-700',
    border: 'border-esant-gray-200',
    indicator: 'bg-esant-gray-500',
    label: 'En tiempo',
    icon: 'clock',
  },
  'en-riesgo': {
    bg: 'bg-esant-gray-100',
    text: 'text-esant-gray-700',
    border: 'border-esant-gray-300',
    indicator: 'bg-esant-gray-400',
    label: 'En riesgo',
    icon: 'alert-triangle',
  },
  atrasado: {
    bg: 'bg-red-50',
    text: 'text-esant-red',
    border: 'border-red-200',
    indicator: 'bg-esant-red',
    label: 'Atrasado',
    icon: 'alert-circle',
  },
};

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  en_curso: 'En curso',
  pausado: 'Pausado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export const SeguimientoPage = () => {
  const { sectores, summary, isLoading } = useSeguimiento();
  const [expandedSector, setExpandedSector] = useState<string | null>(null);
  const [filterHealth, setFilterHealth] = useState<string | null>(null);
  const navigate = useNavigate();

  const filteredSectores = filterHealth
    ? sectores.filter((s) => s.healthStatus === filterHealth)
    : sectores;

  // Only show sectors with activity (programa status set or has tasks/materials)
  const activeSectores = filteredSectores.filter(
    (s) =>
      s.programa.status !== 'pendiente' ||
      s.tareas.total > 0 ||
      s.materiales.total > 0
  );

  const toggleExpand = (sectorName: string) => {
    setExpandedSector(expandedSector === sectorName ? null : sectorName);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Summary Header */}
      <div className="bg-white border-b border-esant-gray-200 px-4 py-4 mb-4">
        <h2 className="text-lg font-semibold text-esant-gray-900 mb-3">
          Resumen del Proyecto
        </h2>

        {/* Health Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button
            onClick={() => setFilterHealth(filterHealth === 'completado' ? null : 'completado')}
            className={`p-2 rounded-lg text-center transition-all ${
              filterHealth === 'completado'
                ? 'ring-2 ring-esant-black bg-esant-gray-100'
                : 'bg-esant-gray-100/50'
            }`}
          >
            <div className="text-xl font-bold text-esant-black">{summary.completados}</div>
            <div className="text-[10px] text-esant-gray-600">Completados</div>
          </button>
          <button
            onClick={() => setFilterHealth(filterHealth === 'en-tiempo' ? null : 'en-tiempo')}
            className={`p-2 rounded-lg text-center transition-all ${
              filterHealth === 'en-tiempo'
                ? 'ring-2 ring-esant-gray-500 bg-esant-gray-100'
                : 'bg-esant-gray-50'
            }`}
          >
            <div className="text-xl font-bold text-esant-gray-700">{summary.enTiempo}</div>
            <div className="text-[10px] text-esant-gray-500">En tiempo</div>
          </button>
          <button
            onClick={() => setFilterHealth(filterHealth === 'en-riesgo' ? null : 'en-riesgo')}
            className={`p-2 rounded-lg text-center transition-all ${
              filterHealth === 'en-riesgo'
                ? 'ring-2 ring-esant-gray-400 bg-esant-gray-100'
                : 'bg-esant-gray-100/50'
            }`}
          >
            <div className="text-xl font-bold text-esant-gray-700">{summary.enRiesgo}</div>
            <div className="text-[10px] text-esant-gray-500">En riesgo</div>
          </button>
          <button
            onClick={() => setFilterHealth(filterHealth === 'atrasado' ? null : 'atrasado')}
            className={`p-2 rounded-lg text-center transition-all ${
              filterHealth === 'atrasado'
                ? 'ring-2 ring-esant-red bg-red-50'
                : 'bg-red-50/50'
            }`}
          >
            <div className="text-xl font-bold text-esant-red">{summary.atrasados}</div>
            <div className="text-[10px] text-esant-red">Atrasados</div>
          </button>
        </div>

        {/* Overall Progress */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Icon name="clipboard-list" className="w-4 h-4 text-esant-gray-500" />
            <span className="text-esant-gray-600">
              {summary.tareasCompletadas}/{summary.totalTareas} tareas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="package" className="w-4 h-4 text-esant-gray-500" />
            <span className="text-esant-gray-600">
              {summary.totalMateriales} materiales
            </span>
            {summary.materialesAgotados > 0 && (
              <span className="text-red-600 text-xs">
                ({summary.materialesAgotados} agotados)
              </span>
            )}
          </div>
        </div>

        {filterHealth && (
          <button
            onClick={() => setFilterHealth(null)}
            className="mt-3 text-sm text-esant-red-600 flex items-center gap-1"
          >
            <Icon name="x" className="w-4 h-4" />
            Quitar filtro
          </button>
        )}
      </div>

      {/* Sectors List */}
      <div className="px-4 space-y-3">
        {activeSectores.length === 0 ? (
          <div className="text-center py-8 text-esant-gray-500">
            {filterHealth
              ? 'No hay sectores con este estado'
              : 'No hay sectores con actividad'}
          </div>
        ) : (
          activeSectores.map((sector) => (
            <SectorCard
              key={sector.name}
              sector={sector}
              isExpanded={expandedSector === sector.name}
              onToggle={() => toggleExpand(sector.name)}
              onNavigatePendientes={() => navigate('/pendientes')}
              onNavigateMateriales={() => navigate('/materiales')}
            />
          ))
        )}
      </div>

      {/* Show inactive sectors count */}
      {!filterHealth && sectores.length > activeSectores.length && (
        <div className="text-center mt-4 text-sm text-esant-gray-500">
          {sectores.length - activeSectores.length} sectores sin actividad
        </div>
      )}
    </div>
  );
};

interface SectorCardProps {
  sector: SectorTracking;
  isExpanded: boolean;
  onToggle: () => void;
  onNavigatePendientes: () => void;
  onNavigateMateriales: () => void;
}

const SectorCard = ({
  sector,
  isExpanded,
  onToggle,
  onNavigatePendientes,
  onNavigateMateriales,
}: SectorCardProps) => {
  const healthConfig = HEALTH_CONFIG[sector.healthStatus];

  return (
    <div
      className={`bg-white rounded-xl border overflow-hidden transition-all ${healthConfig.border}`}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3"
      >
        {/* Health indicator */}
        <div className={`w-2 h-2 rounded-full ${healthConfig.indicator}`} />

        {/* Sector name */}
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-esant-gray-900">{sector.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs ${healthConfig.text}`}>
              {healthConfig.label}
            </span>
            {sector.programa.delayDays > 0 && (
              <span className="text-xs text-red-600 font-medium">
                +{sector.programa.delayDays}d
              </span>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-3 text-xs text-esant-gray-500">
          {sector.tareas.total > 0 && (
            <span className="flex items-center gap-1">
              <Icon name="clipboard-list" className="w-3.5 h-3.5" />
              {sector.tareas.byEstado.completada}/{sector.tareas.total}
            </span>
          )}
          {sector.materiales.hasShortage && (
            <span className="flex items-center gap-1 text-red-500">
              <Icon name="alert-triangle" className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        {/* Expand icon */}
        <Icon
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          className="w-5 h-5 text-esant-gray-400"
        />
      </button>

      {/* Progress bar */}
      {sector.tareas.total > 0 && (
        <div className="px-4 pb-2">
          <div className="h-1.5 bg-esant-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-esant-gray-600 rounded-full transition-all"
              style={{ width: `${sector.tareas.completionPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-esant-gray-100">
          {/* Status & Dates */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-esant-gray-600">Estado programa:</span>
              <span className={`text-sm font-medium ${healthConfig.text}`}>
                {STATUS_LABELS[sector.programa.status]}
              </span>
            </div>

            {sector.programa.fechaInicio && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-esant-gray-500">Inicio:</span>
                <span className="text-esant-gray-700">
                  {format(sector.programa.fechaInicio, "d 'de' MMM", { locale: es })}
                </span>
              </div>
            )}

            {sector.programa.fechaEntregaPropuesta && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-esant-gray-500">Entrega propuesta:</span>
                <span
                  className={
                    sector.programa.delayDays > 0
                      ? 'text-red-600 font-medium'
                      : 'text-esant-gray-700'
                  }
                >
                  {format(sector.programa.fechaEntregaPropuesta, "d 'de' MMM", {
                    locale: es,
                  })}
                </span>
              </div>
            )}

            {sector.programa.fechaEntregaReal && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-esant-gray-500">Entrega real:</span>
                <span className="text-esant-black font-medium">
                  {format(sector.programa.fechaEntregaReal, "d 'de' MMM", { locale: es })}
                </span>
              </div>
            )}

            {sector.programa.obras && (
              <p className="mt-2 text-sm text-esant-gray-600 bg-esant-gray-50 rounded-lg p-2">
                {sector.programa.obras}
              </p>
            )}
          </div>

          {/* Tareas breakdown */}
          {sector.tareas.total > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-esant-gray-700">
                  Tareas ({sector.tareas.completionPercent}% completado)
                </span>
                <button
                  onClick={onNavigatePendientes}
                  className="text-xs text-esant-red-600 flex items-center gap-1"
                >
                  Ver todas
                  <Icon name="chevron-right" className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-1 text-center text-xs">
                <div className="bg-esant-gray-100 rounded p-1.5">
                  <div className="font-semibold text-esant-gray-700">
                    {sector.tareas.byEstado.creada}
                  </div>
                  <div className="text-esant-gray-500 text-[10px]">Creadas</div>
                </div>
                <div className="bg-esant-gray-200 rounded p-1.5">
                  <div className="font-semibold text-esant-gray-800">
                    {sector.tareas.byEstado.en_progreso}
                  </div>
                  <div className="text-esant-gray-600 text-[10px]">Progreso</div>
                </div>
                <div className="bg-esant-gray-50 rounded p-1.5">
                  <div className="font-semibold text-esant-gray-600">
                    {sector.tareas.byEstado.pausada}
                  </div>
                  <div className="text-esant-gray-500 text-[10px]">Pausadas</div>
                </div>
                <div className="bg-esant-gray-300 rounded p-1.5">
                  <div className="font-semibold text-esant-black">
                    {sector.tareas.byEstado.completada}
                  </div>
                  <div className="text-esant-gray-700 text-[10px]">Listas</div>
                </div>
                <div className="bg-red-50 rounded p-1.5">
                  <div className="font-semibold text-esant-red">
                    {sector.tareas.byEstado.cancelada}
                  </div>
                  <div className="text-esant-red text-[10px]">Cancel.</div>
                </div>
              </div>
            </div>
          )}

          {/* Materiales breakdown */}
          {sector.materiales.total > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-esant-gray-700">
                  Materiales ({sector.materiales.total})
                </span>
                <button
                  onClick={onNavigateMateriales}
                  className="text-xs text-esant-red-600 flex items-center gap-1"
                >
                  Ver inventario
                  <Icon name="chevron-right" className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-esant-gray-200 rounded p-2">
                  <div className="font-semibold text-esant-black">
                    {sector.materiales.byEstado.disponible}
                  </div>
                  <div className="text-esant-gray-600 text-[10px]">Disponibles</div>
                </div>
                <div className="bg-red-50 rounded p-2">
                  <div className="font-semibold text-esant-red">
                    {sector.materiales.byEstado.agotado}
                  </div>
                  <div className="text-esant-red text-[10px]">Agotados</div>
                </div>
                <div className="bg-esant-gray-100 rounded p-2">
                  <div className="font-semibold text-esant-gray-700">
                    {sector.materiales.byEstado.por_comprar}
                  </div>
                  <div className="text-esant-gray-600 text-[10px]">Por comprar</div>
                </div>
              </div>
            </div>
          )}

          {/* No data message */}
          {sector.tareas.total === 0 && sector.materiales.total === 0 && (
            <p className="text-sm text-esant-gray-500 text-center py-2">
              Sin tareas ni materiales registrados
            </p>
          )}
        </div>
      )}
    </div>
  );
};
