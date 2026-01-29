import { useMemo } from 'react';
import { useProgramaStore, SECTORS } from '../store/useProgramaStore';
import { usePendientesByArea } from './usePendientes';
import { useMaterialesBySector } from './useMateriales';
import { useProjectStore } from '../store/useProjectStore';
import { differenceInDays } from 'date-fns';
import type { SectorStatus, PendienteEstado, MaterialEstado } from '../types';
import type { SectorData } from '../store/useProgramaStore';

export interface SectorTracking {
  name: string;
  programa: {
    status: SectorStatus;
    delayDays: number;
    fechaInicio?: Date;
    fechaEntregaPropuesta?: Date;
    fechaEntregaReal?: Date;
    obras?: string;
  };
  tareas: {
    total: number;
    byEstado: Record<PendienteEstado, number>;
    completionPercent: number;
  };
  materiales: {
    total: number;
    byEstado: Record<MaterialEstado, number>;
    hasShortage: boolean;
  };
  healthStatus: 'completado' | 'en-tiempo' | 'en-riesgo' | 'atrasado';
}

const defaultTareasByEstado: Record<PendienteEstado, number> = {
  creada: 0,
  en_progreso: 0,
  pausada: 0,
  completada: 0,
  cancelada: 0,
};

const defaultMaterialesByEstado: Record<MaterialEstado, number> = {
  disponible: 0,
  agotado: 0,
  por_comprar: 0,
};

export const useSeguimiento = () => {
  const { currentProject } = useProjectStore();
  const { projectSectors } = useProgramaStore();
  const { data: pendientesByArea, isLoading: loadingPendientes } = usePendientesByArea(currentProject?.id || '');
  const { data: materialesBySector, isLoading: loadingMateriales } = useMaterialesBySector(currentProject?.id || '');

  const projectId = currentProject?.id || '';
  const sectorDataMap = projectSectors[projectId] || {};

  const sectoresTracking = useMemo(() => {
    const today = new Date();

    return SECTORS.map((sectorName): SectorTracking => {
      // Programa data
      const programaData: SectorData | undefined = sectorDataMap[sectorName];
      const status = programaData?.status || 'pendiente';
      const fechaEntregaPropuesta = programaData?.fechaEntregaPropuesta
        ? new Date(programaData.fechaEntregaPropuesta)
        : undefined;
      const fechaEntregaReal = programaData?.fechaEntregaReal
        ? new Date(programaData.fechaEntregaReal)
        : undefined;
      const fechaInicio = programaData?.fechaInicio
        ? new Date(programaData.fechaInicio)
        : undefined;

      // Calculate delay
      let delayDays = 0;
      if (fechaEntregaPropuesta && status !== 'entregado' && status !== 'cancelado') {
        delayDays = differenceInDays(today, fechaEntregaPropuesta);
        if (delayDays < 0) delayDays = 0;
      }

      // Pendientes data
      const areaPendientes = pendientesByArea?.find(
        (a) => a.area.toLowerCase() === sectorName.toLowerCase()
      );
      const tareasByEstado = { ...defaultTareasByEstado };
      let totalTareas = 0;

      if (areaPendientes) {
        areaPendientes.pendientes.forEach((p) => {
          const estado = p.estado as PendienteEstado;
          if (tareasByEstado[estado] !== undefined) {
            tareasByEstado[estado]++;
          }
          totalTareas++;
        });
      }

      const completadas = tareasByEstado.completada;
      const activeTareas = totalTareas - tareasByEstado.cancelada;
      const completionPercent = activeTareas > 0
        ? Math.round((completadas / activeTareas) * 100)
        : 0;

      // Materiales data
      const sectorMateriales = materialesBySector?.find(
        (m) => m.sector.toLowerCase() === sectorName.toLowerCase()
      );
      const materialesByEstado = { ...defaultMaterialesByEstado };
      let totalMateriales = 0;

      if (sectorMateriales) {
        sectorMateriales.materiales.forEach((m) => {
          const estado = m.estado as MaterialEstado;
          if (materialesByEstado[estado] !== undefined) {
            materialesByEstado[estado]++;
          }
          totalMateriales++;
        });
      }

      const hasShortage = materialesByEstado.agotado > 0 || materialesByEstado.por_comprar > 0;

      // Calculate health status
      let healthStatus: SectorTracking['healthStatus'] = 'en-tiempo';

      if (status === 'entregado') {
        healthStatus = 'completado';
      } else if (delayDays > 0) {
        healthStatus = 'atrasado';
      } else if (
        status === 'pausado' ||
        tareasByEstado.pausada > 0 ||
        hasShortage
      ) {
        healthStatus = 'en-riesgo';
      }

      return {
        name: sectorName,
        programa: {
          status,
          delayDays,
          fechaInicio,
          fechaEntregaPropuesta,
          fechaEntregaReal,
          obras: programaData?.obras,
        },
        tareas: {
          total: totalTareas,
          byEstado: tareasByEstado,
          completionPercent,
        },
        materiales: {
          total: totalMateriales,
          byEstado: materialesByEstado,
          hasShortage,
        },
        healthStatus,
      };
    });
  }, [sectorDataMap, pendientesByArea, materialesBySector]);

  // Summary stats
  const summary = useMemo(() => {
    const stats = {
      total: sectoresTracking.length,
      completados: 0,
      enTiempo: 0,
      enRiesgo: 0,
      atrasados: 0,
      totalTareas: 0,
      tareasCompletadas: 0,
      totalMateriales: 0,
      materialesAgotados: 0,
    };

    sectoresTracking.forEach((s) => {
      switch (s.healthStatus) {
        case 'completado':
          stats.completados++;
          break;
        case 'en-tiempo':
          stats.enTiempo++;
          break;
        case 'en-riesgo':
          stats.enRiesgo++;
          break;
        case 'atrasado':
          stats.atrasados++;
          break;
      }
      stats.totalTareas += s.tareas.total;
      stats.tareasCompletadas += s.tareas.byEstado.completada;
      stats.totalMateriales += s.materiales.total;
      stats.materialesAgotados += s.materiales.byEstado.agotado;
    });

    return stats;
  }, [sectoresTracking]);

  return {
    sectores: sectoresTracking,
    summary,
    isLoading: loadingPendientes || loadingMateriales,
  };
};
