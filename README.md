# ESANT MARIA

Libro de Obra Digital — aplicación web/PWA para gestión integral de proyectos de construcción.

## Funcionalidades

- **Libro de Obra**: Calendario de visitas, checkbox diario de verificación, control de asistencia
- **Pendientes**: Gestión de tareas por sector con ciclo de vida completo (por hacer → en progreso → pausada/completada/cancelada), pausas con motivo, adjuntos
- **Programa**: Estados por sector con fechas de inicio/entrega y badges de atraso
- **Equipo**: Directorio con roles (admin, jefe de proyecto, especialista, trabajador, subcontratado, cliente) y contacto WhatsApp
- **Materiales**: Inventario por sector con estado y vinculación a facturas
- **Presupuesto**: Resumen por categoría con items desplegables, montos estimados vs reales
- **Facturas**: Agrupadas por proveedor con detalle completo (IVA, RUT, sucursal)
- **Documentos**: Archivos y permisos de construcción (edificación, municipal)
- **Informes**: Generador con periodicidad configurable y exportación a PDF
- **Permisos por rol**: Control de acceso granular por tipo de usuario

## Stack

```
Frontend (PWA):
├── Vite 7 + React 19 + TypeScript
├── Tailwind CSS 3
├── Zustand (state management)
├── TanStack React Query (server state)
├── Lucide React (iconos)
├── React Router 7
└── Workbox (offline/PWA)

Backend:
└── Supabase (Auth, PostgreSQL, Storage)
```

## Desarrollo

```bash
cd client
npm install
npm run dev       # servidor de desarrollo
npm run build     # build de producción
npm run preview   # preview del build
npm run lint      # eslint
```

## Estructura del proyecto

```
client/src/
├── pages/           # Vistas principales (Visitas, Pendientes, Programa, etc.)
├── components/
│   ├── common/      # Button, Card, Modal, FAB, CurrencyInput, etc.
│   ├── layout/      # Header, Layout, Drawer
│   └── features/    # Calendar, DailyOperations, VisitaForm, attachments
├── hooks/           # React Query hooks por módulo
├── services/        # Capa de acceso a Supabase por entidad
├── store/           # Zustand stores (project, auth, programa)
├── types/           # TypeScript interfaces
├── constants/       # Sectores, roles, estados
└── utils/           # Formatters, dates, validators
```

## Usuarios y roles

| Rol              | Acceso                                                        |
| ---------------- | ------------------------------------------------------------- |
| Admin            | Control total                                                 |
| Jefe de Proyecto | Gestión de tiempos, recursos y equipo                         |
| Especialista     | Supervisión y ejecución (arquitecto, constructor, ingeniero)  |
| Trabajador       | Tareas asignadas (acceso limitado)                            |
| Subcontratado    | Pendientes asignados (paisajismo, mueblista, eléctrico, etc.) |
| Cliente          | Solo lectura de informes                                      |
