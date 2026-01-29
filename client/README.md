# ESANT MARIA - Libro de Obra Digital

Progressive Web App para gestión integral de proyectos de construcción.

## Estado del Proyecto

**100% MVP Completado** - Sprints 1-6 finalizados

## Stack Tecnológico

```
Frontend:
├── Vite + React 19
├── TypeScript
├── Tailwind CSS
├── Zustand (state management)
├── React Query / TanStack Query
├── React Router
└── Lucide React (iconos)

Backend:
└── Supabase (Auth, Database, Storage, RLS)
```

## Módulos Implementados

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| Libro de Obra | Calendario + Visitas + DailyOperations | ✅ |
| Pendientes | Tareas con pausas, attachments, ciclo de vida | ✅ |
| Programa | Estados por sector con fechas y alertas | ✅ |
| Equipo | Todos los roles + WhatsApp | ✅ |
| Materiales | CRUD completo por sector | ✅ |
| Seguimiento | Dashboard por sector | ✅ |
| Facturas | Agrupadas por proveedor | ✅ |
| Presupuesto | Resumen y adicionales | ✅ |
| Documentos | Archivos + permisos de construcción | ✅ |
| Checkbox | Verificación diaria con periodicidad | ✅ |
| Asistencia | Control de trabajadores | ✅ |
| Informes | Generador con preview y export PDF | ✅ |
| Permisos | Control de acceso por rol | ✅ |

## Roles de Usuario

- **Admin**: Control total del sistema
- **Jefe de Proyecto**: Administra tiempos, recursos y equipo
- **Especialista**: Arquitecto, Constructor, Ingeniero
- **Trabajador**: Ejecuta tareas (acceso limitado)
- **Subcontratado**: Proveedores externos
- **Cliente**: Acceso solo lectura a informes

## Estructura del Proyecto

```
client/src/
├── pages/              # Páginas principales
│   ├── Visitas/        # Libro de Obra (Home)
│   ├── Pendientes/     # Gestión de tareas
│   ├── Programa/       # Estados por sector
│   ├── Equipo/         # Directorio del equipo
│   ├── Materiales/     # Inventario
│   ├── Seguimiento/    # Dashboard por sector
│   ├── Facturas/       # Por proveedor
│   ├── Presupuesto/    # Resumen financiero
│   ├── Documentos/     # Archivos y permisos
│   ├── Informes/       # Generador de reportes
│   ├── Permisos/       # Permisos de construcción
│   └── Notificaciones/
│
├── components/
│   ├── common/         # Button, Card, Modal, FAB, etc.
│   ├── layout/         # Layout, Header, Drawer
│   └── features/       # Calendar, DailyOperations, etc.
│
├── hooks/              # React Query hooks
├── services/           # API calls a Supabase
├── store/              # Zustand stores
├── types/              # TypeScript definitions
└── constants/          # Sectores, roles, status
```

## Scripts

```bash
# Desarrollo
npm run dev          # http://localhost:5173

# Build
npm run build        # Genera build de producción
npm run preview      # Preview del build

# Calidad
npm run lint         # ESLint
```

## PWA Features

- Service Worker con Workbox
- Offline First para assets estáticos
- Runtime Caching para API
- Instalable en iOS, Android y Desktop

## Paleta de Colores

```css
/* Primary */
--esant-red-600: #DC2626;
--esant-red-700: #B91C1C;

/* Grays */
--esant-gray-50 a --esant-gray-900

/* Blanco y Negro */
--white: #FFFFFF;
--black: #000000;
```

## Base de Datos

La migración SQL se encuentra en:
```
supabase/migrations/20260129_esant_maria_v2.sql
```

Incluye tablas para:
- programa_sectores
- pause_logs
- materiales
- facturas
- checkbox_items / checkbox_checks
- asistencia
- informes

## Próximos Pasos (v2)

- [ ] Notificaciones push
- [ ] Modo offline con IndexedDB
- [ ] Sincronización en background
- [ ] App nativa con Capacitor

## Referencias

- [Documentación completa](../CLAUDE.md)
- [Design System](../design_system.md)

---

**Última actualización**: Enero 29, 2026
**Estado**: MVP 100% completado
