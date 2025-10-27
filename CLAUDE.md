# TRAZA - Sistema de Gestión de Proyectos Arquitectónicos

## Contexto del Proyecto

TRAZA es una plataforma web mobile-first diseñada para gestionar proyectos de arquitectura, facilitando la coordinación entre especialistas y la comunicación directa con el equipo. El objetivo es consolidar herramientas dispersas (Excel, WhatsApp, Drive, Email, papel) en una solución centralizada, simple y visual.

**Cliente:** Felipe Larraín (INVALS)  
**Fecha inicio:** Octubre 2025  
**Estado:** Fase de desarrollo - MVP  
**Última revisión de diseño:** Octubre 27, 2025

## Filosofía de Diseño

- **Simple y al grano:** Sin complejidad innecesaria
- **Mobile-first:** Diseñada para usar con una mano en obra
- **Visual:** Estados con colores claros, información accesible de un vistazo
- **Integrada:** WhatsApp nativo desde cada tarea, notificaciones inteligentes
- **Offline-capable:** Funciona sin conexión en terreno (PWA)
- **Flujo natural:** De visita → notas por área → pendientes → notificación automática

## Stack Tecnológico

### Frontend
```
- React 18 + TypeScript
- Tailwind CSS (diseño responsive)
- PWA (Progressive Web App)
- React Router (navegación)
- React Query (manejo de estado servidor)
- Zustand (estado local)
```

### Backend
```
- Node.js + Express
- PostgreSQL (base de datos)
- Prisma ORM
- JWT Authentication
- WhatsApp Business API (o links directos para MVP)
```

### Infraestructura
```
- Vercel (hosting frontend)
- Railway/Render (backend)
- Supabase (alternativa: DB + Auth + Storage)
- AWS S3 / Cloudinary (documentos e imágenes)
```

### DevOps
```
- GitHub (repositorio)
- GitHub Actions (CI/CD)
- ESLint + Prettier (linting)
- Vitest (testing)
```

## Arquitectura del Sistema

### Estructura de Carpetas

```
traza/
├── client/                 # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   │   ├── common/    # Botones, inputs, modales
│   │   │   ├── layout/    # Header, sidebar, navigation
│   │   │   └── features/  # Componentes específicos por feature
│   │   ├── pages/         # Vistas principales
│   │   │   ├── Visitas/
│   │   │   ├── Pendientes/
│   │   │   ├── Equipo/
│   │   │   ├── Documentos/
│   │   │   ├── Presupuesto/
│   │   │   ├── Permisos/
│   │   │   ├── Notas/
│   │   │   └── Notificaciones/
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Funciones auxiliares
│   │   ├── services/      # API calls
│   │   ├── store/         # Zustand stores
│   │   ├── types/         # TypeScript types
│   │   ├── constants/     # Constantes
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── server/                # Backend Node/Express
│   ├── src/
│   │   ├── controllers/   # Lógica de negocio
│   │   ├── routes/        # Endpoints API
│   │   ├── models/        # Modelos Prisma
│   │   ├── middleware/    # Auth, validación
│   │   ├── services/      # Servicios externos (WhatsApp, etc)
│   │   ├── utils/         # Helpers
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                # Código compartido (types, utils)
│   └── types/
│
└── docs/                  # Documentación
    ├── CLAUDE.md         # Este archivo
    ├── API.md            # Documentación API
    └── DEPLOYMENT.md     # Guía de despliegue
```

## Modelo de Datos

### Entidades Principales

```typescript
// User (Usuario)
{
  id: string
  email: string
  nombre: string
  rol: 'admin' | 'jefe_proyecto' | 'especialista' | 'cliente'
  telefono: string
  especialidad?: string  // Para especialistas
  avatar?: string
  proyectos: Proyecto[]
  createdAt: Date
  updatedAt: Date
}

// Proyecto
{
  id: string
  nombre: string
  cliente: string
  estado: 'planificacion' | 'en_obra' | 'pausado' | 'terminado'
  fechaInicio: Date
  fechaEstimadaFin?: Date
  direccion?: string
  descripcion?: string
  presupuestoTotal?: number
  usuarios: User[]  // Equipo del proyecto
  visitas: Visita[]
  pendientes: Pendiente[]
  documentos: Documento[]
  notas: Nota[]
  presupuestoItems: PresupuestoItem[]
  createdAt: Date
  updatedAt: Date
}

// Visita
{
  id: string
  proyectoId: string
  fecha: Date
  hora?: string  // Hora programada (ej: "10:00")
  estado: 'programada' | 'en_curso' | 'completada'
  notasGenerales?: string  // Notas generales de la visita
  asuntos: Asunto[]  // Temas por área
  creadoPor: string  // userId
  createdAt: Date
  updatedAt: Date
}

// Asunto (dentro de una visita) - Tarea específica de un área
{
  id: string
  visitaId: string
  area: string  // "Cocina", "Baño", "Sala de estar", etc
  descripcion: string
  encargadoId?: string  // Usuario asignado
  notasAdicionales?: string
  convertidoAPendiente: boolean
  pendienteId?: string
  createdAt: Date
}

// Pendiente (Tarea)
{
  id: string
  proyectoId: string
  area: string  // Área del proyecto
  tarea: string
  descripcion?: string
  encargadoId: string  // Usuario responsable
  estado: 'pausa' | 'en_obra' | 'terminado'
  prioridad?: 'baja' | 'media' | 'alta'
  fechaCreacion: Date
  fechaVencimiento?: Date
  fechaCompletado?: Date
  notasAdicionales?: string
  creadoPor: string
  visitaId?: string  // Si viene de una visita
  asuntoId?: string  // Si viene de un asunto de visita
  createdAt: Date
  updatedAt: Date
}

// Documento
{
  id: string
  proyectoId: string
  nombre: string
  tipo: 'pdf' | 'docx' | 'xlsx' | 'dwg' | 'jpg' | 'png' | 'otro'
  categoria: 'planos' | 'permisos' | 'anteproyecto' | 'presupuesto' | 'contratos' | 'fotos' | 'otro'
  url: string
  tamaño: number
  estado?: 'borrador' | 'revision' | 'aprobado' | 'vigente' | 'vencido'
  fechaAprobacion?: Date
  subioPor: string
  createdAt: Date
  updatedAt: Date
}

// Nota
{
  id: string
  proyectoId: string
  contenido: string
  area?: string  // Área opcional
  autorId: string
  convertidaAPendiente: boolean
  pendienteId?: string
  createdAt: Date
  updatedAt: Date
}

// Notificacion
{
  id: string
  usuarioId: string
  tipo: 'tarea_asignada' | 'tarea_actualizada' | 'visita_programada' | 'documento_subido' | 'presupuesto_actualizado' | 'mensaje'
  titulo: string
  mensaje: string
  leida: boolean
  metadata?: Record<string, any>  // Datos adicionales según tipo
  enlaceAccion?: string  // URL para ir directo al elemento relacionado
  createdAt: Date
}

// PresupuestoItem
{
  id: string
  proyectoId: string
  categoria: 'diseño' | 'construccion' | 'materiales' | 'mobiliario' | 'otro'
  descripcion: string
  montoEstimado: number
  montoReal?: number
  porcentajeEjecutado: number  // 0-100
  archivoUrl?: string  // Link a Excel externo
  notificaCambios: boolean  // Si debe notificar al actualizar
  ultimaActualizacion?: Date
  createdAt: Date
  updatedAt: Date
}

// Permiso
{
  id: string
  proyectoId: string
  nombre: string
  tipo: 'edificacion' | 'municipal' | 'recepcion_obra' | 'otro'
  estado: 'pendiente' | 'en_tramite' | 'aprobado' | 'vencido'
  fechaSolicitud?: Date
  fechaAprobacion?: Date
  fechaVencimiento?: Date
  vigenciaMeses?: number
  documentoId?: string  // Referencia a documento adjunto
  notas?: string
  createdAt: Date
  updatedAt: Date
}
```

## API Endpoints

### Autenticación
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh
```

### Proyectos
```
GET    /api/proyectos
GET    /api/proyectos/:id
POST   /api/proyectos
PUT    /api/proyectos/:id
DELETE /api/proyectos/:id
GET    /api/proyectos/:id/equipo
POST   /api/proyectos/:id/equipo
DELETE /api/proyectos/:id/equipo/:userId
GET    /api/proyectos/:id/resumen  # Resumen para vista principal
```

### Visitas
```
GET    /api/proyectos/:proyectoId/visitas
GET    /api/proyectos/:proyectoId/visitas/:id
POST   /api/proyectos/:proyectoId/visitas
PUT    /api/proyectos/:proyectoId/visitas/:id
DELETE /api/proyectos/:proyectoId/visitas/:id
POST   /api/proyectos/:proyectoId/visitas/:id/asuntos
PUT    /api/proyectos/:proyectoId/visitas/:visitaId/asuntos/:id
DELETE /api/proyectos/:proyectoId/visitas/:visitaId/asuntos/:id
POST   /api/proyectos/:proyectoId/visitas/:id/convertir-pendientes
GET    /api/proyectos/:proyectoId/visitas/proxima  # Próxima visita programada
```

### Pendientes
```
GET    /api/proyectos/:proyectoId/pendientes
GET    /api/proyectos/:proyectoId/pendientes/:id
POST   /api/proyectos/:proyectoId/pendientes
PUT    /api/proyectos/:proyectoId/pendientes/:id
DELETE /api/proyectos/:proyectoId/pendientes/:id
PATCH  /api/proyectos/:proyectoId/pendientes/:id/estado
GET    /api/proyectos/:proyectoId/pendientes/por-area  # Agrupados por área
GET    /api/usuarios/:userId/pendientes  # Pendientes del usuario
```

### Documentos
```
GET    /api/proyectos/:proyectoId/documentos
GET    /api/proyectos/:proyectoId/documentos/:id
POST   /api/proyectos/:proyectoId/documentos/upload
DELETE /api/proyectos/:proyectoId/documentos/:id
GET    /api/proyectos/:proyectoId/documentos/:id/download
GET    /api/proyectos/:proyectoId/documentos/por-categoria
```

### Notas
```
GET    /api/proyectos/:proyectoId/notas
POST   /api/proyectos/:proyectoId/notas
PUT    /api/proyectos/:proyectoId/notas/:id
DELETE /api/proyectos/:proyectoId/notas/:id
POST   /api/proyectos/:proyectoId/notas/:id/convertir-pendiente
```

### Notificaciones
```
GET    /api/notificaciones
GET    /api/notificaciones/no-leidas/count
PATCH  /api/notificaciones/:id/leer
PATCH  /api/notificaciones/leer-todas
DELETE /api/notificaciones/:id
```

### Presupuesto
```
GET    /api/proyectos/:proyectoId/presupuesto
GET    /api/proyectos/:proyectoId/presupuesto/resumen
POST   /api/proyectos/:proyectoId/presupuesto/items
PUT    /api/proyectos/:proyectoId/presupuesto/items/:id
DELETE /api/proyectos/:proyectoId/presupuesto/items/:id
POST   /api/proyectos/:proyectoId/presupuesto/items/:id/actualizar-planilla
```

### Permisos
```
GET    /api/proyectos/:proyectoId/permisos
GET    /api/proyectos/:proyectoId/permisos/:id
POST   /api/proyectos/:proyectoId/permisos
PUT    /api/proyectos/:proyectoId/permisos/:id
DELETE /api/proyectos/:proyectoId/permisos/:id
GET    /api/proyectos/:proyectoId/permisos/proximos-vencimientos
```

### WhatsApp (Integración)
```
POST   /api/whatsapp/send-message
POST   /api/whatsapp/notify-task
GET    /api/whatsapp/generate-link  # Genera link con mensaje pre-formateado
```

## Funcionalidades por Módulo

### 1. Visitas

**Objetivo:** Gestionar visitas a obra con calendario visual, notas organizadas por área y flujo directo a pendientes.

**Features principales:**
- **Calendario mensual** con estados visuales:
  - Verde: Visita completada
  - Rojo: Visita hoy
  - Amarillo: Próxima visita programada
- **Historial de visitas** colapsable con detalles
- **Visita actual en curso:**
  - Notas generales de la visita
  - Áreas visitadas (colapsables)
  - Por cada área: múltiples asuntos/tareas
  - Asignar encargado a cada asunto
  - Notas adicionales por asunto
- **Conversión automática a pendientes:**
  - Un clic convierte todos los asuntos en pendientes
  - Notificación automática a cada encargado
  - Mantiene relación visita → asunto → pendiente
- **Próxima visita programada** con fecha y hora

**Flujo clave validado con cliente:**
```
Usuario va a obra → Crea visita del día → 
Agrega áreas visitadas → Por cada área agrega asuntos → 
Asigna responsables → Convierte en pendientes → 
Sistema notifica automáticamente a cada encargado
```

**Detalles importantes:**
- Cada área puede tener múltiples asuntos
- Cada asunto puede tener descripción, encargado y notas
- El botón "Convertir en pendientes" crea todas las tareas de una vez
- Se mantiene el registro histórico de visitas para trazabilidad

### 2. Pendientes

**Objetivo:** Gestión visual de tareas organizadas por área con estados claros y contacto directo.

**Features principales:**
- **Organización por áreas colapsables:**
  - Sala de estar
  - Cocina
  - Hall entrada
  - Terraza
  - Baño
  - etc (áreas dinámicas según proyecto)
- **Estados visuales con indicadores cuadrados:**
  - Rojo: Pausa/Bloqueado
  - Amarillo: En obra/En proceso
  - Verde: Terminado
- **Información por tarea:**
  - Descripción de la tarea
  - Encargado (nombre y especialidad)
  - Notas adicionales
  - Estado visual
- **Acciones por tarea:**
  - Editar tarea
  - WhatsApp directo al encargado (con mensaje pre-formateado)
  - Cambiar estado
- **Vista por usuario:**
  - Cada usuario ve sus tareas asignadas
  - Contador de pendientes activos en el menú
- **Notificaciones automáticas:**
  - Al asignar tarea
  - Al cambiar estado
  - Al agregar notas

**Permisos según rol:**
- **Admin:** Ve y edita todo
- **Jefe proyecto:** Ve todo, edita pendientes, asigna tareas
- **Especialista:** Ve solo sus pendientes, actualiza estados
- **Cliente:** Ve avances (opcional, configurable)

**Importante para desarrollo:**
- WhatsApp debe abrir con mensaje pre-formateado: "Hola [Nombre], te escribo sobre la tarea: [Nombre Tarea]"
- Estados deben ser claros y no requieren explicación
- Notificación debe incluir link directo al pendiente

### 3. Equipo

**Objetivo:** Directorio del equipo con contacto directo vía WhatsApp y visibilidad de carga de trabajo.

**Features:**
- **Organización por categorías:**
  - Arquitectura
  - Construcción
  - Especialistas (paisajista, lighting, etc.)
- **Información por persona:**
  - Nombre completo
  - Rol/especialidad
  - Email
  - Teléfono
  - Contador de pendientes activos
- **Acciones:**
  - WhatsApp directo desde cada contacto
  - Ver pendientes de la persona (link directo)
  - Agregar/remover del proyecto (solo admin)
- **Badges visuales:**
  - Número de pendientes activos en rojo
  - Indica claramente quién tiene más carga

**Detalles importantes:**
- WhatsApp debe funcionar con un toque
- El contador de pendientes debe ser en tiempo real
- Cliente solicitó ver claramente quién tiene más tareas

### 4. Documentos

**Objetivo:** Repositorio centralizado categorizado con estados y fácil acceso.

**Features:**
- **Categorías principales:**
  - **Planos:** PDFs, DWG
  - **Permisos:** PDFs con estados (vigente, en trámite, vencido)
  - **Anteproyecto:** Documentos de diseño inicial
  - **Presupuestos:** Excel, PDFs
  - **Contratos**
  - **Fotos de obra**
- **Por cada documento:**
  - Nombre archivo
  - Fecha de actualización
  - Estado visual (según categoría)
  - Botón de descarga
- **Botón "Subir documento"** con categorización obligatoria
- **Control de versiones** (nice-to-have para MVP)

**Permisos:**
- Admin: Sube, elimina todo
- Jefe proyecto: Sube documentos
- Especialistas: Solo ven documentos relevantes
- Cliente: Ve solo lo compartido

### 5. Presupuesto / Gastos

**Objetivo:** Seguimiento de costos con resumen visual y planillas externas con notificaciones.

**Features principales:**
- **Tarjeta de resumen destacada:**
  - Presupuesto total (grande y visible)
  - Monto gastado
  - Monto disponible
  - Barra de progreso visual
  - Porcentaje ejecutado
- **Desglose por categorías:**
  - Diseño y Arquitectura
  - Constructor
  - Materiales
  - Mobiliario
  - Otros
- **Por cada categoría:**
  - Monto asignado
  - Barra de progreso individual
  - Link a planilla Excel externa (opcional)
- **Planillas de seguimiento:**
  - Materiales.xlsx
  - Paisajismo.xlsx
  - Iluminación.xlsx
  - etc.
- **Sistema de notificaciones:**
  - Cada planilla puede activar notificaciones
  - Al actualizar Excel, se notifica al equipo
  - Badge "Notifica cambios" visible

**Importante según cliente:**
- El resumen debe ser muy visual y claro
- Prioridad en la barra de progreso general
- Las planillas Excel son externas (Google Drive, Dropbox)
- Cliente quiere saber inmediatamente cuando hay cambios

### 6. Permisos

**Objetivo:** Tracking de permisos municipales con estados y alertas de vencimiento.

**Features:**
- **Listado de permisos:**
  - Permiso de Edificación
  - Permiso Municipal
  - Recepción de Obra
  - Otros permisos específicos
- **Por cada permiso:**
  - Nombre/tipo
  - Estado visual (Pendiente, En trámite, Aprobado, Vencido)
  - Fecha de solicitud
  - Fecha de aprobación
  - Vigencia (en meses)
  - Fecha de vencimiento
  - Notas
- **Estados con colores:**
  - Verde: Aprobado y vigente
  - Amarillo: En trámite
  - Gris: Pendiente
  - Rojo: Vencido (alerta)
- **Alertas automáticas:**
  - Notificación 30 días antes de vencimiento
  - Notificación al vencer

**Relación con Documentos:**
- Cada permiso puede tener documento adjunto
- Click en permiso lleva al documento asociado

### 7. Notas

**Objetivo:** Notas rápidas convertibles en pendientes con organización opcional por área.

**Features:**
- **Nueva nota rápida:**
  - Campo de texto amplio
  - Selector de área (opcional)
  - Botón "Guardar"
- **Historial de notas:**
  - Fecha y hora de creación
  - Área (si aplica)
  - Contenido de la nota
  - Botón "Convertir en pendiente"
- **Conversión a pendiente:**
  - Un clic abre modal con:
    - Descripción pre-cargada
    - Selector de encargado
    - Área (si la nota tiene área)
    - Notas adicionales
  - Al confirmar, crea el pendiente y notifica

**Diferencia con asuntos de visita:**
- Notas son más informales y rápidas
- No requieren estar en una visita
- Se pueden convertir después
- Útil para ideas sobre la marcha

### 8. Notificaciones

**Objetivo:** Sistema de alertas inteligente con tipos claros y enlaces directos.

**Tipos de notificaciones:**
- **Tarea asignada** (rojo): "Juan Pérez te asignó 'Pintar muro verde' en Sala de estar"
- **Tarea actualizada** (verde): "Roberto Muñoz completó 'Instalación eléctrica'"
- **Visita programada** (azul): "Próxima visita programada para el 20/07/25 a las 10:00"
- **Documento subido** (gris): "Se subió nuevo documento: Plano_v3.pdf"
- **Presupuesto actualizado** (amarillo): "Se actualizó la planilla Materiales.xlsx"

**Features:**
- **Badge con contador** en header (punto rojo si hay no leídas)
- **Lista de notificaciones:**
  - Icono según tipo
  - Título y mensaje
  - Tiempo relativo ("Hace 2 horas", "Ayer")
  - Color de fondo según tipo
- **Acciones:**
  - Click lleva directamente al elemento
  - Marcar como leída
  - "Marcar todas como leídas"
  - Eliminar notificación
- **Push notifications (PWA):**
  - Notificaciones en el dispositivo
  - Funcionan offline
  - Click abre la app en la sección correcta

**Reglas de notificación automática:**
1. Al asignar pendiente → notificar al encargado
2. Al cambiar estado de pendiente → notificar al creador
3. Al programar visita → notificar al equipo
4. Al subir documento → notificar según categoría
5. Al actualizar planilla presupuesto → notificar si está activado

## Consideraciones Técnicas

### PWA (Progressive Web App)

**Objetivo:** Funcionar offline en obra sin conexión.

**Implementación:**
```javascript
// service-worker.js
- Cache de assets estáticos (HTML, CSS, JS, imágenes)
- Cache de API responses con estrategia stale-while-revalidate
- Queue de acciones offline (crear pendiente, agregar nota)
- Sincronización background cuando vuelve conexión
```

**Manifest.json:**
```json
{
  "name": "TRAZA",
  "short_name": "TRAZA",
  "description": "Gestión de Proyectos Arquitectónicos",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1A1A1A",
  "background_color": "#F5F5F5",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Funcionalidad offline crítica:**
- Ver pendientes asignados
- Agregar notas
- Cambiar estado de tareas
- Ver calendario de visitas
- Ver equipo y contactos

### Autenticación

**Strategy:** JWT con refresh tokens

```typescript
// Login flow
1. Usuario envía email/password
2. Backend valida y genera:
   - accessToken (corta vida: 15min)
   - refreshToken (larga vida: 7 días)
3. Frontend guarda tokens en localStorage
4. Cada request incluye accessToken en header
5. Al expirar accessToken, usar refreshToken para renovar
6. Si refreshToken expira, requerir login
```

### Permisos y Roles

```typescript
const PERMISSIONS = {
  admin: {
    proyectos: ['read', 'create', 'update', 'delete'],
    pendientes: ['read', 'create', 'update', 'delete', 'assign'],
    documentos: ['read', 'upload', 'delete'],
    presupuesto: ['read', 'update'],
    permisos: ['read', 'create', 'update', 'delete'],
    equipo: ['read', 'add', 'remove'],
    visitas: ['read', 'create', 'update', 'delete'],
    notas: ['read', 'create', 'update', 'delete']
  },
  jefe_proyecto: {
    proyectos: ['read', 'update'],
    pendientes: ['read', 'create', 'update', 'assign'],
    documentos: ['read', 'upload'],
    presupuesto: ['read'],
    permisos: ['read'],
    equipo: ['read'],
    visitas: ['read', 'create', 'update'],
    notas: ['read', 'create', 'update']
  },
  especialista: {
    proyectos: ['read'],
    pendientes: ['read_own', 'update_own'],
    documentos: ['read'],
    presupuesto: null,
    permisos: null,
    equipo: ['read'],
    visitas: ['read'],
    notas: ['read']
  },
  cliente: {
    proyectos: ['read'],
    pendientes: ['read'],
    documentos: ['read'],
    presupuesto: ['read_summary'],
    permisos: ['read'],
    equipo: ['read'],
    visitas: ['read'],
    notas: null
  }
}
```

### Integración WhatsApp

**Decisión para MVP:** Links directos (opción 2)

**Implementación:**
```typescript
// Generar link con mensaje pre-formateado
const generateWhatsAppLink = (phoneNumber: string, taskName: string, userName: string) => {
  const message = `Hola ${userName}, te escribo sobre la tarea: ${taskName}`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}
```

**Ubicaciones donde aparece WhatsApp:**
1. **Pendientes:** Cada tarea tiene botón de WhatsApp
2. **Equipo:** Cada miembro tiene botón de WhatsApp
3. **Notificaciones:** Algunas notificaciones pueden incluir "Responder por WhatsApp"

**Flujo notificación + WhatsApp:**
```typescript
// Cuando se asigna pendiente:
1. Crear notificación in-app
2. Enviar push notification (si está habilitado)
3. Botón en notificación abre WhatsApp con mensaje pre-formateado
```

**Para fase 2 (WhatsApp Business API):**
- Envío automático de mensajes
- Confirmaciones de lectura
- Plantillas de mensajes aprobadas
- Costos: $X por mensaje

### Optimización Mobile

**Principios de diseño mobile-first:**
- Touch targets mínimo 44x44px
- Font-size mínimo 16px (evita zoom iOS)
- Sin hover states, solo :active
- Gestos intuitivos (swipe, long-press)
- Navegación con pulgar (bottom nav)
- Minimizar text input (usar selects, botones)
- Transiciones suaves pero rápidas (300ms)
- Feedback visual inmediato en todas las acciones

**Performance:**
```javascript
- Lazy loading de imágenes y componentes pesados
- Code splitting por ruta
- Virtualización de listas largas (react-window)
- Debounce en búsquedas (300ms)
- Optimistic UI updates (actualizar UI antes de respuesta)
- Compresión de imágenes automática
- Cache agresivo de datos estáticos
```

**Específico para obra:**
- Funcionar con una mano
- Botones grandes y espaciados
- Confirmaciones visuales claras
- Trabajar bien con guantes (touch más sensible)
- Contraste alto para ver en sol

## Testing

### Unit Tests
```
- Utils y helpers
- Componentes aislados
- Hooks personalizados
- Servicios API
- Validaciones de formulario
- Formateo de fechas/números
```

### Integration Tests
```
- Flujos completos por módulo
- API endpoints
- Autenticación y permisos
- Notificaciones
- Conversión visita → pendientes
```

### E2E Tests (Prioridad para MVP)
```
- Flujos críticos:
  1. Login y navegación básica
  2. Crear visita → agregar asuntos → convertir a pendientes
  3. Ver pendientes propios y cambiar estado
  4. Abrir WhatsApp desde tarea
  5. Subir documento
  6. Ver presupuesto
```

### Testing manual prioritario
```
- Funcionamiento offline (PWA)
- Notificaciones push
- WhatsApp en diferentes dispositivos
- Rendimiento en mobile 3G/4G
- Uso con una mano
- Estados visuales claros
```

## Deployment

### Environments

```
Development
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- DB: PostgreSQL local
- WhatsApp: Links directos (sin API)

Staging
- Frontend: traza-staging.vercel.app
- Backend: traza-api-staging.railway.app
- DB: PostgreSQL Railway
- Purpose: Testing con cliente

Production
- Frontend: traza.cl (custom domain)
- Backend: api.traza.cl
- DB: PostgreSQL producción (redundancia)
- CDN: Cloudflare
- Monitoring: Sentry + custom analytics
```

### Variables de Entorno

```bash
# Frontend (.env)
VITE_API_URL=https://api.traza.cl
VITE_WHATSAPP_ENABLED=true
VITE_SENTRY_DSN=
VITE_ENV=production

# Backend (.env)
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Storage
AWS_ACCESS_KEY=
AWS_SECRET_KEY=
AWS_BUCKET_NAME=traza-documents
AWS_REGION=us-east-1

# WhatsApp (opcional, fase 2)
WHATSAPP_API_KEY=
WHATSAPP_PHONE_ID=

# Email (opcional, fase 2)
SMTP_HOST=
SMTP_USER=
SMTP_PASS=

# Monitoring
SENTRY_DSN=
```

## Roadmap de Desarrollo

### Fase 1: MVP Core (6-8 semanas)

**Semanas 1-2: Setup y Base**
- [ ] Configuración repositorio monorepo
- [ ] Setup frontend (React + Tailwind + Vite)
- [ ] Setup backend (Express + Prisma + PostgreSQL)
- [ ] Diseño de DB schema completo
- [ ] Sistema de autenticación (JWT)
- [ ] Layout base con navegación lateral y bottom nav
- [ ] Componentes base (botones, inputs, cards)

**Semanas 3-4: Módulos Core (Parte 1)**
- [ ] Módulo Proyectos (CRUD básico, selección proyecto activo)
- [ ] Módulo Visitas:
  - [ ] Calendario visual con estados
  - [ ] Crear/editar visita
  - [ ] Agregar notas generales
  - [ ] Agregar áreas y asuntos
  - [ ] Historial de visitas
- [ ] Módulo Pendientes:
  - [ ] Vista por áreas (colapsable)
  - [ ] Estados visuales (rojo/amarillo/verde)
  - [ ] Crear/editar pendientes
  - [ ] Filtro por encargado

**Semanas 5-6: Módulos Core (Parte 2) y Conexiones**
- [ ] Conversión visita → pendientes (flow completo)
- [ ] Módulo Equipo:
  - [ ] Listado por categorías
  - [ ] Contactos con WhatsApp
  - [ ] Contador de pendientes
- [ ] Módulo Documentos:
  - [ ] Upload de archivos
  - [ ] Categorización
  - [ ] Listado y descarga
- [ ] Módulo Notas:
  - [ ] Crear nota rápida
  - [ ] Historial
  - [ ] Convertir a pendiente
- [ ] Sistema de notificaciones in-app

**Semanas 7-8: Presupuesto, Permisos y Polish**
- [ ] Módulo Presupuesto:
  - [ ] Resumen visual
  - [ ] Desglose por categorías
  - [ ] Planillas externas
- [ ] Módulo Permisos:
  - [ ] CRUD permisos
  - [ ] Estados y alertas
- [ ] PWA setup (manifest + service worker)
- [ ] Optimización mobile
- [ ] Testing básico
- [ ] Deploy staging
- [ ] Sesión de testing con cliente

### Fase 2: Refinamiento y Features Avanzadas (3-4 semanas)

- [ ] Mejoras UX basadas en feedback
- [ ] Sistema de permisos granular
- [ ] Notificaciones push (PWA)
- [ ] Búsqueda global
- [ ] Filtros avanzados en pendientes
- [ ] Exportar reportes (PDF)
- [ ] Multi-proyecto optimizado
- [ ] WhatsApp Business API (evaluación)
- [ ] Métricas y analytics
- [ ] Testing comprehensivo

### Fase 3: Producción y Monitoreo (2 semanas)

- [ ] Optimización de performance
- [ ] Load testing
- [ ] Security audit
- [ ] Documentación completa
- [ ] Video tutorials para usuarios
- [ ] Deploy producción
- [ ] Monitoreo y alertas (Sentry)
- [ ] Plan de soporte y mantenimiento

## Decisiones Técnicas y Pendientes

### Decisiones tomadas con cliente:

1. **WhatsApp:** Links directos para MVP, API Business para fase 2
2. **Presupuesto:** Planillas externas con notificaciones, no gestión integrada
3. **Estados visuales:** Cuadrados de colores (más claro que círculos)
4. **Flujo visitas:** Un solo botón convierte todos los asuntos en pendientes
5. **Notificaciones:** Automáticas al asignar, sin confirmación adicional
6. **Áreas:** Dinámicas por proyecto, no predefinidas
7. **Calendario:** Mensual es suficiente, no necesita vista semanal

### Por definir con cliente:

- [ ] ¿Límite de usuarios por proyecto?
- [ ] ¿Límite de proyectos simultáneos?
- [ ] ¿Qué usuarios pueden ver el presupuesto completo?
- [ ] ¿Necesitan fotos en las visitas? (subir directo desde móvil)
- [ ] ¿Notificaciones por email además de in-app?
- [ ] ¿Integraciones con Google Calendar para visitas?
- [ ] ¿Sistema de comentarios en documentos?
- [ ] ¿Versionado de planos/documentos?

### Decisiones técnicas pendientes:

- [ ] ¿Supabase vs Backend custom? → **Recomendación:** Backend custom por flexibilidad
- [ ] ¿Monorepo vs repos separados? → **Recomendación:** Monorepo con turborepo
- [ ] ¿Upload directo S3 vs through backend? → **Recomendación:** Through backend por control
- [ ] ¿WebSockets para notificaciones real-time vs polling? → **Recomendación:** Polling para MVP, WebSockets fase 2
- [ ] ¿React Query vs SWR? → **Recomendación:** React Query por features
- [ ] ¿Zustand vs Context API? → **Recomendación:** Zustand por performance

## Aprendizajes del Cliente (Octubre 27, 2025)

### Feedback visual de maqueta:

**Lo que más valoró:**
- Calendario muy visual y claro
- Estados con colores obvios (no necesita explicación)
- WhatsApp directo desde cada tarea
- Un solo botón para convertir todo en pendientes
- Presupuesto visual con barra de progreso

**Ajustes solicitados:**
- Los asuntos de visita deben poder tener múltiples tareas por área
- Necesita ver historial de visitas para referencia
- Contador de pendientes por persona es crítico
- Notificaciones deben ser imposibles de ignorar (badge rojo)
- Planillas Excel externas, no replicar en la app

**Prioridades confirmadas:**
1. Flujo visita → pendientes debe ser perfecto
2. WhatsApp debe funcionar sin fricciones
3. Todo debe ser obvio sin capacitación
4. Mobile first no es negociable
5. Offline capability es fundamental

### Casos de uso reales:

**Lunes - Visita a obra:**
```
1. Llega a obra, abre app
2. Crea visita del día
3. Recorre obra y va agregando áreas
4. Por cada área, anota asuntos/problemas
5. Asigna encargados en terreno
6. Al terminar, convierte todo en pendientes
7. Cada encargado recibe notificación
```

**Martes - Constructor revisa pendientes:**
```
1. Abre app, ve notificación roja
2. Entra a Pendientes, ve sus 4 tareas
3. Revisa detalles
4. Cambia estado de una a "En obra"
5. Necesita consultar algo, click en WhatsApp
6. Conversa directamente con arquitecto
```

**Viernes - Revisión de avances:**
```
1. Admin abre proyecto
2. Ve resumen de pendientes por estado
3. Revisa presupuesto ejecutado
4. Verifica que permisos estén vigentes
5. Programa próxima visita
6. Sistema notifica al equipo
```

## Referencias

- [Maqueta HTML v1](./traza-merged.html)
- [Maqueta HTML v2 (actualizada)](./traza-v2.html)
- [Diseños cliente PDF](./maqueta_Pipe.pdf)
- [Propuesta Comercial](./propuesta-comercial.pdf)
- [Minutas Reuniones](./minutas.md)
- [One Pager](./one-pager.md)

## Próximos Pasos

1. **Validar CLAUDE.md actualizado** con el equipo
2. **Refinar schema de base de datos** con nuevas entidades
3. **Crear wireframes de alta fidelidad** en Figma
4. **Definir API contracts** detallados
5. **Setup inicial del proyecto** (repositorio, CI/CD)
6. **Primera reunión con constructor** para validar flujo
7. **Sprint planning Fase 1**

---

**Última actualización:** Octubre 27, 2025 - Post revisión diseños cliente  
**Próxima revisión:** Setup proyecto (Semana 1 desarrollo)  
**Status:** ✅ Especificación completa lista para desarrollo