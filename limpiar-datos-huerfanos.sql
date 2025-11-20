-- Script para limpiar datos huérfanos (sin usuario válido)
-- Ejecutar ANTES de habilitar RLS si hay datos inconsistentes

-- 1. Ver medicamentos sin usuario válido
SELECT m.id, m.nombre, m.user_id
FROM medicamentos m
LEFT JOIN auth.users u ON u.id = m.user_id
WHERE u.id IS NULL AND m.user_id IS NOT NULL;

-- 2. Ver tomas sin usuario válido
SELECT t.id, t.medicamento_id, t.user_id
FROM tomas t
LEFT JOIN auth.users u ON u.id = t.user_id
WHERE u.id IS NULL AND t.user_id IS NOT NULL;

-- 3. OPCIÓN A: Eliminar medicamentos huérfanos (sin usuario válido)
-- ⚠️ CUIDADO: Esto eliminará los medicamentos permanentemente
-- DELETE FROM medicamentos m
-- WHERE NOT EXISTS (
--   SELECT 1 FROM auth.users u WHERE u.id = m.user_id
-- ) AND m.user_id IS NOT NULL;

-- 4. OPCIÓN B: Asignar medicamentos huérfanos a un usuario específico
-- Primero, obtén el ID de un usuario válido:
SELECT id, email FROM auth.users LIMIT 5;

-- Luego, reemplaza 'USER_ID_VALIDO' con uno de los IDs de arriba:
-- UPDATE medicamentos
-- SET user_id = 'USER_ID_VALIDO'
-- WHERE user_id NOT IN (SELECT id FROM auth.users)
--    OR user_id IS NULL;

-- 5. OPCIÓN C: Establecer user_id a NULL temporalmente (para migración manual)
-- UPDATE medicamentos SET user_id = NULL
-- WHERE user_id NOT IN (SELECT id FROM auth.users);

-- 6. Limpiar tomas huérfanas
-- DELETE FROM tomas t
-- WHERE NOT EXISTS (
--   SELECT 1 FROM auth.users u WHERE u.id = t.user_id
-- ) AND t.user_id IS NOT NULL;

-- 7. Verificar que no queden datos huérfanos
SELECT 'Medicamentos huérfanos' as tipo, COUNT(*) as cantidad
FROM medicamentos m
WHERE m.user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = m.user_id)
UNION ALL
SELECT 'Tomas huérfanas' as tipo, COUNT(*) as cantidad
FROM tomas t
WHERE t.user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = t.user_id);
