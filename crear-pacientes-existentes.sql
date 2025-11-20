-- Script para crear registros de pacientes para usuarios ya existentes
-- Ejecutar DESPUÉS de ejecutar supabase-migrations.sql

-- Este script crea un registro de paciente para cada usuario que no tenga uno
INSERT INTO public.pacientes (user_id, nombre)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'nombre', u.email) as nombre
FROM auth.users u
LEFT JOIN public.pacientes p ON p.user_id = u.id
WHERE p.user_id IS NULL;

-- Verificar que se crearon correctamente
SELECT
  u.email,
  p.nombre,
  p.user_id
FROM auth.users u
LEFT JOIN public.pacientes p ON p.user_id = u.id;
