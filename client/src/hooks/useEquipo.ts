import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipoService } from '../services/equipo';

/**
 * Get all team members for a project
 */
export const useTeamMembers = (proyectoId: string) => {
  return useQuery({
    queryKey: ['equipo', proyectoId],
    queryFn: () => equipoService.getTeamMembers(proyectoId),
    enabled: !!proyectoId,
  });
};

/**
 * Get team members grouped by role
 */
export const useTeamMembersByRole = (proyectoId: string) => {
  return useQuery({
    queryKey: ['equipo', 'by-role', proyectoId],
    queryFn: () => equipoService.getTeamMembersByRole(proyectoId),
    enabled: !!proyectoId,
  });
};

/**
 * Get team members grouped by especialidad
 */
export const useTeamMembersByEspecialidad = (proyectoId: string) => {
  return useQuery({
    queryKey: ['equipo', 'by-especialidad', proyectoId],
    queryFn: () => equipoService.getTeamMembersByEspecialidad(proyectoId),
    enabled: !!proyectoId,
  });
};

/**
 * Get team statistics
 */
export const useTeamStats = (proyectoId: string) => {
  return useQuery({
    queryKey: ['equipo', 'stats', proyectoId],
    queryFn: () => equipoService.getTeamStats(proyectoId),
    enabled: !!proyectoId,
  });
};

/**
 * Search users to add to team
 */
export const useSearchUsers = (proyectoId: string, searchTerm: string) => {
  return useQuery({
    queryKey: ['equipo', 'search', proyectoId, searchTerm],
    queryFn: () => equipoService.searchUsers(proyectoId, searchTerm),
    enabled: !!proyectoId && searchTerm.length >= 2,
  });
};

/**
 * Add a member to the team
 */
export const useAddMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ proyectoId, userId }: { proyectoId: string; userId: string }) =>
      equipoService.addMember(proyectoId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipo'] });
      queryClient.invalidateQueries({ queryKey: ['proyectos'] });
    },
  });
};

/**
 * Remove a member from the team
 */
export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ proyectoId, userId }: { proyectoId: string; userId: string }) =>
      equipoService.removeMember(proyectoId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipo'] });
      queryClient.invalidateQueries({ queryKey: ['proyectos'] });
    },
  });
};
