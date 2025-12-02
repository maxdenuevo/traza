# CLAUDE.md - Libro de Obra

Instrucciones para implementar la aplicación móvil "Libro de Obra" - Gestión de proyectos de construcción.

---

## Contexto del Proyecto

**Libro de Obra** es una aplicación móvil para gestionar proyectos de construcción. Permite coordinar visitas a obra, asignar tareas pendientes por sector, registrar notas del equipo, gestionar documentos y permisos, y hacer seguimiento del cronograma.

### Usuarios Principales
- **Arquitecto**: Supervisa diseño y calidad
- **Constructor**: Ejecuta y coordina la obra
- **Jefe de Proyecto**: Administra tiempos y recursos
- **Trabajadores** (David, Mateo, etc.): Ejecutan tareas específicas (acceso limitado)

### Funcionalidades Core
1. Calendario de visitas a obra
2. Gestión de pendientes por sector
3. Notas de equipo (generales y por sector)
4. Directorio del equipo con contacto WhatsApp
5. Cronograma con estados (Listo, Pausado, En obra)
6. Gestión de documentos y permisos
7. Presupuesto y gastos
8. Notificaciones de asignaciones y actualizaciones

---

## Arquitectura Técnica

### Stack Recomendado

```
Frontend Mobile:
├── React Native + Expo (SDK 50+)
├── NativeWind (Tailwind para RN)
├── React Navigation v6
├── Zustand (state management)
├── React Query (server state)
└── Lucide React Native (iconos)

Alternativa Web/PWA:
├── Next.js 14+ (App Router)
├── Tailwind CSS
├── shadcn/ui (componentes)
├── Zustand
└── Lucide React
```

### Estructura de Carpetas

```
libro-de-obra/
├── src/
│   ├── app/                    # Screens / Pages
│   │   ├── (auth)/
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── (main)/
│   │   │   ├── index.tsx       # Home - Libro de Obra
│   │   │   ├── visita/
│   │   │   │   ├── index.tsx   # Lista visitas
│   │   │   │   ├── [id].tsx    # Detalle visita
│   │   │   │   └── nueva.tsx   # Nueva visita
│   │   │   ├── pendientes/
│   │   │   │   ├── index.tsx
│   │   │   │   └── [sector].tsx
│   │   │   ├── notas/
│   │   │   │   ├── index.tsx
│   │   │   │   └── nueva.tsx
│   │   │   ├── equipo/
│   │   │   │   └── index.tsx
│   │   │   ├── cronograma/
│   │   │   │   └── index.tsx
│   │   │   ├── documentos/
│   │   │   │   └── index.tsx
│   │   │   └── presupuesto/
│   │   │       └── index.tsx
│   │   └── _layout.tsx
│   │
│   ├── components/
│   │   ├── ui/                 # Componentes base reutilizables
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── FAB.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Drawer.tsx
│   │   │   ├── Container.tsx
│   │   │   └── BottomSheet.tsx
│   │   │
│   │   └── features/
│   │       ├── calendar/
│   │       │   ├── Calendar.tsx
│   │       │   └── VisitIndicator.tsx
│   │       ├── visits/
│   │       │   ├── VisitCard.tsx
│   │       │   └── VisitForm.tsx
│   │       ├── sectors/
│   │       │   ├── SectorList.tsx
│   │       │   └── SectorItem.tsx
│   │       ├── notes/
│   │       │   ├── NoteCard.tsx
│   │       │   └── NoteForm.tsx
│   │       ├── team/
│   │       │   ├── TeamMember.tsx
│   │       │   └── ContactButton.tsx
│   │       ├── tasks/
│   │       │   ├── TaskCard.tsx
│   │       │   └── TaskList.tsx
│   │       ├── timeline/
│   │       │   ├── TimelineItem.tsx
│   │       │   └── StatusBadge.tsx
│   │       └── notifications/
│   │           ├── NotificationList.tsx
│   │           └── NotificationItem.tsx
│   │
│   ├── hooks/
│   │   ├── useProject.ts
│   │   ├── useVisits.ts
│   │   ├── useTasks.ts
│   │   ├── useNotes.ts
│   │   ├── useTeam.ts
│   │   └── useNotifications.ts
│   │
│   ├── stores/
│   │   ├── projectStore.ts
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   │
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── notifications.ts
│   │
│   ├── types/
│   │   ├── project.ts
│   │   ├── visit.ts
│   │   ├── task.ts
│   │   ├── note.ts
│   │   ├── team.ts
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── dates.ts
│   │   ├── formatters.ts
│   │   └── validators.ts
│   │
│   ├── constants/
│   │   ├── sectors.ts
│   │   ├── roles.ts
│   │   └── status.ts
│   │
│   └── styles/
│       ├── theme.ts
│       └── global.css
│
├── assets/
│   ├── fonts/
│   └── images/
│
├── design_system.md
├── CLAUDE.md
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## Tipos de Datos (TypeScript)

```typescript
// types/project.ts
export interface Project {
  id: string;
  name: string;
  address: string;
  teamIds: string[];
  sectors: Sector[];
  createdAt: Date;
  updatedAt: Date;
}

// types/sector.ts
export interface Sector {
  id: string;
  name: string;
  status: 'listo' | 'pausado' | 'en_obra';
  pendingCount: number;
}

export const SECTORS = [
  'General',
  'Cocina',
  'Comedor',
  'Entrada',
  'Pieza principal',
  'Baño principal',
  'Pieza de servicio',
  'Baño de servicio',
  'Sala de estar',
  'Living',
  'Pieza niños',
  'Baño niños',
  'Jardín',
  'Patio servicio',
  'Baño de visitas',
  'Terraza',
] as const;

// types/visit.ts
export interface Visit {
  id: string;
  projectId: string;
  date: Date;
  time: string;
  location: string;
  notes: Note[];
  attendees: string[];
  notified: boolean;
  createdBy: string;
  createdAt: Date;
}

// types/task.ts
export interface Task {
  id: string;
  projectId: string;
  sectorId: string;
  title: string;
  description?: string;
  assignedTo: string;
  assignedBy: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: Date;
  createdAt: Date;
  completedAt?: Date;
}

// types/note.ts
export interface Note {
  id: string;
  projectId: string;
  visitId?: string;
  sectorId: string;
  content: string;
  attachments?: string[];
  author: TeamMember;
  createdAt: Date;
}

// types/team.ts
export interface TeamMember {
  id: string;
  name: string;
  role: 'arquitecto' | 'constructor' | 'jefe_proyecto' | 'trabajador';
  phone?: string;
  email?: string;
  hasAppAccess: boolean;
}

// types/notification.ts
export interface Notification {
  id: string;
  type: 'task_assigned' | 'visit_scheduled' | 'task_completed' | 'budget_update';
  title: string;
  message: string;
  relatedId?: string;
  read: boolean;
  createdAt: Date;
}
```

---

## Guía de Implementación por Pantalla

### 1. Home - Libro de Obra (`/`)

**Componentes:**
- Header con nombre proyecto y notificaciones
- Calendario mensual con indicadores de visitas
- Card próxima visita
- Lista de sectores con conteo de pendientes

**Lógica:**
- Cargar proyecto activo
- Mostrar visitas del mes actual
- Calcular pendientes por sector
- Detectar próxima visita

**Acciones:**
- Tap en día → Ver/crear visita
- Tap en sector → Ir a pendientes del sector
- FAB → Nueva visita

### 2. Visita (`/visita/[id]`)

**Componentes:**
- Header con fecha y hora
- Info de ubicación
- Lista de notas por sector
- Botones: Nueva nota, Notificar (WhatsApp)

**Lógica:**
- Cargar notas asociadas a la visita
- Agrupar por sector
- Compartir por WhatsApp (deep link)

### 3. Pendientes (`/pendientes`)

**Componentes:**
- Tabs o filtros por sector/responsable
- Lista de tareas con status
- Asignación de responsable

**Lógica:**
- Filtrar por sector o por persona
- Ordenar por prioridad/fecha
- Marcar como completada

### 4. Notas Equipo (`/notas`)

**Componentes:**
- Filtro por sector
- Lista de notas tipo feed
- Card con autor, contenido, sector, fecha

**Acciones:**
- FAB → Nueva nota
- Modal selector de sector
- Input de contenido
- Toggle notificar

### 5. Equipo (`/equipo`)

**Componentes:**
- Lista de miembros con rol
- Botón WhatsApp por cada uno
- Indicador de acceso a app

**Lógica:**
- Deep link a WhatsApp: `whatsapp://send?phone=56912345678`

### 6. Cronograma (`/cronograma`)

**Componentes:**
- Lista de sectores
- Badge de estado (Listo/Pausado/En obra)
- Solo admin puede editar

**Lógica:**
- Verificar rol para edición
- Toggle de estado por sector

---

## Patrones de Código

### Componente UI Base (Button)

```tsx
// components/ui/Button.tsx
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { cn } from '@/utils/cn';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  loading,
  disabled,
  onPress,
  children 
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        'rounded-lg items-center justify-center',
        {
          'bg-red-600': variant === 'primary',
          'bg-transparent border border-gray-300': variant === 'secondary',
          'bg-transparent': variant === 'ghost',
        },
        {
          'px-3 py-2': size === 'sm',
          'px-4 py-3': size === 'md',
          'px-6 py-4': size === 'lg',
        },
        disabled && 'opacity-50'
      )}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : '#666'} />
      ) : (
        <Text className={cn(
          'font-medium',
          variant === 'primary' && 'text-white',
          variant !== 'primary' && 'text-gray-700'
        )}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}
```

### Store con Zustand

```typescript
// stores/projectStore.ts
import { create } from 'zustand';
import { Project, Sector } from '@/types';

interface ProjectState {
  currentProject: Project | null;
  projects: Project[];
  setCurrentProject: (project: Project) => void;
  updateSectorStatus: (sectorId: string, status: Sector['status']) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentProject: null,
  projects: [],
  
  setCurrentProject: (project) => set({ currentProject: project }),
  
  updateSectorStatus: (sectorId, status) => set((state) => ({
    currentProject: state.currentProject ? {
      ...state.currentProject,
      sectors: state.currentProject.sectors.map((s) =>
        s.id === sectorId ? { ...s, status } : s
      ),
    } : null,
  })),
}));
```

### Hook Custom

```typescript
// hooks/useVisits.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProjectStore } from '@/stores/projectStore';
import { Visit } from '@/types';
import { api } from '@/services/api';

export function useVisits(month?: Date) {
  const { currentProject } = useProjectStore();
  
  return useQuery({
    queryKey: ['visits', currentProject?.id, month],
    queryFn: () => api.getVisits(currentProject!.id, month),
    enabled: !!currentProject,
  });
}

export function useCreateVisit() {
  const queryClient = useQueryClient();
  const { currentProject } = useProjectStore();
  
  return useMutation({
    mutationFn: (data: Omit<Visit, 'id' | 'createdAt'>) => 
      api.createVisit(currentProject!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
}
```

---

## Comandos de Desarrollo

```bash
# Instalación
npm install

# Desarrollo
npm run dev          # Web
npm run ios          # iOS simulator
npm run android      # Android emulator

# Build
npm run build

# Lint y formato
npm run lint
npm run format

# Tests
npm run test
```

---

## Notas Importantes

### Permisos por Rol

| Funcionalidad | Admin | Arquitecto | Constructor | Trabajador |
|---------------|-------|------------|-------------|------------|
| Ver todo | ✓ | ✓ | ✓ | ✓ |
| Crear visitas | ✓ | ✓ | ✓ | ✗ |
| Crear notas | ✓ | ✓ | ✓ | ✗ |
| Asignar tareas | ✓ | ✓ | ✓ | ✗ |
| Editar cronograma | ✓ | ✗ | ✗ | ✗ |
| Gestionar equipo | ✓ | ✗ | ✗ | ✗ |
| Ver presupuesto | ✓ | ✓ | ✓ | ✗ |

### Integración WhatsApp

```typescript
// utils/whatsapp.ts
import { Linking } from 'react-native';

export function openWhatsApp(phone: string, message?: string) {
  const cleanPhone = phone.replace(/\D/g, '');
  const url = message 
    ? `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
    : `whatsapp://send?phone=${cleanPhone}`;
  
  Linking.openURL(url);
}

export function shareVisitDetails(visit: Visit, team: TeamMember[]) {
  const message = `
📍 *Visita - ${visit.location}*
📅 ${formatDate(visit.date)}
⏰ ${visit.time}

Participantes: ${team.map(t => t.name).join(', ')}
  `.trim();
  
  openWhatsApp(team[0].phone!, message);
}
```

### Consideraciones Offline

Para una v2, considerar:
- Almacenamiento local con AsyncStorage o SQLite
- Sincronización cuando vuelva conexión
- Indicador de modo offline
- Cola de acciones pendientes

---

## Referencia de Diseño

Ver `design_system.md` para:
- Paleta de colores completa
- Tipografía y escalas
- Componentes visuales
- Iconografía
- Patrones de navegación

---

## Próximos Pasos Sugeridos

1. **Setup inicial**: Crear proyecto Expo/Next.js con Tailwind
2. **Componentes UI**: Implementar Button, Card, Badge, Input
3. **Layout**: Header, Drawer, Container
4. **Home**: Calendario y lista de sectores
5. **Visitas**: CRUD completo
6. **Notas**: Sistema de notas por sector
7. **Equipo**: Directorio con WhatsApp
8. **Cronograma**: Estados por sector
9. **Notificaciones**: Sistema push
10. **Auth**: Login y permisos por rol
