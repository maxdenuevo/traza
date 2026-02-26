# CLAUDE.md - ESANT MARIA

Instrucciones para implementar la aplicación móvil "ESANT MARIA" (EM) - Libro de Obra Digital para gestión de proyectos de construcción.

---

## Contexto del Proyecto

**ESANT MARIA** es una aplicación móvil para gestionar proyectos de construcción de manera integral. Permite coordinar visitas a obra, asignar y dar seguimiento a pendientes por sector, gestionar materiales, controlar presupuesto y gastos con facturas, registrar asistencia, realizar checkboxes diarios de verificación, y generar informes periódicos.

### Usuarios Principales

- **Admin**: Control total del sistema
- **Jefe de Proyecto**: Administra tiempos, recursos y equipo
- **Especialista**: Arquitecto, Constructor, Ingeniero - Supervisan y ejecutan
- **Trabajador**: Ejecuta tareas específicas (acceso limitado)
- **Subcontratado**: Proveedores externos (Paisajismo, Mueblista, Eléctrico, etc.)
- **Cliente**: Acceso solo lectura a informes

### Funcionalidades Core

1. Libro de Obra (Calendario de visitas + Checkbox + Asistencia)
2. Gestión de pendientes por sector (absorbe funcionalidad de Notas)
3. Programa de obra con fechas y estados
4. Directorio del equipo con contacto WhatsApp
5. Gestión de materiales por sector
6. Presupuesto, gastos y facturas por proveedor
7. Gestión de documentos y permisos
8. Generación de informes periódicos
9. Notificaciones de asignaciones y actualizaciones

---

## Arquitectura Técnica

### Stack Actual

```
Frontend Web/PWA (Implementado):
├── Vite + React 19
├── Tailwind CSS
├── Zustand (state management)
├── React Query (server state)
├── Sustand (backend)
├── Lucide React (iconos)
└── React Router

Backend:
└── Supabase (Auth, Database, Storage)
```

### Estructura de Carpetas

```
esant-maria/
├── client/
│   └── src/
│       ├── pages/                  # Screens / Pages
│       │   ├── Login.tsx
│       │   ├── Signup.tsx
│       │   ├── Visitas/            # Libro de Obra (Home)
│       │   │   └── index.tsx       # Calendario + Checkbox + Asistencia + Programa/Pendientes resumen
│       │   ├── Pendientes/
│       │   │   └── index.tsx       # Vista por sector/responsable + attachments
│       │   ├── Programa/
│       │   │   └── index.tsx       # Estados por sector + "Nueva nota" crea pendientes
│       │   ├── Equipo/
│       │   │   └── index.tsx       # Todos los roles + WhatsApp
│       │   ├── Materiales/
│       │   │   └── index.tsx       # CRUD completo
│       │   ├── Seguimiento/
│       │   │   └── index.tsx       # Seguimiento de Proyecto (dashboard por sector)
│       │   ├── Presupuesto/
│       │   │   └── index.tsx       # Presupuesto + Subcontratos + Adicionales
│       │   ├── Facturas/
│       │   │   └── index.tsx       # Agrupadas por proveedor
│       │   ├── Documentos/
│       │   │   └── index.tsx       # Archivos + permisos construcción
│       │   ├── Informes/
│       │   │   └── index.tsx       # Lista + Generador + Preview (sin ruta en router, acceso directo)
│       │   ├── Notificaciones/
│       │   │   └── index.tsx
│       │   └── Permisos/
│       │       └── index.tsx
│       │
│       ├── components/
│       │   ├── common/             # Componentes base reutilizables
│       │   │   ├── Button.tsx
│       │   │   ├── Card.tsx
│       │   │   ├── CurrencyInput.tsx   # Input moneda CLP (puntos de miles, prefijo $)
│       │   │   ├── StatusBadge.tsx
│       │   │   ├── Icon.tsx
│       │   │   ├── Modal.tsx
│       │   │   ├── FAB.tsx
│       │   │   ├── Tabs.tsx
│       │   │   ├── LoadingSpinner.tsx
│       │   │   ├── ProtectedRoute.tsx  # Control de acceso por rol
│       │   │   └── ErrorBoundary.tsx
│       │   │
│       │   ├── layout/
│       │   │   ├── Layout.tsx
│       │   │   ├── Header.tsx
│       │   │   └── Drawer.tsx         # Navegación plana (sin grupos colapsables)
│       │   │
│       │   └── features/
│       │       ├── Calendar.tsx
│       │       ├── CheckboxSection.tsx   # Sección colapsable de verificación diaria
│       │       ├── AsistenciaSection.tsx  # Sección colapsable de asistencia
│       │       ├── DailyOperations.tsx    # Legacy: Checkbox + Asistencia tabs
│       │       ├── VisitaForm.tsx
│       │       ├── VisitaHistorial.tsx
│       │       ├── AreaAsuntosList.tsx
│       │       ├── PauseLogModal.tsx
│       │       └── attachments/
│       │           └── AttachmentUploader.tsx
│       │
│       ├── hooks/
│       │   ├── useProyectos.ts
│       │   ├── usePendientes.ts
│       │   ├── useEquipo.ts
│       │   ├── useVisitas.ts
│       │   ├── useMateriales.ts
│       │   ├── useFacturas.ts
│       │   ├── useCheckbox.ts
│       │   ├── useAsistencia.ts
│       │   ├── useInformes.ts
│       │   ├── usePermisos.ts         # Permisos de construcción
│       │   ├── usePermissions.ts      # Control de acceso por rol
│       │   ├── useSeguimiento.ts
│       │   ├── useDocumentos.ts
│       │   └── useNotificaciones.ts
│       │
│       ├── store/
│       │   ├── useProjectStore.ts
│       │   ├── useAuthStore.ts
│       │   └── useProgramaStore.ts
│       │
│       ├── services/
│       │   ├── supabase.ts
│       │   ├── pendientes.ts
│       │   ├── visitas.ts
│       │   ├── materiales.ts
│       │   ├── facturas.ts
│       │   ├── checkbox.ts
│       │   ├── asistencia.ts
│       │   ├── informes.ts
│       │   ├── permisos.ts
│       │   ├── documentos.ts
│       │   ├── storage.ts
│       │   └── queryClient.ts
│       │
│       ├── types/
│       │   ├── project.ts
│       │   ├── task.ts
│       │   ├── team.ts
│       │   ├── programa.ts
│       │   ├── material.ts
│       │   ├── factura.ts
│       │   ├── checkbox.ts
│       │   ├── asistencia.ts
│       │   ├── informe.ts
│       │   └── index.ts
│       │
│       ├── utils/
│       │   ├── dates.ts
│       │   ├── formatters.ts
│       │   └── validators.ts
│       │
│       ├── constants/
│       │   ├── sectors.ts
│       │   ├── roles.ts
│       │   └── status.ts
│       │
│       └── styles/
│           ├── theme.ts
│           └── global.css
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
  status: "pendiente" | "en_curso" | "pausado" | "entregado" | "cancelado";
  pendingCount: number;
}

export const SECTORS = [
  "General",
  "Cocina",
  "Comedor",
  "Entrada",
  "Pieza principal",
  "Baño principal",
  "Pieza de servicio",
  "Baño de servicio",
  "Sala de estar",
  "Living",
  "Pieza niños",
  "Baño niños",
  "Jardín",
  "Patio servicio",
  "Baño de visitas",
  "Terraza",
] as const;

// types/programa.ts (ex cronograma)
export interface ProgramaSector {
  id: string;
  projectId: string;
  sectorId: string;
  fechaInicio: Date;
  fechaEntregaPropuesta: Date;
  fechaEntregaReal?: Date;
  obras: string;
  valorEstimado: number;
  valorActual?: number;
  status: "pendiente" | "en_curso" | "pausado" | "entregado" | "cancelado";
}

// types/task.ts (Pendientes - ahora incluye funcionalidad de Notas)
export interface PauseLog {
  id: string;
  taskId: string;
  pausedAt: Date;
  resumedAt?: Date;
  motivo?: string;
  pausedBy: string;
}

export interface Task {
  id: string;
  projectId: string;
  sectorId: string;
  title: string;
  description?: string;
  notas?: string; // Observaciones adicionales (funcionalidad ex-Notas)
  attachments?: string[]; // Fotos/documentos adjuntos
  assignedTo: string;
  assignedBy: string;
  status: "creada" | "en_progreso" | "pausada" | "completada" | "cancelada";
  pauseLogs: PauseLog[];
  dueDate?: Date;
  createdAt: Date;
  completedAt?: Date;
}

// types/team.ts
export interface TeamMember {
  id: string;
  name: string;
  role:
    | "admin"
    | "jefe_proyecto"
    | "especialista"
    | "trabajador"
    | "subcontratado"
    | "cliente";
  especialidad?: string; // Para subcontratados: Paisajismo, Mueblista, Eléctrico, etc.
  phone?: string;
  email?: string;
  rut?: string;
  hasAppAccess: boolean;
}

// types/material.ts
export interface Material {
  id: string;
  projectId: string;
  codigo: string;
  descripcion: string;
  marca: string;
  modelo: string;
  sucursal: string;
  cantidad: number;
  proveedor: string;
  ubicacion: string;
  facturaId?: string;
  sectorId: string;
  estado: "disponible" | "agotado" | "por_comprar";
}

// types/factura.ts
export interface Factura {
  id: string;
  projectId: string;
  numero: string;
  fecha: Date;
  valor: number;
  valorConIva: number;
  proveedor: string;
  pagadoPor: string;
  detalle: string;
  sucursal?: string;
  rut?: string;
  direccion?: string;
  archivo?: string; // URL del PDF/imagen
  sectorId: string;
}

// types/checkbox.ts
export interface CheckboxItem {
  id: string;
  projectId: string;
  sectorId: string;
  descripcion: string;
  periodicidad: "diario" | "semanal" | "quincenal" | "mensual";
}

export interface CheckboxCheck {
  id: string;
  itemId: string;
  fecha: Date;
  completado: boolean;
  checkedBy: string;
}

// types/asistencia.ts
export interface Asistencia {
  id: string;
  projectId: string;
  trabajadorId: string;
  fecha: Date;
  presente: boolean;
  registradoPor: string;
}

// types/informe.ts
export interface InformeContenido {
  resumen: string;
  pendientesCompletados: number;
  pendientesTotales: number;
  asistenciaPromedio: number;
  sectoresEstado: { sectorId: string; status: string }[];
  observaciones: string;
}

export interface Informe {
  id: string;
  projectId: string;
  numero: number;
  fecha: Date;
  periodicidad: "diario" | "semanal" | "quincenal" | "mensual";
  contenido: InformeContenido;
  generadoPor: string;
  archivoUrl?: string; // PDF exportado
}

// types/notification.ts
export interface Notification {
  id: string;
  type:
    | "task_assigned"
    | "task_completed"
    | "task_paused"
    | "budget_update"
    | "informe_generado";
  title: string;
  message: string;
  relatedId?: string;
  read: boolean;
  createdAt: Date;
}
```

---

## Estructura de Navegación

```
Drawer Menu (ESANT MARIA) — Lista plana, sin grupos colapsables:
├── Programa          → /programa
├── Pendientes        → /pendientes
├── Facturas          → /facturas
├── Seguimiento       → /seguimiento
├── Equipo            → /equipo
├── Materiales        → /materiales
├── Presupuesto       → /presupuesto
├── Documentos        → /documentos
├── ─────────────────
├── Cambiar proyecto
└── Cerrar Sesión

Home (Libro de Obra) — `/` — Contenido principal:
├── Título: nombre del proyecto
├── Fechas: Inicio de obra / Entrega propuesta
├── Calendario mensual (con indicadores de visitas)
├── CheckboxSection (colapsable)
├── AsistenciaSection (colapsable)
├── Programa resumen (sectores con StatusBadge, read-only → tap va a /programa)
├── Pendientes resumen (sectores con conteo → tap va a /pendientes?sector=X)
├── Próxima visita
├── Visita en curso (si existe)
└── Historial de visitas
```

---

## Guía de Implementación por Pantalla

### 1. Home - Libro de Obra (`/`)

**Componentes:**

- Card título con nombre del proyecto (no "Libro de Obra")
- Card fechas: "Inicio de obra" y "Entrega propuesta" (arriba del calendario)
- Calendario mensual con indicadores (sin legend "Programada", solo Realizada/Hoy/Próxima)
- `CheckboxSection` — sección colapsable de verificación diaria (siempre visible)
- `AsistenciaSection` — sección colapsable de asistencia (siempre visible)
- Programa resumen — sectores con StatusBadge (read-only, tap → /programa)
- Pendientes resumen — sectores con conteo de pendientes (tap → /pendientes?sector=X)
- Card próxima visita
- Card visita en curso (si hay una activa)
- Historial de visitas completadas

**Lógica:**

- Cargar proyecto activo
- Mostrar indicadores en calendario (visitas realizadas, hoy, próxima)
- Calcular pendientes por sector via `usePendientesByArea`
- Obtener estados de sectores via `useProgramaStore.getSectorStatus`
- `selectedDate` controla qué día muestra Checkbox y Asistencia

**Acciones:**

- Tap en día del calendario → actualiza `selectedDate` (Checkbox y Asistencia reflejan ese día)
- Tap en sector (Programa) → navega a /programa
- Tap en sector (Pendientes) → navega a /pendientes?sector=X
- FAB → Crear nueva visita (pre-selecciona fecha del calendario)

### 2. Pendientes (`/pendientes`)

**Componentes:**

- Toggle: Vista por Sector / Vista por Responsable
- Lista de tareas con status
- Campo de notas/observaciones por tarea (ex módulo Notas)
- Asignación de responsable
- Historial de pausas

**Lógica:**

- Filtrar por sector o por persona
- Ordenar por prioridad/fecha
- Ciclo de vida: creada → en_progreso → pausada/completada/cancelada
- Registrar motivo al pausar

**Acciones:**

- FAB → Nueva tarea
- Tap en tarea → Ver detalle con notas y pausas
- Swipe → Cambiar estado

### 3. Programa (`/programa`)

**Componentes:**

- Card fechas proyecto: "Inicio de obra" y "Entrega propuesta"
- Lista de sectores con StatusBadge (Pendiente/En curso/Pausado/Entregado/Cancelado)
- Indicador de atraso (badge rojo si fecha actual > fecha propuesta)
- Sector expandido muestra: estado + botón "Nueva nota" (+) + "Editar fechas" (solo admin)
- "Nueva nota" abre modal con textarea → crea pendiente automáticamente (`useCreatePendiente`)

**Lógica:**

- Verificar rol para edición de fechas (solo admin)
- Calcular días de atraso
- Toggle de estado por sector
- Al crear "nota": se crea un pendiente con `area: sectorName` y `tarea: textoNota`

### 4. Equipo (`/equipo`)

**Componentes:**

- Lista de miembros agrupados por rol
- Sección Subcontratados (rol, no módulo separado)
- Botón WhatsApp por cada uno
- Indicador de acceso a app

**Lógica:**

- Subcontratados tienen campo `especialidad` (Paisajismo, Mueblista, etc.)
- Deep link a WhatsApp: `whatsapp://send?phone=56912345678`

### 5. Materiales (`/materiales`)

**Componentes:**

- Lista de materiales por sector
- Card con: código, descripción, marca, modelo, cantidad
- Estado: disponible/agotado/por_comprar
- Vinculación a factura

**Acciones:**

- FAB → Nuevo material
- Filtros por sector, proveedor, estado
- Búsqueda por código/descripción

### 6. Presupuesto (`/presupuesto`)

**Componentes:**

- Título: "Presupuesto" (antes "Proyecto presupuestado")
- Sección 1: Presupuesto principal (categorías: servicio, mano_de_obra, materiales, diseño, construccion, mobiliario, otro)
- Sección 2: Valor subcontratos (categoría `subcontratos`)
- Sección 3: Adicionales al programa (categoría `adicionales`, incluye opción subcontratos en dropdown)
- Total Final = Presupuesto + Subcontratos + Adicionales
- Categorías expandibles con detalle de items individuales

**Acciones:**

- FAB → Nuevo item de presupuesto
- Categorías expandibles para ver detalle
- CurrencyInput para montos (formato CLP)

### 6b. Facturas (`/facturas`)

**Componentes:**

- Facturas agrupadas por proveedor
- Card con: número, fecha, valor, valor con IVA
- Detalle expandible con: sucursal, RUT, dirección
- Archivo adjunto (PDF/imagen)

**Acciones:**

- FAB → Nueva factura
- Filtro por proveedor
- Ver detalle completo

### 7. Checkbox Diario (integrado en Libro de Obra)

**Componentes:**

- Lista de items a verificar por día
- Checkbox con fecha y responsable
- Historial de verificaciones

**Lógica:**

- Items configurables por periodicidad (diario, semanal, quincenal, mensual)
- Registro de quién verificó y cuándo

### 8. Asistencia (integrado en Libro de Obra)

**Componentes:**

- Lista de trabajadores
- Toggle presente/ausente por día
- Resumen de asistencia

**Lógica:**

- Registro diario por trabajador
- Cálculo de promedio para informes

### 9. Seguimiento (`/seguimiento`)

**Componentes:**

- Título: "Seguimiento de Proyecto" (antes "Resumen del Proyecto")
- Fecha de entrega en header (desde `currentProject.fechaEstimadaFin`)
- Sectores expandibles con fechas inicio/entrega, progreso, pendientes

**Lógica:**

- Agrega datos de programa, pendientes, y materiales por sector
- Calcula progreso basado en pendientes completados vs totales

### 10. Informes (`/informes`) — Sin ruta en router (eliminada)

**Componentes:**

- Lista de informes generados
- Generador de informes con periodicidad
- Preview antes de generar
- Exportar a PDF

**Lógica:**

- Periodicidad: diario, semanal, quincenal, mensual
- Contenido automático: pendientes, asistencia, estado sectores
- Campo observaciones manual

---

## Patrones de Código

### Componente UI Base (Button)

```tsx
// components/ui/Button.tsx
import { cn } from "@/utils/cn";

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  disabled,
  onClick,
  children,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "rounded-lg flex items-center justify-center font-medium transition-colors",
        {
          "bg-red-600 text-white hover:bg-red-700": variant === "primary",
          "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50":
            variant === "secondary",
          "bg-transparent text-gray-700 hover:bg-gray-100": variant === "ghost",
        },
        {
          "px-3 py-2 text-sm": size === "sm",
          "px-4 py-3": size === "md",
          "px-6 py-4 text-lg": size === "lg",
        },
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      {loading ? <span className="animate-spin">...</span> : children}
    </button>
  );
}
```

### Store con Zustand

```typescript
// stores/projectStore.ts
import { create } from "zustand";
import { Project, Sector } from "@/types";

interface ProjectState {
  currentProject: Project | null;
  projects: Project[];
  setCurrentProject: (project: Project) => void;
  updateSectorStatus: (sectorId: string, status: Sector["status"]) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentProject: null,
  projects: [],

  setCurrentProject: (project) => set({ currentProject: project }),

  updateSectorStatus: (sectorId, status) =>
    set((state) => ({
      currentProject: state.currentProject
        ? {
            ...state.currentProject,
            sectors: state.currentProject.sectors.map((s) =>
              s.id === sectorId ? { ...s, status } : s,
            ),
          }
        : null,
    })),
}));
```

### Hook para Tareas con Pausas

```typescript
// hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProjectStore } from "@/stores/projectStore";
import { Task, PauseLog } from "@/types";
import { api } from "@/services/api";

export function useTasks(sectorId?: string) {
  const { currentProject } = useProjectStore();

  return useQuery({
    queryKey: ["tasks", currentProject?.id, sectorId],
    queryFn: () => api.getTasks(currentProject!.id, sectorId),
    enabled: !!currentProject,
  });
}

export function usePauseTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      motivo,
      pausedBy,
    }: {
      taskId: string;
      motivo?: string;
      pausedBy: string;
    }) => api.pauseTask(taskId, motivo, pausedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useResumeTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => api.resumeTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
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
npm run dev          # Web (Vite)

# Build
npm run build

# Preview
npm run preview

# Lint y formato
npm run lint
npm run format

# Tests
npm run test
```

---

## Permisos por Rol

| Módulo                    | Admin | Jefe Proyecto | Especialista | Trabajador | Subcontratado | Cliente |
| ------------------------- | ----- | ------------- | ------------ | ---------- | ------------- | ------- |
| Ver todo                  | ✓     | ✓             | ✓            | Limitado   | Limitado      | -       |
| Libro de Obra             | ✓     | ✓             | ✓            | ✓          | -             | -       |
| Calendario/Checkbox       | ✓     | ✓             | ✓            | ✓          | -             | -       |
| Asistencia                | ✓     | ✓             | ✓            | -          | -             | -       |
| Pendientes (ver)          | ✓     | ✓             | ✓            | ✓          | ✓             | -       |
| Pendientes (crear/editar) | ✓     | ✓             | ✓            | -          | -             | -       |
| Programa (ver)            | ✓     | ✓             | ✓            | -          | -             | -       |
| Programa (editar)         | ✓     | -             | -            | -          | -             | -       |
| Equipo (ver)              | ✓     | ✓             | ✓            | ✓          | ✓             | -       |
| Equipo (gestionar)        | ✓     | ✓             | -            | -          | -             | -       |
| Materiales                | ✓     | ✓             | ✓            | -          | -             | -       |
| Presupuesto/Gastos        | ✓     | ✓             | ✓            | -          | -             | -       |
| Facturas                  | ✓     | ✓             | ✓            | -          | -             | -       |
| Documentos                | ✓     | ✓             | ✓            | -          | -             | -       |
| Informes (ver)            | ✓     | ✓             | -            | -          | -             | ✓       |
| Informes (generar)        | ✓     | -             | -            | -          | -             | -       |

---

## Integración WhatsApp

```typescript
// utils/whatsapp.ts
export function openWhatsApp(phone: string, message?: string) {
  const cleanPhone = phone.replace(/\D/g, "");
  const url = message
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${cleanPhone}`;

  window.open(url, "_blank");
}

export function shareTaskDetails(task: Task, assignee: TeamMember) {
  const message = `
*ESANT MARIA - Tarea Asignada*
📋 ${task.title}
📍 Sector: ${task.sectorId}
📅 Fecha límite: ${task.dueDate ? formatDate(task.dueDate) : "Sin fecha"}

${task.description || ""}
  `.trim();

  openWhatsApp(assignee.phone!, message);
}
```

---

## Paleta de Colores

Solo usar estos colores:

```css
/* Rojo - Primary */
--red-600: #dc2626;
--red-700: #b91c1c;

/* Grises */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;

/* Negro */
--black: #000000;

/* Blanco */
--white: #ffffff;
```

---

## Backlog - Estado de Sprints

### Sprint 1 - Crítico ✅ COMPLETADO

1. ✅ Fix botón retroceder (navegación)
2. ✅ Renombrar a ESANT MARIA / EM en toda la app
3. ✅ Renombrar módulos (Cronograma → Programa)
4. ✅ Fusionar Notas con Pendientes (eliminar módulo Notas)
5. ✅ FAB contextual según pantalla
6. ✅ Aplicar paleta: solo gris, rojo, negro
7. ✅ Deploy a producción

### Sprint 2 - Core ✅ COMPLETADO

1. ✅ Estado "Pausado" con log de pausas (motivo, fecha, responsable)
2. ✅ Fechas en Programa + badge atraso (rojo si atrasado)
3. ✅ Ciclo de vida de tareas completo (creada → en_progreso → pausada/completada/cancelada)
4. ✅ Reestructurar navegación según maqueta (Drawer)

### Sprint 3 - Módulos Nuevos ✅ COMPLETADO

1. ✅ Módulo Materiales (CRUD completo) - `pages/Materiales`, `services/materiales.ts`
2. ✅ Vista Seguimiento por sector - `pages/Seguimiento`, `hooks/useSeguimiento.ts`
3. ✅ Subir fotos/documentos a tareas - `services/storage.ts`, `components/features/attachments/`

### Sprint 4 - Presupuesto ✅ COMPLETADO

1. ✅ Facturas agrupadas por proveedor - `pages/Facturas`, `services/facturas.ts`
2. ✅ Detalle factura completo (número, fecha, valor, IVA, sucursal, RUT, dirección)
3. ✅ Rol 'subcontratado' y 'trabajador' en Equipo (con campo especialidad)

### Sprint 5 - Operaciones ✅ COMPLETADO

1. ✅ Checkbox diario integrado al calendario - `services/checkbox.ts`, `hooks/useCheckbox.ts`
2. ✅ Asistencia integrada al calendario - `services/asistencia.ts`, `hooks/useAsistencia.ts`
3. ✅ Permisos por rol implementados - `hooks/usePermissions.ts`, `components/common/ProtectedRoute.tsx`
4. ✅ DailyOperations component con tabs Verificación/Asistencia

### Sprint 6 - Informes ✅ COMPLETADO

1. ✅ Generador de informes - `pages/Informes`, `services/informes.ts`
2. ✅ Periodicidad configurable (diario, semanal, quincenal, mensual)
3. ✅ Exportar a PDF (genera HTML estilizado)
4. ✅ Acceso cliente solo a informes (via sistema de permisos)
5. ✅ Vista previa antes de generar

### Sprint 7 - Post-Reunión MVP (Feb 2026) ✅ COMPLETADO

1. ✅ Header tappable para volver al calendario (tap título "ESANT MARIA" → Home)
2. ✅ VisitaForm pre-selecciona fecha del calendario al crear visita desde FAB
3. ✅ FAB agregado a Programa (admin), Presupuesto, Documentos, Equipo
4. ✅ Facturas movido al grupo "Libro de Obra" en Drawer (con ícono receipt)
5. ✅ Presupuesto: categorías expandibles con detalle de items individuales
6. ✅ CurrencyInput component (formato chileno con puntos de miles y prefijo $)
7. ✅ CurrencyInput aplicado en: Presupuesto, Facturas, Programa, ProjectFormModal
8. ✅ Renombrar estado "Creada" → "Por hacer" en pendientes (UX más claro)
9. ✅ Calendario: visitas realizadas cambian de verde a gris (consistencia paleta)
10. ✅ Fix servicios update (presupuesto, visitas, pendientes) - solo enviar campos definidos
11. ✅ ProjectFormModal responsive para pantallas pequeñas (header fijo, form scrollable)
12. ✅ Limpieza: eliminados mockups/ y app.pdf

---

## Referencia de Diseño

Ver `design_system.md` para:

- Paleta de colores completa
- Tipografía y escalas
- Componentes visuales
- Iconografía
- Patrones de navegación

---

## Estado Actual del Proyecto

- **MVP entregado al cliente** (iPhone 13 mini, PWA instalada) — 2026-02-19
- **Correcciones del cliente aplicadas** — 2026-02-25 (Sprint 8)
- **100% implementado** del MVP (Sprints 1-8 completados)
- **Stack actual**: Vite + React 19 + Tailwind + Zustand + React Query + Supabase
- **Módulos implementados**:
  - ✅ Libro de Obra (Visitas + Calendario + CheckboxSection + AsistenciaSection + resúmenes Programa/Pendientes)
  - ✅ Pendientes (con pausas, attachments, ciclo de vida completo)
  - ✅ Programa (estados por sector + "Nueva nota" crea pendientes)
  - ✅ Equipo (todos los roles incluyendo subcontratado/trabajador)
  - ✅ Materiales (CRUD completo por sector)
  - ✅ Seguimiento de Proyecto (dashboard por sector con fecha de entrega)
  - ✅ Facturas (agrupadas por proveedor)
  - ✅ Presupuesto (Presupuesto + Subcontratos + Adicionales)
  - ✅ Documentos (archivos y permisos de construcción)
  - ✅ Checkbox diario (verificación con periodicidad, sección colapsable independiente)
  - ✅ Asistencia (control de trabajadores, sección colapsable independiente)
  - ✅ Informes (generador con preview y export — sin ruta en router)
  - ✅ Sistema de permisos por rol
  - ✅ Drawer plano (sin grupos colapsables, sin Informes ni Calendario)

### Archivos Clave Implementados

```
services/
├── asistencia.ts      # Control de asistencia
├── checkbox.ts        # Verificación diaria
├── facturas.ts        # Facturas por proveedor
├── informes.ts        # Generación de informes
├── materiales.ts      # Inventario de materiales
├── permisos.ts        # Permisos de construcción (edificación, municipal)
├── storage.ts         # Upload de archivos
└── ...

hooks/
├── useAsistencia.ts   # React Query para asistencia
├── useCheckbox.ts     # React Query para checkbox
├── useFacturas.ts     # React Query para facturas
├── useInformes.ts     # React Query para informes
├── useMateriales.ts   # React Query para materiales
├── usePermisos.ts     # React Query para permisos construcción
├── usePermissions.ts  # Control de acceso por rol de usuario
├── useSeguimiento.ts  # Agregación de datos por sector
└── ...

pages/
├── Facturas/          # CRUD facturas
├── Informes/          # Generador y lista
├── Materiales/        # CRUD materiales
├── Seguimiento/       # Dashboard por sector
└── ...

components/
├── common/CurrencyInput.tsx      # Input moneda CLP (formato con puntos de miles)
├── common/ProtectedRoute.tsx     # Protección de rutas
├── features/CheckboxSection.tsx  # Sección colapsable de verificación diaria
├── features/AsistenciaSection.tsx # Sección colapsable de asistencia
├── features/DailyOperations.tsx  # Legacy: Checkbox + Asistencia tabs
├── layout/Drawer.tsx             # Navegación plana (sin grupos)
└── features/attachments/         # Upload de archivos
```

### Base de Datos

La migración SQL ha sido ejecutada exitosamente:

- **Archivo**: `supabase/migrations/20260129_esant_maria_v2.sql`
- **Estado**: ✅ Aplicada en producción

Tablas creadas:

- `programa_sectores` - Estados por sector
- `pause_logs` - Historial de pausas
- `materiales` - Inventario
- `facturas` - Facturas por proveedor
- `checkbox_items` / `checkbox_checks` - Verificación diaria
- `asistencia` - Control de trabajadores
- `informes` - Reportes generados

### Limpieza de Código

Enero 2026:
- `components/layout/BottomNav.tsx` - Reemplazado por Drawer
- `data/mockData.ts` - No utilizado
- `components/ProtectedRoute.tsx` - Consolidado en `common/`
- Tipos duplicados: `PendienteEstadoV2`, `PauseLog` (ya existe `PendientePauseLog`)

Febrero 2026:
- `mockups/index.html` y `mockups/traza-v2.html` - Mockups obsoletos
- `app.pdf` - Documento obsoleto
- Ruta `/informes` eliminada del router (página existe pero sin ruta)
- Drawer: eliminados grupos colapsables (`DRAWER_NAV_GROUPS` → `DRAWER_NAV_ITEMS` plano)
- `DailyOperations.tsx` — Legacy, reemplazado por `CheckboxSection` y `AsistenciaSection` independientes

### Branding (Enero 2026)

Favicons actualizados con branding "EM":

- `public/favicon.ico` - Favicon clásico
- `public/favicon-16x16.png` - Favicon pequeño
- `public/favicon-32x32.png` - Favicon mediano
- `public/icon-192.png` - Icono PWA 192px
- `public/icon-512.png` - Icono PWA 512px
- `public/apple-touch-icon.png` - Icono Apple

Archivos eliminados:

- `public/icon.svg` - Reemplazado por favicon.ico
- `public/vite.svg` - No utilizado

### Reunión 2026-02-19

Creamos nuevo perfil de Jefe de Obra para Felipe

Feedback resuelto (Sprint 7):
- ✅ Vuelta al calendario más clara: header tappable → Home
- ✅ FAB mantiene fecha seleccionada al crear visita
- ✅ FAB agregado a Programa, Presupuesto, Documentos, Equipo
- ✅ Presupuesto: items desplegables por categoría
- ✅ Ícono facturas en Drawer
- ✅ "Creada" renombrado a "Por hacer"
- ✅ Fix "Error al guardar" en servicios update (presupuesto, visitas, pendientes)
- ✅ ProjectFormModal responsive para iPhone 13 mini
- ✅ Drawer orden: Calendario → Programa → Pendientes → Facturas

### Correcciones del cliente 2026-02-25 (Sprint 8)

Feedback del cliente (Felipe) post-MVP implementado:

**C1 — Home (Libro de Obra):**
- ✅ Título muestra nombre del proyecto (no "Libro de Obra")
- ✅ Fechas "Inicio de obra" y "Entrega propuesta" arriba del calendario
- ✅ Legend del calendario sin "Programada"
- ✅ Checkbox y Asistencia como secciones colapsables independientes (nuevos componentes `CheckboxSection`, `AsistenciaSection`)
- ✅ Resumen de Programa (sectores con StatusBadge) y Pendientes (sectores con conteo)

**C2 — Programa:**
- ✅ Vista expandida simplificada: solo estado + botón "Nueva nota" (+)
- ✅ "Nueva nota" crea pendiente automáticamente (`useCreatePendiente`)
- ✅ Home muestra resumen visual de Programa y Pendientes; Drawer va a páginas standalone

**C3 — Drawer:**
- ✅ Navegación aplanada (sin grupos colapsables)
- ✅ Orden: Programa → Pendientes → Facturas → Seguimiento → Equipo → Materiales → Presupuesto → Documentos
- ✅ Eliminados: Informes, Calendario del drawer

**C4 — Seguimiento:**
- ✅ Renombrado "Resumen del Proyecto" → "Seguimiento de Proyecto"
- ✅ Fecha de entrega en header

**C5 — Presupuesto:**
- ✅ Renombrado "Proyecto presupuestado" → "Presupuesto"
- ✅ Nueva sección "Valor subcontratos" (posición 2)
- ✅ Orden: Presupuesto → Subcontratos → Adicionales
- ✅ Tipo `PresupuestoCategoria` extendido con `'subcontratos'`

**Archivos creados:**
- `components/features/CheckboxSection.tsx`
- `components/features/AsistenciaSection.tsx`

**Archivos modificados:**
- `types/index.ts`, `constants/index.ts`, `components/features/Calendar.tsx`
- `components/layout/Drawer.tsx`, `App.tsx`
- `pages/Visitas/index.tsx`, `pages/Programa/index.tsx`
- `pages/Seguimiento/index.tsx`, `pages/Presupuesto/index.tsx`

---

## Backlog Consolidado

### Sprint 8 — Correcciones del cliente (Maqueta 2026-02-25) ✅ COMPLETADO

1. ✅ Home: título muestra nombre del proyecto, fechas arriba del calendario
2. ✅ Home: Checkbox y Asistencia como secciones colapsables independientes (CheckboxSection, AsistenciaSection)
3. ✅ Home: resumen Programa (sectores con StatusBadge) y Pendientes (sectores con conteo)
4. ✅ Calendario: eliminado legend "Programada" (solo Realizada, Hoy, Próxima)
5. ✅ Drawer aplanado: lista plana sin grupos colapsables, sin Informes ni Calendario
6. ✅ Programa: vista expandida simplificada (estado + "Nueva nota" crea pendiente)
7. ✅ Seguimiento: renombrado a "Seguimiento de Proyecto", fecha de entrega en header
8. ✅ Presupuesto: renombrado a "Presupuesto", nueva sección "Valor subcontratos", orden Presupuesto → Subcontratos → Adicionales
9. ✅ Tipo `PresupuestoCategoria`: agregado `'subcontratos'`
10. ✅ Ruta `/informes` eliminada del router

### Sprint 9 — QA y pulido (pendiente)

1. QA completo a todos los endpoints (materiales update/delete reportaban "Error al guardar")
2. Optimización responsive para iPhone 13 mini (revisar post-feedback del cliente)
3. Empty states mejorados cuando no hay datos en un proyecto

### v2 — Roadmap futuro

1. Notificaciones push
2. Modo offline completo (IndexedDB + sync en background + indicador offline + cola de acciones)
3. App nativa con Capacitor
4. Exportación real a PDF en informes
