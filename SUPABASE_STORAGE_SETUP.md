# Configuración de Supabase Storage para Imágenes

Esta guía te ayudará a configurar el almacenamiento de imágenes de medicamentos en Supabase.

## Paso 1: Crear el Bucket de Storage

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. En el menú lateral, haz clic en **"Storage"**
3. Haz clic en **"Create a new bucket"** o **"New Bucket"**
4. Configura el bucket:
   - **Name**: `medicamentos-imagenes`
   - **Public bucket**: ✅ **SÍ** (marcar como público)
   - **File size limit**: 5 MB (opcional, pero recomendado)
   - **Allowed MIME types**: `image/*` (opcional)

5. Haz clic en **"Create bucket"**

## Paso 2: Configurar Políticas de Acceso (RLS)

Para que la aplicación pueda subir y leer imágenes sin autenticación, necesitas configurar las políticas:

1. En la página de Storage, haz clic en el bucket `medicamentos-imagenes`
2. Ve a la pestaña **"Policies"**
3. Haz clic en **"New Policy"**

### Política 1: Permitir lectura pública

```sql
-- Política para lectura pública
CREATE POLICY "Permitir lectura pública de imágenes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'medicamentos-imagenes');
```

### Política 2: Permitir subida pública

```sql
-- Política para inserción pública
CREATE POLICY "Permitir subida pública de imágenes"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'medicamentos-imagenes');
```

### Política 3: Permitir actualización pública

```sql
-- Política para actualización pública
CREATE POLICY "Permitir actualización pública de imágenes"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'medicamentos-imagenes');
```

### Política 4: Permitir eliminación pública

```sql
-- Política para eliminación pública
CREATE POLICY "Permitir eliminación pública de imágenes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'medicamentos-imagenes');
```

## Paso 3: Agregar Columna en la Tabla

Ejecuta este SQL en el **SQL Editor**:

```sql
-- Agregar columna imagen_url a la tabla medicamentos
ALTER TABLE medicamentos
ADD COLUMN IF NOT EXISTS imagen_url TEXT;

-- Comentario para documentar
COMMENT ON COLUMN medicamentos.imagen_url IS 'URL de la imagen del medicamento en Supabase Storage';
```

## Paso 4: Verificar Configuración

### Verificar que el bucket existe:

1. Ve a **Storage** en el menú lateral
2. Deberías ver el bucket `medicamentos-imagenes` listado
3. El bucket debe tener un ícono de globo 🌐 indicando que es público

### Verificar las políticas:

1. Haz clic en el bucket `medicamentos-imagenes`
2. Ve a la pestaña **"Policies"**
3. Deberías ver 4 políticas activas (SELECT, INSERT, UPDATE, DELETE)

### Verificar la columna:

Ejecuta en SQL Editor:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'medicamentos'
AND column_name = 'imagen_url';
```

Deberías ver la columna `imagen_url` de tipo `text`.

## Configuración Alternativa: Solo Lectura Pública

Si prefieres mayor seguridad y solo quieres que las imágenes sean públicas para lectura (pero la subida requiera autenticación):

1. **NO** marques el bucket como público al crearlo
2. Solo crea la política de SELECT:

```sql
CREATE POLICY "Permitir lectura pública de imágenes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'medicamentos-imagenes');
```

**Nota**: Con esta configuración, necesitarás implementar autenticación para que los usuarios puedan subir imágenes.

## Tipos de Archivo Permitidos

La aplicación acepta los siguientes formatos:
- JPEG/JPG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- WebP (`.webp`)
- GIF (`.gif`)

Tamaño máximo: **5 MB**

## Estructura de Archivos

Las imágenes se guardarán con el siguiente formato:
```
medicamentos-imagenes/
  └── {medicamento-id}.{extension}
```

Ejemplo:
```
medicamentos-imagenes/
  ├── 1732012345678.jpg
  ├── 1732012345679.png
  └── 1732012345680.webp
```

## Optimización de Imágenes

La aplicación incluye compresión automática de imágenes:
- Redimensiona a máximo 800px de ancho
- Comprime con calidad 80%
- Esto reduce el tamaño del archivo y mejora la carga

## Troubleshooting

### Error: "new row violates row-level security policy"

**Causa**: Las políticas de RLS no están configuradas correctamente.

**Solución**: Verifica que las 4 políticas (SELECT, INSERT, UPDATE, DELETE) estén activas en el bucket.

### Error: "The resource already exists"

**Causa**: Intentas crear un bucket que ya existe.

**Solución**: Usa el bucket existente o elimínalo primero si quieres recrearlo.

### Las imágenes no se muestran

**Causas posibles**:
1. El bucket no es público
2. La política de SELECT no está configurada
3. La URL de la imagen es incorrecta

**Solución**:
- Verifica que el bucket tenga el ícono 🌐 (público)
- Verifica las políticas en la pestaña Policies
- Revisa la URL en la base de datos

### Error al subir: "Payload too large"

**Causa**: La imagen es muy grande (> 5MB).

**Solución**:
- Comprime la imagen antes de subirla
- La app ya incluye compresión automática, pero puedes reducir más la calidad

## Migración desde LocalStorage

Si ya tienes medicamentos guardados localmente y quieres migrar:

1. Los medicamentos sin imagen seguirán funcionando normalmente
2. Puedes editar cada medicamento y agregar una imagen
3. No es necesario migrar nada manualmente

## Siguiente Paso

Una vez configurado, vuelve a la aplicación y:
1. Agrega o edita un medicamento
2. Verás el campo para subir imagen
3. Selecciona una foto del medicamento
4. La imagen se subirá automáticamente a Supabase

---

## Para Usuarios Nuevos

Si estás configurando Supabase por primera vez, sigue estos pasos en orden:

1. **Primero**: Configura las tablas según [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
2. **Segundo**: Configura Storage según esta guía
3. **Tercero**: Configura las variables de entorno en `.env`
4. **Cuarto**: Despliega en Vercel según [DEPLOY.md](./DEPLOY.md)
