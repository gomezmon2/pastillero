# Guía de Configuración de Supabase

Esta guía te ayudará a configurar Supabase para tu aplicación Pastillero Digital.

## Paso 1: Crear Cuenta en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Regístrate con tu email o GitHub
4. Verifica tu email

## Paso 2: Crear un Nuevo Proyecto

1. Una vez dentro, haz clic en "New Project"
2. Completa los datos:
   - **Name**: `pastillero` (o el nombre que prefieras)
   - **Database Password**: Genera una contraseña segura (guárdala bien)
   - **Region**: Elige la más cercana a tu ubicación (ej: South America - Sao Paulo)
   - **Pricing Plan**: Free (gratis)
3. Haz clic en "Create new project"
4. Espera 1-2 minutos mientras se crea el proyecto

## Paso 3: Crear las Tablas de la Base de Datos

1. En el menú lateral, ve a **"SQL Editor"**
2. Haz clic en **"New query"**
3. Copia y pega el siguiente código SQL:

```sql
-- Tabla de medicamentos
CREATE TABLE medicamentos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  dosis TEXT NOT NULL,
  frecuencia TEXT NOT NULL,
  horarios TEXT[] NOT NULL,
  numero_pastillas NUMERIC,
  imagen_url TEXT,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  notas TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de tomas de medicamentos
CREATE TABLE tomas (
  id TEXT PRIMARY KEY,
  medicamento_id TEXT NOT NULL REFERENCES medicamentos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hora TEXT NOT NULL,
  tomado BOOLEAN DEFAULT true,
  notas_toma TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de paciente (opcional, para futuras funcionalidades)
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  edad INTEGER,
  alergias TEXT[],
  condiciones TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_medicamentos_activo ON medicamentos(activo);
CREATE INDEX idx_tomas_fecha ON tomas(fecha DESC);
CREATE INDEX idx_tomas_medicamento ON tomas(medicamento_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para medicamentos
CREATE TRIGGER update_medicamentos_updated_at
  BEFORE UPDATE ON medicamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para pacientes
CREATE TRIGGER update_pacientes_updated_at
  BEFORE UPDATE ON pacientes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS) - Importante para seguridad
ALTER TABLE medicamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tomas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;

-- Políticas públicas (ajusta según necesites autenticación)
-- IMPORTANTE: Estas políticas permiten acceso total sin autenticación
-- Para producción, deberías agregar autenticación de usuarios

CREATE POLICY "Permitir lectura pública de medicamentos"
  ON medicamentos FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserción pública de medicamentos"
  ON medicamentos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir actualización pública de medicamentos"
  ON medicamentos FOR UPDATE
  USING (true);

CREATE POLICY "Permitir eliminación pública de medicamentos"
  ON medicamentos FOR DELETE
  USING (true);

CREATE POLICY "Permitir lectura pública de tomas"
  ON tomas FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserción pública de tomas"
  ON tomas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir actualización pública de tomas"
  ON tomas FOR UPDATE
  USING (true);

CREATE POLICY "Permitir eliminación pública de tomas"
  ON tomas FOR DELETE
  USING (true);

CREATE POLICY "Permitir lectura pública de pacientes"
  ON pacientes FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserción pública de pacientes"
  ON pacientes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir actualización pública de pacientes"
  ON pacientes FOR UPDATE
  USING (true);
```

4. Haz clic en **"Run"** o presiona `Ctrl + Enter`
5. Deberías ver el mensaje "Success. No rows returned"

## Paso 4: Obtener las Credenciales

1. En el menú lateral, ve a **"Project Settings"** (ícono de engranaje)
2. Haz clic en **"API"**
3. Copia los siguientes valores:
   - **Project URL**: Algo como `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public**: Una clave larga que empieza con `eyJ...`

## Paso 5: Configurar Variables de Entorno

1. En la raíz de tu proyecto, crea un archivo llamado `.env`
2. Copia el contenido del archivo `.env.example`
3. Reemplaza los valores con tus credenciales:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Guarda el archivo

## Paso 6: Reiniciar el Servidor de Desarrollo

1. Detén el servidor actual (Ctrl + C en la terminal)
2. Ejecuta nuevamente:
```bash
npm run dev
```

3. La aplicación ahora debería conectarse a Supabase
4. El banner amarillo "Usando almacenamiento local" debería desaparecer

## Paso 7: Verificar que Funciona

1. Agrega un medicamento desde la aplicación
2. Ve a Supabase Dashboard > **Table Editor** > **medicamentos**
3. Deberías ver el medicamento que acabas de agregar

## ¡Listo! 🎉

Tu aplicación ahora está usando Supabase como base de datos en la nube.

---

## Funcionalidades Adicionales (Opcional)

### Ver tus datos en tiempo real

1. Ve a Supabase Dashboard > **Table Editor**
2. Selecciona la tabla `medicamentos` o `tomas`
3. Puedes ver, editar y eliminar datos directamente desde aquí

### Exportar datos

1. Ve a **Table Editor** > selecciona tu tabla
2. Haz clic en el botón de exportar (arriba a la derecha)
3. Descarga como CSV

### Agregar Autenticación (Recomendado para producción)

Si quieres que cada usuario tenga sus propios medicamentos:

1. Sigue la guía en los comentarios del código
2. Modifica las políticas RLS para filtrar por `user_id`
3. Agrega autenticación con email/password o Google

---

## Troubleshooting

### Error: "Failed to fetch"
- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de haber reiniciado el servidor después de crear el `.env`

### Los datos no aparecen
- Verifica que las tablas se crearon correctamente en Supabase
- Revisa la consola del navegador (F12) para ver errores

### "No rows returned"
- Es normal si las tablas están vacías
- Agrega un medicamento y vuelve a verificar

---

## Próximos Pasos

1. Despliega en Vercel (ver `DEPLOY.md`)
2. Agrega autenticación de usuarios
3. Implementa notificaciones push
4. Crea la aplicación móvil con React Native
