# Solución de Problemas de Autenticación

## Problema: "No me acepta las credenciales"

Si recibes el error "Email o contraseña incorrectos" o "Invalid login credentials", sigue estos pasos:

### Paso 1: Ejecutar diagnóstico SQL

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Ejecuta el script `diagnostico-auth.sql` (sección por sección)
4. Anota los resultados

### Paso 2: Verificar el usuario existe

Ejecuta en SQL Editor:
```sql
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'tu_email@ejemplo.com';
```

**Posibles resultados:**

#### A) No hay resultados (usuario no existe)
**Solución**: Necesitas registrarte primero
- Ve a la pantalla de registro en la app
- Crea una nueva cuenta con email y contraseña

#### B) Usuario existe pero `email_confirmed_at` es NULL
**Problema**: Email no confirmado
**Solución**:

**Opción 1 - Deshabilitar confirmación de email (solo desarrollo):**
1. En Supabase Dashboard → **Authentication → Providers**
2. Click en **Email**
3. Desactiva **"Enable email confirmations"**
4. Guarda cambios
5. Intenta hacer login de nuevo

**Opción 2 - Confirmar email manualmente:**
```sql
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'tu_email@ejemplo.com';
```

#### C) Usuario existe y email está confirmado
**Problema**: Contraseña incorrecta

**Solución - Resetear contraseña:**

```sql
-- Cambiar contraseña a "test123456" (ejemplo)
UPDATE auth.users
SET encrypted_password = crypt('test123456', gen_salt('bf'))
WHERE email = 'tu_email@ejemplo.com';
```

Luego intenta hacer login con:
- Email: tu_email@ejemplo.com
- Contraseña: test123456

### Paso 3: Verificar configuración del proyecto

#### A) Verificar que las variables de entorno son correctas

En el archivo `.env`:
```env
VITE_SUPABASE_URL=https://[TU_PROYECTO].supabase.co
VITE_SUPABASE_ANON_KEY=[TU_ANON_KEY]
```

**Cómo obtener estos valores:**
1. Ve a Supabase Dashboard → **Settings → API**
2. Copia el **Project URL** (debe coincidir con `VITE_SUPABASE_URL`)
3. Copia el **anon public** key (debe coincidir con `VITE_SUPABASE_ANON_KEY`)

#### B) Reiniciar el servidor de desarrollo

Después de cambiar el archivo `.env`:
1. Detén el servidor (Ctrl+C)
2. Ejecuta `npm run dev` de nuevo
3. Refresca el navegador completamente (Ctrl+F5)

### Paso 4: Verificar en consola del navegador

1. Abre las herramientas de desarrollo (F12)
2. Ve a la pestaña **Console**
3. Intenta hacer login
4. Busca mensajes que empiecen con:
   - `authService.login - ...`
   - `Intentando login con email:`

**Mensajes esperados en caso de éxito:**
```
Intentando login con email: usuario@ejemplo.com
authService.login - Iniciando sesión...
authService.login - Sesión iniciada correctamente: {id: "...", email: "..."}
Login exitoso: {id: "...", email: "...", ...}
```

**Mensajes en caso de error:**
```
authService.login - Error de Supabase: {message: "Invalid login credentials", ...}
Error en login: Error: Invalid login credentials
```

### Paso 5: Crear usuario de prueba limpio

Si nada funciona, crea un usuario completamente nuevo:

1. En Supabase Dashboard → **Authentication → Users**
2. Click en **"Add user"** → **"Create new user"**
3. Completa:
   - Email: test@test.com
   - Password: test123456
   - **Auto Confirm User**: ✅ Marcado
4. Click en **"Create user"**

Luego en la app:
- Email: test@test.com
- Contraseña: test123456

### Paso 6: Verificar RLS no está bloqueando

Ejecuta en SQL Editor:
```sql
-- Verificar políticas activas
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('medicamentos', 'tomas', 'pacientes');
```

Si hay problemas, temporalmente puedes deshabilitar RLS para probar:
```sql
-- ⚠️ SOLO PARA PRUEBAS - VOLVER A HABILITAR DESPUÉS
ALTER TABLE medicamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE tomas DISABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes DISABLE ROW LEVEL SECURITY;
```

Después de probar, **RE-HABILITA RLS:**
```sql
ALTER TABLE medicamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tomas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
```

## Problema: "No hay usuario autenticado" al crear medicamentos

### Verificar sesión en consola

Abre la consola (F12) y ejecuta:
```javascript
const { data } = await supabase.auth.getSession();
console.log('Sesión actual:', data.session);
```

**Si session es null:**
1. Cierra sesión completamente (botón "Cerrar sesión")
2. Refresca la página
3. Vuelve a iniciar sesión

### Verificar almacenamiento local

En consola del navegador:
```javascript
// Ver tokens guardados
console.log(localStorage.getItem('supabase.auth.token'));
```

Si no hay token o está corrupto:
```javascript
// Limpiar almacenamiento y empezar de nuevo
localStorage.clear();
location.reload();
```

## Problema: Error 400 en /auth/v1/token

Este error indica que:
1. Las credenciales son incorrectas
2. El usuario no existe
3. La configuración de Supabase es incorrecta

**Soluciones:**
1. Verifica que las variables de entorno sean correctas
2. Confirma que el email del usuario esté confirmado
3. Resetea la contraseña usando SQL
4. Crea un nuevo usuario de prueba

## Checklist final

- [ ] Variables de entorno `.env` son correctas
- [ ] Usuario existe en `auth.users`
- [ ] `email_confirmed_at` no es NULL (o confirmación está deshabilitada)
- [ ] Contraseña es correcta (o fue reseteada)
- [ ] Servidor de desarrollo fue reiniciado después de cambiar `.env`
- [ ] Navegador fue refrescado completamente (Ctrl+F5)
- [ ] No hay errores en consola del navegador
- [ ] RLS está habilitado y políticas están activas

## Contacto y logs

Si el problema persiste, revisa:
1. **Supabase Dashboard → Logs** para ver errores del servidor
2. **Consola del navegador (F12)** para ver errores del cliente
3. **Network tab** para ver las peticiones HTTP fallidas

Anota:
- El error exacto mostrado
- Los logs de la consola
- El código de respuesta HTTP (400, 401, 403, etc.)
