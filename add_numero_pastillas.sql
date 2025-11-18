-- ============================================
-- Migración: Agregar campo numero_pastillas
-- Fecha: 2025-11-18
-- Descripción: Agrega el campo para especificar
--              cuántas pastillas se toman por dosis
-- ============================================

-- Agregar la columna numero_pastillas a la tabla medicamentos
ALTER TABLE medicamentos
ADD COLUMN IF NOT EXISTS numero_pastillas NUMERIC;

-- Comentario para documentar la columna
COMMENT ON COLUMN medicamentos.numero_pastillas IS 'Número de pastillas por toma (ej: 1, 2, 0.5 para media pastilla)';

-- Opcional: Establecer valor por defecto de 1 para registros existentes
-- Esto solo afecta a medicamentos que ya están en la base de datos
UPDATE medicamentos
SET numero_pastillas = 1
WHERE numero_pastillas IS NULL;

-- Verificar que la columna se agregó correctamente
-- Ejecuta esto para ver la estructura de la tabla:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'medicamentos'
-- ORDER BY ordinal_position;
