# Modo Oscuro

## Descripción

Se ha implementado un sistema completo de modo oscuro/claro con soporte para:
- ✅ Toggle manual en el header
- ✅ Detección automática de preferencia del sistema
- ✅ Persistencia en localStorage
- ✅ Transiciones suaves entre temas
- ✅ Variables CSS para fácil personalización
- ✅ Soporte para todos los componentes

## Características

### 1. Cambio de Tema

**Toggle en el Header:**
- 🌙 Icono de luna para activar modo oscuro
- ☀️ Icono de sol para activar modo claro
- Animación suave al hacer clic

**Detección Automática:**
- Si es la primera vez que accedes, la app detecta tu preferencia del sistema
- Se adapta automáticamente si cambias la preferencia del sistema
- Una vez que cambias manualmente, tu elección se guarda

### 2. Persistencia

- La preferencia se guarda en `localStorage`
- Se mantiene entre sesiones
- Clave: `theme` (valores: `'light'` | `'dark'`)

### 3. Variables CSS

Todas las variables de color se definen en [theme.css](src/theme.css):

```css
:root[data-theme="light"] {
  --bg-primary: #ffffff;
  --text-primary: #1e293b;
  --accent-primary: #667eea;
  /* ... más variables */
}

:root[data-theme="dark"] {
  --bg-primary: #0f172a;
  --text-primary: #f1f5f9;
  --accent-primary: #818cf8;
  /* ... más variables */
}
```

## Estructura de Archivos

### Nuevos Archivos Creados

1. **src/context/ThemeContext.tsx**
   - Contexto de React para el tema
   - Hook `useTheme()` para acceder al tema
   - Función `toggleTheme()` para cambiar el tema

2. **src/theme.css**
   - Variables CSS para modo claro y oscuro
   - Definición de colores, gradientes, sombras

3. **src/dark-mode.css**
   - Estilos específicos de modo oscuro para cada componente
   - Sobrescribe estilos cuando `data-theme="dark"`

### Archivos Modificados

1. **src/main.tsx**
   - Envuelve la app con `ThemeProvider`
   - Importa archivos de tema

2. **src/components/Header.tsx**
   - Agregado botón de toggle de tema
   - Usa `useTheme()` hook

3. **src/components/Header.css**
   - Estilos para el botón de tema

4. **src/App.css**
   - Usa variables CSS en lugar de colores hardcodeados

## Uso

### Para Usuarios

**Cambiar el tema:**
1. Haz clic en el botón 🌙 o ☀️ en la esquina superior derecha
2. El tema cambiará inmediatamente
3. Tu preferencia se guardará automáticamente

### Para Desarrolladores

**Usar el tema en componentes:**

```tsx
import { useTheme } from '../context/ThemeContext';

const MiComponente = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <p>Tema actual: {theme}</p>
      <button onClick={toggleTheme}>Cambiar tema</button>
    </div>
  );
};
```

**Agregar estilos de modo oscuro:**

```css
/* En tu archivo .css */
:root[data-theme="dark"] .mi-clase {
  background: var(--bg-primary);
  color: var(--text-primary);
  border-color: var(--border-primary);
}
```

**Usar variables CSS:**

```css
.mi-elemento {
  background: var(--bg-primary);  /* Cambia automáticamente con el tema */
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}
```

## Variables Disponibles

### Colores de Fondo
- `--bg-primary`: Fondo principal
- `--bg-secondary`: Fondo secundario
- `--bg-tertiary`: Fondo terciario
- `--bg-hover`: Color de hover

### Colores de Texto
- `--text-primary`: Texto principal
- `--text-secondary`: Texto secundario
- `--text-tertiary`: Texto terciario
- `--text-muted`: Texto atenuado

### Colores de Borde
- `--border-primary`: Borde principal
- `--border-secondary`: Borde secundario
- `--border-focus`: Borde en foco

### Colores de Acento
- `--accent-primary`: Color principal
- `--accent-secondary`: Color secundario
- `--accent-success`: Verde/éxito
- `--accent-warning`: Amarillo/advertencia
- `--accent-error`: Rojo/error
- `--accent-info`: Azul/información

### Gradientes
- `--gradient-primary`: Gradiente principal
- `--gradient-success`: Gradiente de éxito
- `--gradient-info`: Gradiente de información

### Sombras
- `--shadow-sm`: Sombra pequeña
- `--shadow-md`: Sombra mediana
- `--shadow-lg`: Sombra grande
- `--shadow-xl`: Sombra extra grande

## Paleta de Colores

### Modo Claro
- **Fondos**: Blanco (#ffffff) → Gris claro (#f1f5f9)
- **Textos**: Gris oscuro (#1e293b) → Gris medio (#94a3b8)
- **Acentos**: Morado (#667eea), Verde (#10b981), Azul (#3b82f6)

### Modo Oscuro
- **Fondos**: Negro azulado (#0f172a) → Gris azulado (#334155)
- **Textos**: Blanco (#f1f5f9) → Gris claro (#64748b)
- **Acentos**: Morado claro (#818cf8), Verde claro (#34d399), Azul claro (#60a5fa)

## Componentes con Soporte de Modo Oscuro

✅ **Todos los componentes principales:**
- Header
- MedicamentoForm
- MedicamentoList
- CalendarioView
- ProspectoView
- ProspectoSearch
- Auth
- Notificaciones

## Personalización

### Cambiar Colores del Tema

Edita [theme.css](src/theme.css) y modifica las variables:

```css
:root[data-theme="dark"] {
  --accent-primary: #your-color;  /* Cambia el color principal */
  --bg-primary: #your-bg;         /* Cambia el fondo */
}
```

### Agregar Nuevos Componentes

1. **Usa variables CSS:**
   ```css
   .nuevo-componente {
     background: var(--bg-primary);
     color: var(--text-primary);
   }
   ```

2. **O agrega estilos específicos en [dark-mode.css](src/dark-mode.css):**
   ```css
   :root[data-theme="dark"] .nuevo-componente {
     background: var(--bg-tertiary);
   }
   ```

## Transiciones

Todas las propiedades de color cambian suavemente con una transición de 0.3s:

```css
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

Para desactivar en elementos específicos:

```css
.sin-transicion {
  transition: none !important;
}
```

## Accesibilidad

- ♿ Respeta `prefers-reduced-motion` para usuarios con sensibilidad al movimiento
- 🎨 Contraste verificado para WCAG AA
- 🌓 Detección automática de `prefers-color-scheme: dark`

## Navegadores Compatibles

- ✅ Chrome/Edge (>= 76)
- ✅ Firefox (>= 67)
- ✅ Safari (>= 12.1)
- ✅ Opera (>= 63)

## Debugging

### Ver tema actual en consola

```javascript
// En DevTools console
console.log(document.documentElement.getAttribute('data-theme'));
// Devuelve: 'light' o 'dark'
```

### Ver valor en localStorage

```javascript
console.log(localStorage.getItem('theme'));
// Devuelve: 'light', 'dark', o null
```

### Forzar un tema temporalmente

```javascript
// En DevTools console
document.documentElement.setAttribute('data-theme', 'dark');
```

### Limpiar preferencia guardada

```javascript
localStorage.removeItem('theme');
location.reload();
```

## Problemas Conocidos

### Los colores no cambian

**Solución:** Verifica que estés usando variables CSS (`var(--nombre)`) en lugar de colores hardcodeados.

### El tema no se guarda

**Solución:** Verifica que localStorage esté habilitado en tu navegador.

### Parpadeo al cargar

**Solución:** El tema se aplica antes de que React renderice, pero puede haber un breve parpadeo en la primera carga. Esto es normal y se minimiza con las transiciones.

## Próximas Mejoras

- [ ] Agregar más temas (ej: alto contraste)
- [ ] Personalización de colores por usuario
- [ ] Modo automático (cambiar según hora del día)
- [ ] Tema por componente
- [ ] Exportar/importar configuración de tema

## Capturas

### Modo Claro
- Fondo blanco/gris claro
- Textos oscuros
- Colores vibrantes

### Modo Oscuro
- Fondo negro/gris oscuro
- Textos claros
- Colores suavizados para reducir fatiga visual

---

**Nota:** El modo oscuro está diseñado para reducir la fatiga visual en entornos con poca luz y ahorrar batería en pantallas OLED.
