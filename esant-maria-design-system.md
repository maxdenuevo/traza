# Sistema de Diseño ESANT MARIA
## Basado en principios de Dieter Rams

### Principios de Diseño

1. **Innovador** - Uso de PWA mobile-first
2. **Útil** - Cada elemento tiene una función clara
3. **Estético** - Minimalista y limpio
4. **Comprensible** - Interfaz autoexplicativa
5. **Discreto** - Sin elementos decorativos
6. **Honesto** - No promete más de lo que ofrece
7. **Duradero** - Diseño atemporal
8. **Detallado** - Cada pixel tiene propósito
9. **Sustentable** - Ligero y eficiente
10. **Menos es más** - Solo lo esencial

### Paleta de Colores

```css
/* Colores Principales */
--color-black: #000000;
--color-white: #FFFFFF;
--color-gray-100: #F5F5F5; /* Fondos */
--color-gray-200: #E8E8E8; /* Bordes, divisores */
--color-gray-400: #9E9E9E; /* Texto secundario */
--color-gray-600: #757575; /* Iconos inactivos */
--color-gray-800: #424242; /* Texto principal */

/* Colores de Acento */
--color-red: #F44336;     /* Notificaciones, alertas */
--color-green: #25D366;   /* WhatsApp */
```

### Tipografía

```css
/* Sistema tipográfico */
--font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

/* Tamaños */
--text-xs: 12px;    /* Metadata, timestamps */
--text-sm: 14px;    /* Texto secundario */
--text-base: 16px;  /* Texto principal */
--text-lg: 18px;    /* Subtítulos */
--text-xl: 20px;    /* Títulos de sección */
--text-2xl: 24px;   /* Títulos principales */

/* Pesos */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Espaciado

```css
/* Sistema de espaciado (múltiplos de 4px) */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
```

### Componentes

#### Botones

**Primario (Negro)**
```css
.btn-primary {
  background: var(--color-black);
  color: var(--color-white);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 16px;
}
```

**WhatsApp (Verde)**
```css
.btn-whatsapp {
  background: var(--color-green);
  color: var(--color-white);
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 500;
}
```

**Secundario (Gris)**
```css
.btn-secondary {
  background: var(--color-gray-200);
  color: var(--color-gray-800);
  padding: 8px 16px;
  border-radius: 8px;
}
```

**Acento (Rojo)**
```css
.btn-accent {
  background: var(--color-red);
  color: var(--color-white);
  padding: 12px 24px;
  border-radius: 8px;
}
```

#### Cards

```css
.card {
  background: var(--color-white);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
```

#### Menú Lateral

```css
.menu {
  background: var(--color-black);
  color: var(--color-white);
  padding: 24px;
  border-radius: 20px;
}

.menu-item {
  padding: 16px 0;
  font-size: 18px;
  font-weight: 500;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
```

#### Badges

```css
.badge-count {
  background: var(--color-red);
  color: var(--color-white);
  min-width: 24px;
  height: 24px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.badge-notification {
  background: var(--color-black);
  color: var(--color-white);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}
```

### Layouts Mobile-First

#### Estructura Base
```css
.container {
  padding: 16px;
  max-width: 100%;
  background: var(--color-gray-100);
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.content {
  padding-bottom: 80px; /* Espacio para nav inferior */
}
```

### Animaciones

Mantener animaciones sutiles y funcionales:

```css
/* Transiciones estándar */
.transition {
  transition: all 0.2s ease;
}

/* Expansión de acordeones */
.expand {
  transition: height 0.3s ease;
}

/* Entrada de modales */
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

### Iconografía

- **Menú**: 3 líneas horizontales (hamburguesa)
- **Notificaciones**: Badge con número
- **Expandir**: + (más)
- **Colapsar**: - (menos) o chevron
- **WhatsApp**: Logo oficial
- **Editar**: "E" en círculo gris

### Estados

#### Hover (Desktop)
```css
.interactive:hover {
  opacity: 0.8;
}
```

#### Active (Mobile)
```css
.interactive:active {
  transform: scale(0.98);
}
```

#### Disabled
```css
.disabled {
  opacity: 0.4;
  pointer-events: none;
}
```

### Formularios

```css
.input {
  background: var(--color-white);
  border: none;
  border-bottom: 2px solid var(--color-gray-200);
  padding: 12px 0;
  font-size: 16px;
  width: 100%;
}

.input:focus {
  border-bottom-color: var(--color-black);
  outline: none;
}

.label {
  font-size: 14px;
  color: var(--color-gray-600);
  margin-bottom: 8px;
}
```

### Notas de Implementación

1. **No usar sombras excesivas** - Solo sombras sutiles para elevation
2. **Sin bordes decorativos** - Solo líneas divisorias funcionales
3. **Contraste alto** - Asegurar legibilidad
4. **Touch targets mínimos** - 44x44px para mobile
5. **Sin gradientes o efectos** - Colores sólidos únicamente
6. **Tipografía clara** - Sin fonts decorativas
7. **Jerarquía visual** - Mediante tamaño y peso, no color
8. **Espacios generosos** - Respiración entre elementos
9. **Feedback inmediato** - Estados activos claros
10. **Performance first** - Animaciones con CSS, no JS cuando sea posible
