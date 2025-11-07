import type { Visita } from '../types';

export const mockVisitas: Visita[] = [
  {
    id: '1',
    proyectoId: 'proyecto-1',
    fecha: new Date(2025, 9, 22), // 22 Oct 2025
    hora: '09:00',
    estado: 'completada',
    notasGenerales: 'Revisión de avances en cocina y baño. Instalación de cerámicos completada.',
    asuntos: [
      {
        id: 'a1',
        visitaId: '1',
        area: 'Cocina',
        descripcion: 'Revisar instalación de muebles',
        convertidoAPendiente: true,
        createdAt: new Date(2025, 9, 22),
      },
      {
        id: 'a2',
        visitaId: '1',
        area: 'Baño',
        descripcion: 'Verificar cerámicos',
        convertidoAPendiente: true,
        createdAt: new Date(2025, 9, 22),
      },
    ],
    creadoPor: 'user-1',
    createdAt: new Date(2025, 9, 22),
    updatedAt: new Date(2025, 9, 22),
  },
  {
    id: '2',
    proyectoId: 'proyecto-1',
    fecha: new Date(2025, 9, 15), // 15 Oct 2025
    hora: '11:30',
    estado: 'completada',
    notasGenerales: 'Reunión con especialistas de iluminación. Definición de luminarias para sala y comedor.',
    asuntos: [
      {
        id: 'a3',
        visitaId: '2',
        area: 'Sala de estar',
        descripcion: 'Seleccionar luminarias',
        convertidoAPendiente: false,
        createdAt: new Date(2025, 9, 15),
      },
    ],
    creadoPor: 'user-1',
    createdAt: new Date(2025, 9, 15),
    updatedAt: new Date(2025, 9, 15),
  },
  {
    id: '3',
    proyectoId: 'proyecto-1',
    fecha: new Date(2025, 9, 8), // 8 Oct 2025
    hora: '14:00',
    estado: 'completada',
    notasGenerales: 'Inspección de trabajos de construcción. Avance según cronograma.',
    asuntos: [],
    creadoPor: 'user-1',
    createdAt: new Date(2025, 9, 8),
    updatedAt: new Date(2025, 9, 8),
  },
];

export const getProximaVisita = (visitas: Visita[]): Date | undefined => {
  const now = new Date();
  const futureVisitas = visitas
    .filter(v => new Date(v.fecha) > now && v.estado === 'programada')
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  return futureVisitas.length > 0 ? new Date(futureVisitas[0].fecha) : undefined;
};
