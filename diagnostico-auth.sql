-- Script de diagnóstico para problemas de autenticación
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar usuarios existentes
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- 2. Verificar si hay registros en la tabla pacientes
SELECT
  p.id,
  p.user_id,
  p.nombre,
  u.email
FROM public.pacientes p
LEFT JOIN auth.users u ON u.id = p.user_id
ORDER BY p.created_at DESC;

-- 3. Verificar medicamentos asociados a usuarios
SELECT
  m.id,
  m.nombre,
  m.user_id,
  u.email
FROM public.medicamentos m
LEFT JOIN auth.users u ON u.id = m.user_id
ORDER BY m.created_at DESC;

-- 4. Verificar políticas RLS activas en medicamentos
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('medicamentos', 'tomas', 'pacientes')
ORDER BY tablename, policyname;

-- 5. Verificar que RLS está habilitado
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('medicamentos', 'tomas', 'pacientes');

-- 6. Si necesitas resetear la contraseña de un usuario específico
-- (NO ejecutar aún - solo si es necesario)
-- UPDATE auth.users
-- SET encrypted_password = crypt('nueva_contraseña_aqui', gen_salt('bf'))
-- WHERE email = 'tu_email@ejemplo.com';
