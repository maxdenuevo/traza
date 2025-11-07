# TRAZA - Frontend PWA

Progressive Web App para gestión de proyectos arquitectónicos, desarrollada con React + TypeScript + Vite.

## Estado del Proyecto

✅ **Fase 1 Completada - Estructura Base del PWA**

### Implementado

- ✅ React 18 + TypeScript + Vite
- ✅ Tailwind CSS con tema personalizado TRAZA
- ✅ React Router para navegación
- ✅ PWA configurado (Vite PWA Plugin)
- ✅ Estructura de carpetas completa
- ✅ TypeScript types según modelo de datos
- ✅ Componentes de layout (Header, BottomNav, Layout)
- ✅ 8 páginas principales (placeholders funcionales):
  - Visitas
  - Pendientes
  - Equipo
  - Documentos
  - Presupuesto
  - Permisos
  - Notas
  - Notificaciones

## Estructura del Proyecto

```
client/
├── public/                    # Assets estáticos y PWA icons
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── apple-touch-icon.png
│   └── icon.svg
├── src/
│   ├── components/
│   │   ├── common/           # Componentes reutilizables (por implementar)
│   │   ├── layout/           # Header, BottomNav, Layout ✅
│   │   └── features/         # Componentes específicos por módulo
│   ├── pages/                # Páginas principales ✅
│   │   ├── Visitas/
│   │   ├── Pendientes/
│   │   ├── Equipo/
│   │   ├── Documentos/
│   │   ├── Presupuesto/
│   │   ├── Permisos/
│   │   ├── Notas/
│   │   └── Notificaciones/
│   ├── hooks/                # Custom hooks
│   ├── services/             # API calls
│   ├── store/                # Zustand state management
│   ├── types/                # TypeScript definitions ✅
│   ├── constants/            # Constantes y helpers ✅
│   ├── utils/                # Funciones auxiliares
│   ├── App.tsx               # Router principal ✅
│   ├── main.tsx              # Entry point ✅
│   └── index.css             # Tailwind + estilos globales ✅
├── index.html                # HTML principal con PWA meta tags ✅
├── vite.config.ts            # Configuración Vite + PWA ✅
├── tailwind.config.js        # Tema TRAZA ✅
└── package.json
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo en http://localhost:5173

# Build
npm run build        # Genera build de producción
npm run preview      # Preview del build de producción

# Linting
npm run lint         # Ejecuta ESLint
```

## Características PWA

### Configuración

- **Manifest**: Generado automáticamente con Vite PWA
- **Service Worker**: Configurado con Workbox
- **Offline First**: Cache de assets estáticos
- **Runtime Caching**: API calls con NetworkFirst strategy
- **iOS Support**: Meta tags para Add to Home Screen

### Instalación

La app se puede instalar como PWA desde el navegador en:

- Chrome/Edge: Botón "Instalar" en la barra de direcciones
- Safari iOS: Compartir > Agregar a pantalla de inicio
- Android: Agregar a pantalla de inicio

## Tema y Estilos

### Colores TRAZA

```css
traza-gray:   #F5F5F5  /* Fondo principal */
traza-dark:   #1A1A1A  /* Texto principal */
traza-red:    #DC2626  /* Estado: Pausa/Bloqueado */
traza-yellow: #FCD34D  /* Estado: En obra */
traza-green:  #10B981  /* Estado: Terminado */
traza-blue:   #3B82F6  /* Primario/Activo */
```

### Filosofía de Diseño

- **Mobile-first**: Touch targets mínimo 44x44px
- **Sin zoom iOS**: Font-size mínimo 16px
- **Feedback visual**: Ripple effects, smooth transitions
- **Contraste alto**: Legibilidad en exteriores
- **Una mano**: Navegación inferior, botones accesibles

## Próximos Pasos (Fase 2)

### Componentes a Desarrollar

1. **Módulo Visitas** (Prioridad Alta)

   - [ ] Calendario interactivo con estados visuales
   - [ ] Crear/editar visitas
   - [ ] Áreas y asuntos colapsables
   - [ ] Conversión a pendientes
   - [ ] Historial de visitas

2. **Módulo Pendientes** (Prioridad Alta)

   - [ ] Organización por áreas (acordeón)
   - [ ] Estados visuales (cuadrados de colores)
   - [ ] Botón WhatsApp por tarea
   - [ ] Filtros y búsqueda
   - [ ] Vista por usuario

3. **Módulo Equipo**

   - [ ] Listado por categorías
   - [ ] Contador de pendientes
   - [ ] WhatsApp directo
   - [ ] Gestión de miembros

4. **Módulo Documentos**

   - [ ] Upload de archivos
   - [ ] Categorización
   - [ ] Preview de documentos
   - [ ] Búsqueda y filtros

5. **Módulo Presupuesto**

   - [ ] Resumen visual con barra de progreso
   - [ ] Desglose por categorías
   - [ ] Links a planillas externas
   - [ ] Notificaciones de cambios

6. **Módulo Permisos**

   - [ ] CRUD de permisos
   - [ ] Estados y alertas de vencimiento
   - [ ] Relación con documentos

7. **Módulo Notas**

   - [ ] Crear nota rápida
   - [ ] Historial
   - [ ] Convertir a pendiente

8. **Sistema de Notificaciones**
   - [ ] Lista de notificaciones
   - [ ] Badge con contador
   - [ ] Push notifications (PWA)
   - [ ] Navegación directa al elemento

### Estado y Backend

- [ ] Configurar React Query
- [ ] Configurar Zustand stores
- [ ] API services (conectar con backend)
- [ ] Autenticación (JWT)
- [ ] Sistema de permisos por rol

### Testing

- [ ] Unit tests (Vitest)
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] Testing offline (PWA)

## Desarrollo

### Agregar un nuevo módulo

1. Crear página en `src/pages/NombreModulo/index.tsx`
2. Agregar ruta en `src/App.tsx`
3. Agregar en `NAV_ITEMS` en `src/constants/index.ts`

### Convenciones

- Componentes: PascalCase
- Archivos: index.tsx para exports principales
- Estilos: Tailwind classes preferentemente
- Estados: Zustand stores en `src/store/`
- API: Services en `src/services/`

## Referencia

- [Documentación completa (CLAUDE.md)](../CLAUDE.md)
- [Vite PWA](https://vite-pwa-org.netlify.app/)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Última actualización**: Octubre 27, 2025
**Estado**: Base del PWA completada ✅
**Próximo milestone**: Implementar módulo Visitas completo
