# Pastillero Digital

Una aplicación web moderna para gestionar medicamentos y recordatorios de toma, con sincronización en la nube.

## Características

- **Registro de medicamentos**: Agrega medicamentos con nombre, dosis, frecuencia y horarios personalizados
- **Edición de medicamentos**: Modifica cualquier medicamento existente
- **Gestión de horarios**: Define múltiples horarios de toma para cada medicamento
- **Seguimiento de tomas**: Marca las tomas realizadas con un solo clic
- **Activar/Desactivar**: Control de medicamentos activos e inactivos
- **Historial**: Registro de todas las tomas realizadas
- **Sincronización en la nube**: Datos guardados en Supabase (PostgreSQL)
- **Fallback local**: Funciona con localStorage si no hay conexión
- **Diseño responsivo**: Funciona perfectamente en desktop y móvil
- **Notificaciones visuales**: Feedback inmediato de todas las acciones

## Demo en Vivo

[Ver Demo](https://tu-proyecto.vercel.app) (próximamente)

## Tecnologías

### Frontend
- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **CSS3** - Estilos modernos con gradientes y animaciones

### Backend
- **Supabase** - Base de datos PostgreSQL en la nube
- **LocalStorage** - Persistencia local como fallback

### Infraestructura
- **Vercel** - Hosting y deploy automático
- **GitHub** - Control de versiones

## Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/pastillero.git
cd pastillero

# Instalar dependencias
npm install

# Configurar variables de entorno (ver instrucciones abajo)
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

## Configuración

### Opción 1: Usar LocalStorage (Sin configuración)

La aplicación funcionará inmediatamente con almacenamiento local.

### Opción 2: Usar Supabase (Recomendado)

Para sincronización en la nube, sigue la guía completa:

📘 **[Guía de Configuración de Supabase](./SUPABASE_SETUP.md)**

Pasos rápidos:
1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ejecuta el SQL para crear las tablas (ver `SUPABASE_SETUP.md`)
4. Copia tus credenciales a `.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-aqui
```

5. Reinicia el servidor de desarrollo

## Despliegue en Producción

📘 **[Guía de Despliegue en Vercel](./DEPLOY.md)**

Pasos rápidos:
1. Sube tu código a GitHub
2. Conecta tu repositorio en [Vercel](https://vercel.com)
3. Configura las variables de entorno
4. Deploy automático

## Uso

### Agregar Medicamento

1. Haz clic en "+ Agregar Medicamento"
2. Completa el formulario:
   - **Nombre**: ej. Ibuprofeno
   - **Dosis**: ej. 400mg
   - **Frecuencia**: Selecciona de la lista
   - **Horarios**: Agrega uno o varios
   - **Fechas**: Inicio y fin (opcional)
   - **Notas**: Instrucciones especiales
3. Haz clic en "Guardar Medicamento"

### Editar Medicamento

1. Haz clic en el botón de editar (✏️) en cualquier tarjeta
2. Modifica los campos necesarios
3. Haz clic en "Actualizar Medicamento"

### Marcar Toma

1. En la tarjeta del medicamento, haz clic en el horario correspondiente
2. Se registrará automáticamente la toma

### Gestionar Medicamentos

- **Activar/Desactivar**: Clic en el botón (✓/○)
- **Eliminar**: Clic en el botón de basura (🗑️)

## Estructura del Proyecto

```
pastillero/
├── src/
│   ├── components/              # Componentes React
│   │   ├── Header.tsx          # Encabezado
│   │   ├── MedicamentoForm.tsx # Formulario (agregar/editar)
│   │   └── MedicamentoList.tsx # Lista de medicamentos
│   ├── lib/
│   │   └── supabase.ts         # Cliente de Supabase
│   ├── types/
│   │   └── index.ts            # Tipos TypeScript
│   ├── utils/
│   │   ├── storage.ts          # Storage local
│   │   └── supabaseStorage.ts  # Storage con Supabase
│   ├── App.tsx                 # Componente principal
│   ├── App.css                 # Estilos principales
│   └── main.tsx                # Punto de entrada
├── .env.example                # Plantilla de variables de entorno
├── SUPABASE_SETUP.md          # Guía de configuración de Supabase
├── DEPLOY.md                   # Guía de despliegue
└── package.json
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Compila para producción
npm run preview      # Vista previa de producción

# Linting
npm run lint         # Ejecuta ESLint
```

## Esquema de Base de Datos

### Tabla: medicamentos
- `id` - Identificador único
- `nombre` - Nombre del medicamento
- `dosis` - Dosis (ej: 400mg)
- `frecuencia` - Frecuencia de toma
- `horarios` - Array de horarios
- `fecha_inicio` - Fecha de inicio
- `fecha_fin` - Fecha de fin (opcional)
- `notas` - Notas adicionales
- `activo` - Estado activo/inactivo

### Tabla: tomas
- `id` - Identificador único
- `medicamento_id` - Referencia al medicamento
- `fecha` - Fecha de la toma
- `hora` - Hora de la toma
- `tomado` - Si fue tomado
- `notas_toma` - Notas específicas de la toma

## Roadmap

### v1.0 (Actual)
- ✅ CRUD de medicamentos
- ✅ Registro de tomas
- ✅ Persistencia con Supabase/LocalStorage
- ✅ Diseño responsivo

### v1.1 (Próximamente)
- 🔔 Notificaciones del navegador
- 📊 Dashboard de estadísticas
- 📅 Vista de calendario
- 🌙 Modo oscuro

### v2.0 (Futuro)
- 👤 Autenticación de usuarios
- 👥 Multi-usuario (familia)
- 📱 Aplicación móvil (React Native)
- 📤 Exportar datos (PDF/CSV)
- 📈 Gráficos de adherencia
- 🏥 Información de paciente
- 💊 Base de datos de medicamentos
- 🔍 Búsqueda de interacciones

## Contribuir

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles

## Soporte

¿Tienes preguntas o problemas?

- 📧 Email: tu-email@ejemplo.com
- 🐛 [Reportar un bug](https://github.com/tu-usuario/pastillero/issues)
- 💡 [Solicitar una funcionalidad](https://github.com/tu-usuario/pastillero/issues)

## Agradecimientos

- [React](https://react.dev) - Framework de UI
- [Vite](https://vitejs.dev) - Build tool
- [Supabase](https://supabase.com) - Backend as a Service
- [Vercel](https://vercel.com) - Hosting

---

Hecho con ❤️ para ayudar a las personas a gestionar su medicación
