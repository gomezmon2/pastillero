# Migración: Agregar campo número de pastillas

Si ya tienes la base de datos de Supabase creada, necesitas agregar el nuevo campo `numero_pastillas` a la tabla de medicamentos.

## Opción 1: SQL Editor en Supabase (Recomendado)

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. En el menú lateral, haz clic en **"SQL Editor"**
3. Haz clic en **"New query"**
4. Copia y pega el siguiente código:

```sql
-- Agregar columna numero_pastillas a la tabla medicamentos
ALTER TABLE medicamentos
ADD COLUMN IF NOT EXISTS numero_pastillas NUMERIC;

-- Opcional: Establecer valor por defecto de 1 para registros existentes
UPDATE medicamentos
SET numero_pastillas = 1
WHERE numero_pastillas IS NULL;
```

5. Haz clic en **"Run"** o presiona `Ctrl + Enter`
6. Deberías ver el mensaje "Success. No rows returned"

## Opción 2: Table Editor

1. Ve a tu proyecto en Supabase
2. En el menú lateral, haz clic en **"Table Editor"**
3. Selecciona la tabla `medicamentos`
4. Haz clic en el botón **"+ New Column"** (arriba a la derecha)
5. Configura:
   - **Name**: `numero_pastillas`
   - **Type**: `numeric` o `decimal`
   - **Default value**: (dejar vacío o poner `1`)
   - **Is nullable**: Sí (marcar checkbox)
6. Haz clic en **"Save"**

## Verificar la migración

1. Ve a **Table Editor** > `medicamentos`
2. Deberías ver la nueva columna `numero_pastillas`
3. Agrega un nuevo medicamento desde la app y verifica que se guarde correctamente

## Notas

- **No perderás datos**: Esta migración solo agrega una nueva columna
- **Compatible con registros antiguos**: Los medicamentos existentes funcionarán normalmente (el campo aparecerá vacío o con valor 1)
- **Opcional**: El campo es opcional, por lo que puedes dejarlo vacío si no quieres especificar número de pastillas

## Rollback (Deshacer cambios)

Si necesitas eliminar la columna por alguna razón:

```sql
ALTER TABLE medicamentos
DROP COLUMN IF EXISTS numero_pastillas;
```

⚠️ **Advertencia**: Esto eliminará permanentemente todos los datos en esta columna.

---

## Para usuarios nuevos

Si estás configurando Supabase por primera vez, no necesitas esta migración. Usa directamente el script SQL actualizado en [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) que ya incluye el campo `numero_pastillas`.
