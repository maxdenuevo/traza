import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { USER_ROLE_LABELS, USER_ROLE_COLORS, generateWhatsAppLink } from '../../constants';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { FAB } from '../../components/common/FAB';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { NoProjectSelected } from '../../components/common/NoProjectSelected';
import { useProjectStore } from '../../store/useProjectStore';
import { useAuthStore } from '../../store/useAuthStore';
import {
  useTeamMembersByRole,
  useTeamStats,
  useRemoveMember,
} from '../../hooks/useEquipo';
import { useAsistenciaHistory } from '../../hooks/useAsistencia';
import type { User, Asistencia } from '../../types';

export const EquipoPage = () => {
  const { currentProject } = useProjectStore();
  const { user: currentUser } = useAuthStore();
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  const [expandedAbsences, setExpandedAbsences] = useState<Set<string>>(new Set());

  // Fetch data
  const { data: roleGroups = [], isLoading } = useTeamMembersByRole(currentProject?.id || '');
  const { data: stats } = useTeamStats(currentProject?.id || '');

  // Fetch attendance history for the last 30 days to calculate absences
  const endDate = new Date();
  const startDate = subDays(endDate, 30);
  const { data: asistenciaHistory = [] } = useAsistenciaHistory(
    currentProject?.id || '',
    startDate,
    endDate
  );

  // Calculate absences per user
  const absencesByUser = useMemo(() => {
    const absences: Record<string, { count: number; dates: Date[] }> = {};

    asistenciaHistory.forEach((record: Asistencia) => {
      if (!record.presente) {
        if (!absences[record.trabajadorId]) {
          absences[record.trabajadorId] = { count: 0, dates: [] };
        }
        absences[record.trabajadorId].count++;
        absences[record.trabajadorId].dates.push(record.fecha);
      }
    });

    // Sort dates descending
    Object.values(absences).forEach(a => {
      a.dates.sort((d1, d2) => d2.getTime() - d1.getTime());
    });

    return absences;
  }, [asistenciaHistory]);

  const toggleAbsences = (userId: string) => {
    setExpandedAbsences((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  // Mutations
  const removeMemberMutation = useRemoveMember();

  const toggleRole = (rol: string) => {
    setExpandedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(rol)) {
        next.delete(rol);
      } else {
        next.add(rol);
      }
      return next;
    });
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!currentProject) return;

    // Don't allow removing yourself
    if (userId === currentUser?.id) {
      toast.error('No puedes eliminarte a ti mismo del proyecto');
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar a ${userName} del equipo?`)) return;

    try {
      await removeMemberMutation.mutateAsync({ proyectoId: currentProject.id, userId });
      toast.success(`${userName} eliminado del equipo`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar miembro';
      toast.error(errorMessage);
    }
  };

  const handleWhatsApp = (member: User) => {
    if (!member.telefono) {
      toast.error('Este miembro no tiene teléfono registrado');
      return;
    }

    const mensaje = `Hola ${member.nombre}, te escribo desde ESANT MARIA`;
    const url = generateWhatsAppLink(member.telefono, mensaje);
    window.open(url, '_blank');
  };

  const handleCall = (member: User) => {
    if (!member.telefono) {
      toast.error('Este miembro no tiene teléfono registrado');
      return;
    }

    window.location.href = `tel:${member.telefono}`;
  };

  const handleEmail = (member: User) => {
    window.location.href = `mailto:${member.email}`;
  };

  // Check if user can manage team (admin or jefe_proyecto)
  const canManageTeam = currentUser?.rol === 'admin' || currentUser?.rol === 'jefe_proyecto';

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // No project selected
  if (!currentProject) {
    return <NoProjectSelected icon="users" message="Selecciona o crea un proyecto para ver el equipo" />;
  }

  // No team members
  if (roleGroups.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Icon name="users" size={48} className="text-esant-gray-400 mx-auto mb-3" />
        <p className="text-esant-gray-600 mb-2">No hay miembros en el equipo</p>
        <p className="text-sm text-esant-gray-400">Los miembros del equipo aparecerán aquí</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header con estadísticas */}
      <Card className="p-6">
        <h2 className="font-semibold text-xl text-esant-black mb-1">Equipo del Proyecto</h2>
        <p className="text-sm text-esant-gray-600">Directorio de contactos</p>

        {/* Quick stats */}
        {stats && (
          <div className="flex gap-4 mt-4 pt-4 border-t border-esant-gray-200">
            <div className="flex items-center gap-2">
              <Icon name="users" size={16} className="text-esant-gray-600" />
              <span className="text-sm text-esant-gray-800">
                <span className="font-semibold text-esant-black">{stats.total}</span> miembros
              </span>
            </div>
            {stats.especialistas > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-esant-green"></div>
                <span className="text-sm text-esant-gray-800">
                  <span className="font-semibold text-esant-black">{stats.especialistas}</span> especialistas
                </span>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Roles con miembros */}
      {roleGroups.map(({ rol, users }) => {
        const isExpanded = expandedRoles.has(rol);
        const colors = USER_ROLE_COLORS[rol];

        return (
          <div key={rol} className="bg-esant-white rounded-xl shadow-esant overflow-hidden">
            {/* Rol Header - Colapsable */}
            <button
              onClick={() => toggleRole(rol)}
              className="w-full p-5 flex items-center justify-between btn-touch hover:bg-esant-gray-100 smooth-transition"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-sm ${colors.indicator}`}></div>
                <div className="flex flex-col items-start">
                  <h3 className="font-semibold text-lg text-esant-black">{USER_ROLE_LABELS[rol]}</h3>
                  <span className="text-sm text-esant-gray-600">{users.length} miembro{users.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <Icon
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                className="text-esant-gray-600"
              />
            </button>

            {/* Members List - Colapsable */}
            {isExpanded && (
              <div className="border-t border-esant-gray-200">
                {users.map((member) => {
                  const isCurrentUser = member.id === currentUser?.id;

                  return (
                    <div
                      key={member.id}
                      className="p-5 border-b border-esant-gray-200 last:border-b-0"
                    >
                      {/* Member Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-base text-esant-black">
                              {member.nombre}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs bg-esant-black text-esant-white px-2 py-0.5 rounded">
                                  Tú
                                </span>
                              )}
                            </h4>
                          </div>
                          {member.especialidad && (
                            <p className="text-sm text-esant-gray-600 mb-1">{member.especialidad}</p>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs text-esant-gray-600">
                            <a
                              href={`mailto:${member.email}`}
                              className="flex items-center gap-1 hover:text-esant-black transition-colors"
                            >
                              <Icon name="mail" size={12} />
                              {member.email}
                            </a>
                            {member.telefono && (
                              <a
                                href={`tel:${member.telefono}`}
                                className="flex items-center gap-1 hover:text-esant-black transition-colors"
                              >
                                <Icon name="phone" size={12} />
                                {member.telefono}
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Remove button - 44px touch target */}
                        {canManageTeam && !isCurrentUser && (
                          <button
                            onClick={() => handleRemoveMember(member.id, member.nombre)}
                            className="w-11 h-11 flex items-center justify-center hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar del equipo"
                          >
                            <Icon name="trash-2" size={18} className="text-esant-red" />
                          </button>
                        )}
                      </div>

                      {/* Absences - only for trabajadores and subcontratados */}
                      {(member.rol === 'trabajador' || member.rol === 'subcontratado') && (
                        <div className="mb-3">
                          {absencesByUser[member.id] && absencesByUser[member.id].count > 0 ? (
                            <div className="bg-red-50 rounded-lg p-3">
                              <button
                                onClick={() => toggleAbsences(member.id)}
                                className="w-full flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <Icon name="calendar-x" size={16} className="text-esant-red" />
                                  <span className="text-sm font-medium text-esant-red">
                                    {absencesByUser[member.id].count} ausencia{absencesByUser[member.id].count !== 1 ? 's' : ''} (últimos 30 días)
                                  </span>
                                </div>
                                <Icon
                                  name={expandedAbsences.has(member.id) ? 'chevron-up' : 'chevron-down'}
                                  size={16}
                                  className="text-esant-red"
                                />
                              </button>

                              {expandedAbsences.has(member.id) && (
                                <div className="mt-2 pt-2 border-t border-red-100 space-y-1">
                                  {absencesByUser[member.id].dates.slice(0, 5).map((date, idx) => (
                                    <div key={idx} className="text-xs text-esant-gray-600">
                                      {format(date, "EEEE d 'de' MMMM", { locale: es })}
                                    </div>
                                  ))}
                                  {absencesByUser[member.id].dates.length > 5 && (
                                    <div className="text-xs text-esant-gray-500 italic">
                                      +{absencesByUser[member.id].dates.length - 5} más...
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-esant-gray-50 rounded-lg p-3 flex items-center gap-2">
                              <Icon name="check-circle" size={16} className="text-esant-gray-500" />
                              <span className="text-sm text-esant-gray-600">Sin ausencias (últimos 30 días)</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Contact Actions */}
                      <div className="flex gap-2">
                        {member.telefono && (
                          <>
                            <Button
                              variant="whatsapp"
                              size="sm"
                              onClick={() => handleWhatsApp(member)}
                              className="flex-1"
                            >
                              <Icon name="message-circle" size={14} />
                              WhatsApp
                            </Button>
                            <button
                              onClick={() => handleCall(member)}
                              className="w-11 h-11 bg-esant-gray-100 text-esant-gray-800 rounded-lg font-medium hover:bg-esant-gray-200 transition-colors flex items-center justify-center"
                              title="Llamar"
                            >
                              <Icon name="phone" size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEmail(member)}
                          className="w-11 h-11 bg-esant-gray-100 text-esant-gray-800 rounded-lg font-medium hover:bg-esant-gray-200 transition-colors flex items-center justify-center"
                          title="Enviar email"
                        >
                          <Icon name="mail" size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* FAB - Add member (admin/jefe only) */}
      {canManageTeam && (
        <FAB onClick={() => toast.info('Función de agregar miembros próximamente')} icon="user-plus" />
      )}
    </div>
  );
};
