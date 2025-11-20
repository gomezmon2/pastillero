# Configuración de Autenticación

## Resumen
Se ha implementado un sistema completo de autenticación de usuarios utilizando Supabase Auth. Los usuarios ahora deben registrarse e iniciar sesión para usar la aplicación.

## Características Implementadas

### 1. Componentes
- **Auth.tsx**: Componente de login/registro con formularios y validación
- **Header actualizado**: Muestra información del usuario y botón de cerrar sesión

### 2. Servicios
- **authService.ts**: Gestiona registro, login, logout y estado de autenticación
- **supabaseStorage.ts actualizado**: Filtra medicamentos y tomas por usuario

### 3. Seguridad
- Row Level Security (RLS) habilitado en Supabase
- Políticas de acceso: cada usuario solo puede ver/modificar sus propios datos
- Filtrado automático por `user_id` en todas las consultas

## Configuración en Supabase

### Paso 1: Ejecutar migraciones SQL
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Copia y pega el contenido de `supabase-migrations.sql`
4. Ejecuta el script (botón "Run" o Ctrl+Enter)

Esto creará:
- Columnas `user_id` en las tablas `medicamentos`, `tomas` y `pacientes`
- Índices para mejorar el rendimiento
- Políticas de Row Level Security (RLS)
- **Trigger automático** que crea un registro de paciente cuando un usuario se registra

### Paso 1.1: Crear pacientes para usuarios existentes (si aplica)
Si ya tienes usuarios registrados antes de ejecutar las migraciones:
1. En **SQL Editor**, ejecuta el script `crear-pacientes-existentes.sql`
2. Esto creará automáticamente registros de pacientes para usuarios que no tengan uno

### Paso 2: Configurar autenticación por email
1. En Supabase Dashboard, ve a **Authentication > Providers**
2. Asegúrate de que **Email** esté habilitado
3. Configura las opciones:
   - **Enable email confirmations**: Deshabilitado (para desarrollo) o Habilitado (para producción)
   - **Secure email change**: Habilitado (recomendado)

### Paso 3: Personalizar emails (opcional)
1. Ve a **Authentication > Email Templates**
2. Personaliza los templates de:
   - Confirmation email (email de confirmación)
   - Magic Link
   - Reset Password

## Variables de Entorno

Asegúrate de tener configuradas estas variables en tu archivo `.env`:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## Flujo de Usuario

### Modo con Supabase (Producción)
1. Usuario visita la aplicación
2. Si no está autenticado, ve la pantalla de login/registro
3. Después de login exitoso, accede a sus medicamentos
4. Puede cerrar sesión desde el botón en el header

### Modo Local (Sin Supabase)
- Si las variables de entorno no están configuradas
- La aplicación funciona sin autenticación usando localStorage
- Los datos se guardan solo en el navegador local

## Migración de Datos Existentes

Si ya tienes datos en las tablas y necesitas asignarlos a un usuario específico:

```sql
-- Obtener el ID de tu usuario desde Supabase Dashboard > Authentication > Users
-- Luego ejecuta:
UPDATE medicamentos
SET user_id = 'TU_USER_ID_AQUI'
WHERE user_id IS NULL;

UPDATE tomas
SET user_id = 'TU_USER_ID_AQUI'
WHERE user_id IS NULL;
```

## Estructura de Tablas Actualizada

### medicamentos
```sql
- id: UUID (PK)
- user_id: UUID (FK -> auth.users) ⭐ NUEVO
- nombre: TEXT
- dosis: TEXT
- frecuencia: TEXT
- horarios: TEXT[]
- numero_pastillas: NUMERIC
- imagen_url: TEXT
- fecha_inicio: DATE
- fecha_fin: DATE
- notas: TEXT
- activo: BOOLEAN
- created_at: TIMESTAMP
```

### tomas
```sql
- id: UUID (PK)
- user_id: UUID (FK -> auth.users) ⭐ NUEVO
- medicamento_id: UUID (FK -> medicamentos)
- fecha: DATE
- hora: TEXT
- tomado: BOOLEAN
- notas_toma: TEXT
- created_at: TIMESTAMP
```

## Políticas de Seguridad (RLS)

Cada tabla tiene 4 políticas:
1. **SELECT**: Usuario solo puede leer sus propios registros
2. **INSERT**: Usuario solo puede crear registros con su user_id
3. **UPDATE**: Usuario solo puede actualizar sus propios registros
4. **DELETE**: Usuario solo puede eliminar sus propios registros

## Verificación

### Probar autenticación
1. Inicia la aplicación: `npm run dev`
2. Intenta registrar un nuevo usuario
3. Verifica que se cree correctamente en Supabase Dashboard > Authentication
4. Crea un medicamento
5. Verifica en SQL Editor:
```sql
SELECT * FROM medicamentos WHERE user_id = 'TU_USER_ID';
```

### Probar RLS
1. Intenta acceder a datos de otro usuario (debe fallar)
2. Verifica que solo ves tus propios medicamentos

## Troubleshooting

### Error: "No hay usuario autenticado"
- Verifica que las credenciales sean correctas
- Revisa la consola del navegador para errores
- Verifica que las variables de entorno estén configuradas

### Error: "new row violates row-level security policy"
- Asegúrate de que las políticas RLS estén creadas correctamente
- Verifica que el `user_id` se esté enviando en las consultas

### Los usuarios ven datos de otros usuarios
- Verifica que RLS esté habilitado: `ALTER TABLE nombre_tabla ENABLE ROW LEVEL SECURITY;`
- Confirma que las políticas estén activas en Supabase Dashboard

## Desarrollo vs Producción

### Desarrollo
- Email confirmations: Deshabilitado
- Los usuarios pueden registrarse y usar la app inmediatamente

### Producción
- Email confirmations: Habilitado (recomendado)
- Configura un servicio SMTP o usa el de Supabase
- Personaliza los templates de email con tu marca

## Próximos Pasos (Opcional)

1. **OAuth Providers**: Agregar login con Google, GitHub, etc.
2. **Recuperación de contraseña**: Ya implementado por Supabase
3. **Perfil de usuario**: Agregar página de perfil para actualizar datos
4. **Roles y permisos**: Implementar diferentes niveles de acceso
5. **Compartir medicamentos**: Permitir que familiares accedan a los datos
