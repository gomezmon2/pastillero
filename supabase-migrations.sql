-- Migración para agregar soporte de usuarios a las tablas existentes
-- Ejecutar estos comandos en el SQL Editor de Supabase

-- 1. Agregar columna user_id a la tabla medicamentos
ALTER TABLE medicamentos
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Crear índice para user_id en medicamentos
CREATE INDEX IF NOT EXISTS idx_medicamentos_user_id ON medicamentos(user_id);

-- 3. Agregar columna user_id a la tabla tomas
ALTER TABLE tomas
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Crear índice para user_id en tomas
CREATE INDEX IF NOT EXISTS idx_tomas_user_id ON tomas(user_id);

-- 5. Habilitar Row Level Security (RLS) en medicamentos
ALTER TABLE medicamentos ENABLE ROW LEVEL SECURITY;

-- 6. Eliminar políticas existentes de medicamentos (si existen)
DROP POLICY IF EXISTS "Los usuarios solo pueden ver sus propios medicamentos" ON medicamentos;
DROP POLICY IF EXISTS "Los usuarios solo pueden crear sus propios medicamentos" ON medicamentos;
DROP POLICY IF EXISTS "Los usuarios solo pueden actualizar sus propios medicamentos" ON medicamentos;
DROP POLICY IF EXISTS "Los usuarios solo pueden eliminar sus propios medicamentos" ON medicamentos;

-- 7. Crear política para que los usuarios solo vean sus propios medicamentos
CREATE POLICY "Los usuarios solo pueden ver sus propios medicamentos"
ON medicamentos FOR SELECT
USING (auth.uid() = user_id);

-- 8. Crear política para que los usuarios solo puedan insertar sus propios medicamentos
CREATE POLICY "Los usuarios solo pueden crear sus propios medicamentos"
ON medicamentos FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 9. Crear política para que los usuarios solo puedan actualizar sus propios medicamentos
CREATE POLICY "Los usuarios solo pueden actualizar sus propios medicamentos"
ON medicamentos FOR UPDATE
USING (auth.uid() = user_id);

-- 10. Crear política para que los usuarios solo puedan eliminar sus propios medicamentos
CREATE POLICY "Los usuarios solo pueden eliminar sus propios medicamentos"
ON medicamentos FOR DELETE
USING (auth.uid() = user_id);

-- 11. Habilitar Row Level Security (RLS) en tomas
ALTER TABLE tomas ENABLE ROW LEVEL SECURITY;

-- 12. Eliminar políticas existentes de tomas (si existen)
DROP POLICY IF EXISTS "Los usuarios solo pueden ver sus propias tomas" ON tomas;
DROP POLICY IF EXISTS "Los usuarios solo pueden crear sus propias tomas" ON tomas;
DROP POLICY IF EXISTS "Los usuarios solo pueden actualizar sus propias tomas" ON tomas;
DROP POLICY IF EXISTS "Los usuarios solo pueden eliminar sus propias tomas" ON tomas;

-- 13. Crear política para que los usuarios solo vean sus propias tomas
CREATE POLICY "Los usuarios solo pueden ver sus propias tomas"
ON tomas FOR SELECT
USING (auth.uid() = user_id);

-- 14. Crear política para que los usuarios solo puedan insertar sus propias tomas
CREATE POLICY "Los usuarios solo pueden crear sus propias tomas"
ON tomas FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 15. Crear política para que los usuarios solo puedan actualizar sus propias tomas
CREATE POLICY "Los usuarios solo pueden actualizar sus propias tomas"
ON tomas FOR UPDATE
USING (auth.uid() = user_id);

-- 16. Crear política para que los usuarios solo puedan eliminar sus propias tomas
CREATE POLICY "Los usuarios solo pueden eliminar sus propias tomas"
ON tomas FOR DELETE
USING (auth.uid() = user_id);

-- 17. Agregar columna user_id a la tabla pacientes (si existe)
ALTER TABLE pacientes
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE;

-- 18. Crear índice para user_id en pacientes
CREATE INDEX IF NOT EXISTS idx_pacientes_user_id ON pacientes(user_id);

-- 19. Habilitar Row Level Security (RLS) en pacientes
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;

-- 20. Eliminar políticas existentes de pacientes (si existen)
DROP POLICY IF EXISTS "Los usuarios solo pueden ver su propio perfil" ON pacientes;
DROP POLICY IF EXISTS "Los usuarios solo pueden crear su propio perfil" ON pacientes;
DROP POLICY IF EXISTS "Los usuarios solo pueden actualizar su propio perfil" ON pacientes;
DROP POLICY IF EXISTS "Los usuarios solo pueden eliminar su propio perfil" ON pacientes;

-- 21. Crear políticas para pacientes
CREATE POLICY "Los usuarios solo pueden ver su propio perfil"
ON pacientes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios solo pueden crear su propio perfil"
ON pacientes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios solo pueden actualizar su propio perfil"
ON pacientes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios solo pueden eliminar su propio perfil"
ON pacientes FOR DELETE
USING (auth.uid() = user_id);

-- 22. Crear función para crear automáticamente un perfil de paciente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.pacientes (user_id, nombre)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'nombre', new.email));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 23. Crear trigger para ejecutar la función automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Opcional: Si necesitas migrar datos existentes a un usuario específico
-- Reemplaza 'USER_ID_AQUI' con el ID del usuario al que quieres asignar los datos
-- UPDATE medicamentos SET user_id = 'USER_ID_AQUI' WHERE user_id IS NULL;
-- UPDATE tomas SET user_id = 'USER_ID_AQUI' WHERE user_id IS NULL;
