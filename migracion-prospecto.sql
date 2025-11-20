-- Migración para agregar información de prospecto a medicamentos
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar columna JSONB para almacenar información del prospecto
ALTER TABLE medicamentos
ADD COLUMN IF NOT EXISTS prospecto JSONB;

-- 2. Crear índice GIN para búsquedas eficientes en el campo JSON
CREATE INDEX IF NOT EXISTS idx_medicamentos_prospecto
ON medicamentos USING GIN (prospecto);

-- 3. Agregar comentarios para documentar la estructura
COMMENT ON COLUMN medicamentos.prospecto IS
'Información del prospecto del medicamento en formato JSON:
{
  "principioActivo": "string",
  "laboratorio": "string",
  "indicaciones": "string",
  "contraindicaciones": "string",
  "efectosSecundarios": "string",
  "dosificacion": "string",
  "interacciones": "string",
  "urlProspecto": "string"
}';

-- 4. Ejemplo de cómo actualizar un medicamento con prospecto
-- UPDATE medicamentos
-- SET prospecto = '{
--   "principioActivo": "Paracetamol",
--   "laboratorio": "Laboratorio XYZ",
--   "indicaciones": "Dolor y fiebre",
--   "contraindicaciones": "Hipersensibilidad",
--   "efectosSecundarios": "Raros",
--   "dosificacion": "500mg cada 6h",
--   "interacciones": "Ninguna conocida",
--   "urlProspecto": "https://ejemplo.com/prospecto.pdf"
-- }'::jsonb
-- WHERE id = 'ID_DEL_MEDICAMENTO';

-- 5. Consulta de ejemplo para buscar por principio activo
-- SELECT id, nombre, prospecto->>'principioActivo' as principio_activo
-- FROM medicamentos
-- WHERE prospecto->>'principioActivo' ILIKE '%paracetamol%';

-- 6. Verificar medicamentos con prospecto
SELECT
  id,
  nombre,
  prospecto->>'principioActivo' as principio_activo,
  prospecto->>'laboratorio' as laboratorio
FROM medicamentos
WHERE prospecto IS NOT NULL
ORDER BY nombre;
