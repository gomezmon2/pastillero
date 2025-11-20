# 💊 Pastillero Digital

Una aplicación web moderna y completa para gestionar medicamentos, recordatorios de toma, prospectos farmacéuticos y seguimiento de tratamientos, con sincronización en la nube y modo oscuro.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Características

### 📋 Gestión de Medicamentos
- Registro completo de medicamentos con nombre, dosis, frecuencia y horarios
- Edición y eliminación de medicamentos
- Activar/Desactivar medicamentos temporalmente
- Subida de imágenes de medicamentos
- Control de número de pastillas por toma (incluye medias pastillas: 0.5, 1.5, etc.)

### 📅 Seguimiento de Tomas
- Marca tomas realizadas con un solo clic
- Vista de calendario mensual
- Historial completo de tomas
- Notificaciones de recordatorio

### 🔍 Prospectos de Medicamentos
- **Búsqueda automática** de información farmacéutica
- **Base de datos local** con medicamentos comunes en español
- **Integración con APIs**: CIMA (España) y OpenFDA (EE.UU.)
- Información completa: principio activo, indicaciones, contraindicaciones, efectos secundarios, dosificación, interacciones
- Vista de prospecto con navegación por pestañas

### 🌙 Modo Oscuro
- Cambio de tema claro/oscuro con un clic
- Detección automática de preferencia del sistema
- Persistencia de elección del usuario
- Transiciones suaves entre temas

### 👤 Autenticación de Usuarios
- Sistema completo de login y registro
- Cada usuario ve solo sus medicamentos
- Row Level Security (RLS) en base de datos
- Creación automática de perfil de paciente

### 📱 Progressive Web App (PWA)
- Instalable como app nativa en móvil y desktop
- Funciona offline con Service Worker
- Notificaciones push
- Ícono en pantalla de inicio

### ☁️ Sincronización en la Nube
- Datos guardados en Supabase (PostgreSQL)
- Sincronización automática
- Fallback a localStorage si no hay conexión

## 🚀 Demo en Vivo

[Ver Aplicación](https://pastillero.vercel.app) (próximamente)

## 🛠 Tecnologías

### Frontend
- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool ultrarrápido
- **CSS3** - Variables CSS, gradientes, animaciones

### Backend
- **Supabase** - PostgreSQL en la nube
- **Supabase Auth** - Autenticación de usuarios
- **Supabase Storage** - Almacenamiento de imágenes

### APIs Externas
- **CIMA API** - Agencia Española de Medicamentos
- **OpenFDA API** - FDA de Estados Unidos

### Infraestructura
- **Vercel** - Hosting con deploy automático
- **GitHub** - Control de versiones

## 📦 Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/gomezmon2/pastillero.git
cd pastillero

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env
# Edita .env y agrega tus credenciales de Supabase

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-aqui
```

### Configurar Supabase

#### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Anota tu `Project URL` y `anon public key`

#### 2. Ejecutar Migraciones SQL

En el SQL Editor de Supabase, ejecuta los siguientes scripts en orden:

**a) Crear tablas base:**

```sql
-- Tabla de pacientes
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  edad INTEGER,
  alergias TEXT[],
  condiciones TEXT[],
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de medicamentos
CREATE TABLE medicamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  dosis TEXT NOT NULL,
  frecuencia TEXT NOT NULL,
  horarios TEXT[] NOT NULL,
  numero_pastillas NUMERIC DEFAULT 1,
  imagen_url TEXT,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  notas TEXT,
  activo BOOLEAN DEFAULT TRUE,
  prospecto JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de tomas
CREATE TABLE tomas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  medicamento_id UUID REFERENCES medicamentos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hora TEXT NOT NULL,
  tomado BOOLEAN DEFAULT TRUE,
  notas_toma TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_medicamentos_user_id ON medicamentos(user_id);
CREATE INDEX idx_medicamentos_prospecto ON medicamentos USING GIN (prospecto);
CREATE INDEX idx_tomas_user_id ON tomas(user_id);
CREATE INDEX idx_tomas_medicamento_id ON tomas(medicamento_id);
CREATE INDEX idx_pacientes_user_id ON pacientes(user_id);
```

**b) Habilitar Row Level Security (RLS):**

```sql
-- Habilitar RLS
ALTER TABLE medicamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tomas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;

-- Políticas para medicamentos
CREATE POLICY "Users can view own medications" ON medicamentos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own medications" ON medicamentos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own medications" ON medicamentos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own medications" ON medicamentos FOR DELETE USING (auth.uid() = user_id);

-- Políticas para tomas
CREATE POLICY "Users can view own doses" ON tomas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own doses" ON tomas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own doses" ON tomas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own doses" ON tomas FOR DELETE USING (auth.uid() = user_id);

-- Políticas para pacientes
CREATE POLICY "Users can view own profile" ON pacientes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own profile" ON pacientes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON pacientes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON pacientes FOR DELETE USING (auth.uid() = user_id);
```

**c) Crear trigger para auto-crear perfil de paciente:**

```sql
-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.pacientes (user_id, nombre)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'nombre', new.email));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### 3. Configurar Autenticación

En Supabase Dashboard:
1. **Authentication** → **Providers**
2. Asegúrate que **Email** esté habilitado
3. Para desarrollo: desactiva "Enable email confirmations"
4. Para producción: actívala y configura templates de email

#### 4. Configurar Storage (Opcional - para imágenes)

```sql
-- Crear bucket para imágenes
INSERT INTO storage.buckets (id, name, public) VALUES ('medicamentos-imagenes', 'medicamentos-imagenes', true);

-- Política de lectura pública
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'medicamentos-imagenes');

-- Política de subida solo para usuarios autenticados
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'medicamentos-imagenes' AND auth.role() = 'authenticated');
```

## 🎯 Uso

### Primer Uso

1. **Registrarse**: Crea una cuenta con email y contraseña
2. **Iniciar sesión**: Accede con tus credenciales
3. **Agregar medicamento**: Click en "+ Agregar Medicamento"

### Agregar Medicamento

1. Completa el formulario:
   - **Nombre**: ej. Paracetamol
   - **Dosis**: ej. 500mg
   - **Frecuencia**: Selecciona de la lista
   - **Horarios**: Agrega uno o varios (formato 24h)
   - **Número de pastillas**: 1, 0.5, 2, etc.
   - **Imagen**: (Opcional) Sube foto del medicamento
   - **Fechas**: Inicio y fin del tratamiento
   - **Notas**: Instrucciones especiales

2. **Buscar prospecto** (opcional):
   - Click en "🔍 Buscar información del medicamento"
   - Revisa la información encontrada
   - Click en "✓ Guardar información"

3. Click en "Guardar Medicamento"

### Ver Prospecto

Si guardaste información del prospecto:
1. En la tarjeta del medicamento, click en "📋 Ver prospecto"
2. Navega por las pestañas: Indicaciones, Dosificación, Contraindicaciones, etc.
3. Si hay PDF disponible, descárgalo desde el modal

### Marcar Tomas

- **Vista Lista**: Click en el horario en la tarjeta del medicamento
- **Vista Calendario**: Click en la celda del día/medicamento
- Click nuevamente para desmarcar

### Cambiar a Modo Oscuro

- Click en el botón 🌙/☀️ en el header
- Tu preferencia se guarda automáticamente

### Instalar como App (PWA)

#### Android (Chrome/Edge):
1. Abre la app en Chrome/Edge
2. Menú (⋮) → "Instalar aplicación"
3. Confirma y aparecerá en tu pantalla de inicio

#### iOS (Safari):
1. Abre la app en Safari
2. Botón compartir (⬆️) → "Agregar a pantalla de inicio"
3. Confirma

#### Desktop (Chrome/Edge):
1. Busca el ícono (➕) en la barra de direcciones
2. Click en "Instalar"

## 📁 Estructura del Proyecto

```
pastillero/
├── public/
│   ├── icon.svg                    # Ícono de la PWA
│   ├── manifest.json               # Manifiesto PWA
│   └── sw.js                       # Service Worker
├── src/
│   ├── components/
│   │   ├── Auth.tsx               # Login/Registro
│   │   ├── CalendarioView.tsx     # Vista de calendario
│   │   ├── Header.tsx             # Header con toggle de tema
│   │   ├── MedicamentoForm.tsx    # Formulario de medicamentos
│   │   ├── MedicamentoList.tsx    # Lista de medicamentos
│   │   ├── NotificationSetup.tsx  # Configuración de notificaciones
│   │   ├── ProspectoView.tsx      # Modal de prospecto
│   │   └── ProspectoSearch.tsx    # Búsqueda de prospectos
│   ├── context/
│   │   └── ThemeContext.tsx       # Contexto de tema (modo oscuro)
│   ├── types/
│   │   └── index.ts               # Tipos TypeScript
│   ├── utils/
│   │   ├── authService.ts         # Servicio de autenticación
│   │   ├── imageUpload.ts         # Subida de imágenes
│   │   ├── medicamentoSearchService.ts  # Búsqueda de prospectos
│   │   ├── notifications.ts       # Notificaciones push
│   │   ├── storage.ts             # LocalStorage
│   │   ├── supabase.ts            # Cliente Supabase
│   │   └── supabaseStorage.ts     # Storage con Supabase
│   ├── App.tsx                    # Componente principal
│   ├── App.css                    # Estilos principales
│   ├── theme.css                  # Variables de tema
│   ├── dark-mode.css              # Estilos de modo oscuro
│   └── main.tsx                   # Punto de entrada
├── .env.example                   # Template de variables
├── vercel.json                    # Configuración de Vercel
├── vite.config.ts                 # Configuración Vite + PWA
└── package.json
```

## 🚀 Despliegue en Producción

### Opción Recomendada: Vercel

1. **Conectar con Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Login con GitHub
   - "Add New..." → "Project"
   - Selecciona el repositorio `pastillero`

2. **Configurar Variables de Entorno:**
   ```
   VITE_SUPABASE_URL=tu_url
   VITE_SUPABASE_ANON_KEY=tu_key
   ```

3. **Deploy:**
   - Click "Deploy"
   - Espera 1-2 minutos
   - Tu app estará en `https://pastillero.vercel.app`

4. **Configurar Supabase para Producción:**
   - Supabase Dashboard → Authentication → URL Configuration
   - Agrega tu URL de producción:
     ```
     Site URL: https://tu-app.vercel.app
     Redirect URLs: https://tu-app.vercel.app/**
     ```

### Deploy Automático

Cada `git push origin main` desplegará automáticamente la nueva versión.

## 🎨 Personalización

### Colores del Tema

Edita `src/theme.css`:

```css
:root[data-theme="light"] {
  --accent-primary: #667eea;  /* Color principal */
  --bg-primary: #ffffff;      /* Fondo */
}

:root[data-theme="dark"] {
  --accent-primary: #818cf8;
  --bg-primary: #0f172a;
}
```

### Medicamentos en Base de Datos Local

Agrega más medicamentos en `src/utils/medicamentoSearchService.ts`:

```typescript
const medicamentosComunes: Record<string, ProspectoMedicamento> = {
  'tu-medicamento': {
    principioActivo: 'Principio',
    indicaciones: 'Para qué sirve...',
    dosificacion: 'Cómo tomarlo...',
  },
};
```

## 📊 Esquema de Base de Datos

### Tabla: medicamentos
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| user_id | UUID | Referencia al usuario |
| nombre | TEXT | Nombre del medicamento |
| dosis | TEXT | Dosis (ej: 400mg) |
| frecuencia | TEXT | Frecuencia de toma |
| horarios | TEXT[] | Array de horarios |
| numero_pastillas | NUMERIC | Pastillas por toma |
| imagen_url | TEXT | URL de la imagen |
| fecha_inicio | DATE | Fecha de inicio |
| fecha_fin | DATE | Fecha de fin (opcional) |
| notas | TEXT | Notas adicionales |
| activo | BOOLEAN | Activo/Inactivo |
| prospecto | JSONB | Información del prospecto |
| created_at | TIMESTAMP | Fecha de creación |

### Tabla: tomas
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| user_id | UUID | Referencia al usuario |
| medicamento_id | UUID | Referencia al medicamento |
| fecha | DATE | Fecha de la toma |
| hora | TEXT | Hora de la toma |
| tomado | BOOLEAN | Si fue tomado |
| notas_toma | TEXT | Notas de la toma |
| created_at | TIMESTAMP | Fecha de registro |

### Tabla: pacientes
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| user_id | UUID | Referencia al usuario (único) |
| nombre | TEXT | Nombre del paciente |
| edad | INTEGER | Edad (opcional) |
| alergias | TEXT[] | Lista de alergias |
| condiciones | TEXT[] | Condiciones médicas |
| created_at | TIMESTAMP | Fecha de creación |

## 🐛 Solución de Problemas

### No puedo iniciar sesión

**Error:** "Email not confirmed"

**Solución:**
```sql
-- En Supabase SQL Editor
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'tu@email.com';
```

O deshabilita confirmación en: Authentication → Providers → Email

### Los medicamentos no se guardan

1. Verifica que iniciaste sesión
2. Revisa la consola del navegador (F12)
3. Verifica que las políticas RLS estén activas en Supabase

### Modo oscuro no persiste

1. Verifica que localStorage esté habilitado
2. Limpia la caché del navegador
3. Prueba en modo incógnito

### La app no funciona offline

1. Verifica que el Service Worker esté registrado (DevTools → Application)
2. Asegúrate que la app use HTTPS (en producción)
3. Refresca la página completamente (Ctrl+F5)

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo (http://localhost:5173)

# Producción
npm run build        # Compilar para producción
npm run preview      # Vista previa de build de producción

# Calidad de código
npm run lint         # Ejecutar ESLint
```

## 🗺 Roadmap

### ✅ Versión 2.0 (Actual)
- Sistema completo de autenticación
- Búsqueda de prospectos de medicamentos
- Modo oscuro
- Vista de calendario
- PWA con notificaciones
- Multi-usuario con RLS

### 🔜 Versión 2.1 (Próximamente)
- Estadísticas y gráficos de adherencia
- Recordatorios personalizados
- Compartir medicamentos con familiares
- Exportar datos (PDF/CSV)
- Información de paciente extendida

### 🔮 Versión 3.0 (Futuro)
- Aplicación móvil nativa (React Native)
- Detección de interacciones entre medicamentos
- Integración con wearables
- Asistente virtual con IA
- Multi-idioma

## 🤝 Contribuir

Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'feat: add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - Este proyecto es de código abierto y puede usarse libremente.

## 💬 Soporte

- 🐛 [Reportar un bug](https://github.com/gomezmon2/pastillero/issues)
- 💡 [Solicitar funcionalidad](https://github.com/gomezmon2/pastillero/issues)
- 📧 Contacto: gomezmon2@gmail.com

## 🙏 Agradecimientos

- [React](https://react.dev) - Framework de UI
- [TypeScript](https://www.typescriptlang.org/) - Tipado estático
- [Vite](https://vitejs.dev) - Build tool
- [Supabase](https://supabase.com) - Backend as a Service
- [Vercel](https://vercel.com) - Hosting y deployment
- [CIMA](https://cima.aemps.es) - Base de datos de medicamentos (España)
- [OpenFDA](https://open.fda.gov/) - Base de datos FDA

---

**Hecho con ❤️ para ayudar a las personas a gestionar su medicación de forma segura y efectiva**

🌟 Si este proyecto te ayudó, considera darle una estrella en GitHub
