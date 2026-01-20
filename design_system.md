# Design System - Libro de Obra

Sistema de diseño para la aplicación móvil de gestión de obras de construcción.

## Filosofía de Diseño

Estética **funcional y profesional** orientada al sector construcción. Prioriza la claridad, la jerarquía visual y la eficiencia en el uso. Diseño mobile-first con navegación intuitiva.

---

## Paleta de Colores

### Colores Primarios

```css
:root {
  /* Base */
  --color-black: #1A1A1A;
  --color-white: #FFFFFF;
  --color-background: #F5F5F5;
  
  /* Acento */
  --color-primary: #E53935;      /* Rojo - acciones principales */
  --color-primary-dark: #C62828;
  
  /* Grises */
  --color-gray-100: #F7F7F7;
  --color-gray-200: #EEEEEE;
  --color-gray-300: #E0E0E0;
  --color-gray-400: #BDBDBD;
  --color-gray-500: #9E9E9E;
  --color-gray-600: #757575;
  --color-gray-700: #616161;
  --color-gray-800: #424242;
  --color-gray-900: #212121;
}
```

### Colores Semánticos

```css
:root {
  /* Estados */
  --color-success: #4CAF50;      /* Verde - Listo */
  --color-warning: #9E9E9E;      /* Gris - Pausado */
  --color-error: #E53935;        /* Rojo - Urgente/En obra */
  --color-info: #2196F3;

  /* Badges de estado */
  --badge-listo: #4CAF50;
  --badge-pausado: #9E9E9E;      /* Gris - indica detenido/en espera */
  --badge-en-obra: #E53935;
}
```

---

## Tipografía

### Familia Tipográfica

```css
:root {
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: 'Inter', sans-serif;
}
```

### Escala Tipográfica

```css
:root {
  /* Tamaños */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  
  /* Pesos */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Line heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
}
```

### Uso Tipográfico

| Elemento | Tamaño | Peso | Color |
|----------|--------|------|-------|
| Título proyecto | text-xl | bold | black |
| Título sección | text-lg | semibold | gray-900 |
| Subtítulo | text-base | medium | gray-700 |
| Cuerpo | text-sm | normal | gray-600 |
| Caption/meta | text-xs | normal | gray-500 |
| Badge | text-xs | medium | white |

---

## Espaciado

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
}
```

---

## Bordes y Esquinas

```css
:root {
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
  
  --border-width: 1px;
  --border-color: var(--color-gray-200);
}
```

---

## Sombras

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.08);
}
```

---

## Componentes Base

### Header

```
┌─────────────────────────────────────┐
│ ☰        AGUA DEL PALO         🔔  │
└─────────────────────────────────────┘
```

- Altura: 56px
- Fondo: white
- Borde inferior: 1px gray-200
- Icono menú: izquierda
- Título proyecto: centro, bold
- Icono notificaciones: derecha (badge rojo si hay pendientes)

### Menú Lateral (Drawer)

```
┌──────────────────────┐
│ Menú                 │
│ AGUA DEL PALO        │
├──────────────────────┤
│ ○ Visita             │
│ ○ Pendientes         │
│ ○ Presupuesto/Gastos │
│ ○ Permisos           │
│ ○ Documentos         │
│ ○ Notas equipo       │
│ ○ Equipo             │
│ ○ Cronograma         │
├──────────────────────┤
│ Cambiar proyecto ▼   │
│ SANTA MARIA          │
└──────────────────────┘
```

- Ancho: 280px
- Fondo: black (#1A1A1A)
- Texto: white
- Item activo: fondo gray-800, borde izquierdo rojo
- Padding items: 16px horizontal, 12px vertical

### Cards

```
┌─────────────────────────────────────┐
│ Cocina                          ✎  │
├─────────────────────────────────────┤
│ Lorem ipsum dolor sit amet,        │
│ consectetuer adipiscing elit...    │
│                                     │
│ 👤 Francisco Gonzalez    📎 4      │
└─────────────────────────────────────┘
```

- Fondo: white
- Border radius: 12px
- Padding: 16px
- Sombra: shadow-card
- Título: semibold, gray-900
- Contenido: normal, gray-600
- Meta info: text-xs, gray-500

### Botones

#### Botón Primario
```css
.btn-primary {
  background: var(--color-primary);
  color: white;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
}
```

#### Botón Secundario
```css
.btn-secondary {
  background: transparent;
  color: var(--color-gray-700);
  border: 1px solid var(--color-gray-300);
  padding: 12px 24px;
  border-radius: var(--radius-md);
}
```

#### Botón Flotante (FAB)
```css
.fab {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: white;
  position: fixed;
  bottom: 24px;
  right: 24px;
  box-shadow: var(--shadow-lg);
}
```

### Badges de Estado

```css
.badge {
  padding: 4px 8px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.badge-listo { background: var(--badge-listo); color: white; }
.badge-pausado { background: var(--badge-pausado); color: white; }  /* Gris */
.badge-en-obra { background: var(--badge-en-obra); color: white; }
```

### Calendario

```
┌─────────────────────────────────────┐
│        Octubre 2025            < >  │
├─────────────────────────────────────┤
│  L   M   W   J   V   S   D         │
│           1   2   3   4   5         │
│  6   7   8   9  10  11  12         │
│ 13  14  15  16  17  18  19         │
│ 20  21  22 [23] 24  25  26         │
│ 27  28  29  30  31                 │
└─────────────────────────────────────┘
│ ● Visita  ● Próxima visita         │
```

- Día actual: círculo rojo sólido
- Día con visita: círculo rojo outline
- Próxima visita: punto rojo debajo

### Tabs de Filtro (Pendientes)

```
┌─────────────────────────────────────┐
│ [Por Sector]  │  Por Responsable    │
└─────────────────────────────────────┘
```

```css
.tabs-container {
  display: flex;
  background: var(--color-gray-100);
  border-radius: var(--radius-md);
  padding: 4px;
}

.tab {
  flex: 1;
  padding: 8px 16px;
  text-align: center;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-gray-600);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
}

.tab-active {
  background: white;
  color: var(--color-gray-900);
  box-shadow: var(--shadow-sm);
}
```

- Dos opciones: "Por Sector" | "Por Responsable"
- Tab activo: fondo blanco con sombra sutil
- Tab inactivo: transparente, texto gris

### Lista de Sectores

```
┌─────────────────────────────────────┐
│ Sala de estar                   2 ▼ │
├─────────────────────────────────────┤
│ Baño                            4   │
│ Pieza principal                 ●   │
│ Cocina                          1   │
│ Terraza                             │
│ Entrada                             │
└─────────────────────────────────────┘
```

- Sector con pendientes: badge numérico rojo
- Sector activo: fondo gray-100
- Chevron para expandir/colapsar

### Lista por Responsable

```
┌─────────────────────────────────────┐
│ 👤 David                        4   │
├─────────────────────────────────────┤
│ 👤 Mateo                        2   │
│ 👤 Pedro                        1   │
└─────────────────────────────────────┘
```

- Nombre del responsable con avatar/icono
- Badge numérico con cantidad de pendientes
- Tap expande para ver tareas asignadas

### Notificaciones

```
┌─────────────────────────────────────┐
│ 🔔 Notificaciones              X    │
├─────────────────────────────────────┤
│ Nueva tarea asignada               │
│ Juan Perez te asignó "pintar       │
│ muro verde" en sala de estar.      │
│                          hace 2 hrs │
├─────────────────────────────────────┤
│ Visita programada                  │
│ ...                                │
└─────────────────────────────────────┘
```

- Tipos: Nueva tarea, Visita programada, Tarea completada, Actualización presupuesto
- Icono por tipo
- Timestamp relativo

---

## Iconografía

Usar **Lucide Icons** o **Heroicons** (outline style).

### Iconos del Menú
- Visita: `calendar`
- Pendientes: `clipboard-list`
- Presupuesto: `dollar-sign`
- Permisos: `file-check`
- Documentos: `folder`
- Notas equipo: `message-square`
- Equipo: `users`
- Cronograma: `gantt-chart` o `list-checks`

### Iconos de Acción
- Agregar: `plus`
- Editar: `pencil`
- Eliminar: `trash-2`
- Menú: `menu`
- Notificaciones: `bell`
- WhatsApp: `message-circle` (o logo WhatsApp)
- Cerrar: `x`
- Atrás: `arrow-left`

---

## Patrones de Navegación

### Estructura de Pantallas

```
1. Home (Libro de Obra)
   ├── Calendario de visitas
   ├── Próximas visitas
   └── Sectores con pendientes

2. Visita (detalle)
   ├── Info visita
   ├── Notas por sector
   └── Acciones (Nueva nota, Notificar)

3. Pendientes
   ├── Toggle/Tabs: "Por Sector" | "Por Responsable"
   ├── Vista Por Sector: lista sectores con conteo
   └── Vista Por Responsable: lista personas con sus tareas

4. Notas Equipo
   ├── General
   └── Por sector

5. Equipo
   ├── Contactos
   └── Roles (Arquitecto, Constructor, etc.)

6. Cronograma
   └── Estados por sector (Listo, Pausado, En obra)
```

### Flujos Principales

1. **Nueva Visita**: FAB → Modal fecha/hora → Seleccionar lugar → Confirmar
2. **Nueva Nota**: FAB → Seleccionar sector → Escribir nota → Notificar (opcional) → Guardar
3. **Cambiar Proyecto**: Menú → Selector proyectos → Confirmar

---

## Responsive Breakpoints

```css
/* Mobile first */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
```

Para esta app, el foco es **mobile (< 640px)**. Las vistas tablet/desktop pueden usar layouts de 2-3 columnas.

---

## Animaciones y Transiciones

```css
:root {
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
}
```

### Patrones de Animación
- Drawer: slide-in desde izquierda (300ms)
- Modales: fade-in + scale (200ms)
- Cards: hover lift con sombra
- FAB: pulse sutil en idle
- Notificaciones: slide-down desde header

---

## Accesibilidad

- Contraste mínimo 4.5:1 para texto
- Touch targets mínimo 44x44px
- Focus visible en todos los interactivos
- Labels en todos los inputs
- Roles ARIA donde corresponda

---

## Notas de Implementación

### Stack Recomendado
- **Framework**: React Native / Expo (o React + Capacitor)
- **Styling**: Tailwind CSS / NativeWind
- **Icons**: Lucide React / Heroicons
- **State**: Zustand o React Context
- **Navigation**: React Navigation (mobile) / React Router (web)

### Estructura de Proyecto
```
src/
├── components/
│   ├── ui/           # Componentes base (Button, Card, Badge, etc.)
│   ├── layout/       # Header, Drawer, Container
│   └── features/     # Componentes específicos (VisitCard, SectorList, etc.)
├── screens/          # Pantallas principales
├── hooks/            # Custom hooks
├── utils/            # Helpers
├── styles/           # Variables CSS / Theme
└── types/            # TypeScript types
```
