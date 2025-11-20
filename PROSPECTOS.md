# Funcionalidad de Prospectos de Medicamentos

## Descripción

Se ha implementado una funcionalidad completa para buscar, guardar y consultar información de prospectos de medicamentos directamente en la aplicación.

## Características

### 1. Búsqueda Automática de Prospectos

La aplicación puede buscar información de medicamentos en múltiples fuentes:

- **Base de datos local**: Medicamentos comunes en español (paracetamol, ibuprofeno, amoxicilina, etc.)
- **CIMA** (Agencia Española de Medicamentos): Base de datos oficial de España
- **OpenFDA**: Base de datos de la FDA de Estados Unidos

### 2. Información del Prospecto

Para cada medicamento se puede almacenar:

- ✅ **Principio activo**: Sustancia farmacéutica activa
- ✅ **Laboratorio**: Fabricante del medicamento
- ✅ **Indicaciones**: Para qué se utiliza el medicamento
- ✅ **Contraindicaciones**: Cuándo NO debe usarse
- ✅ **Efectos secundarios**: Posibles reacciones adversas
- ✅ **Dosificación**: Cómo y cuánto tomar
- ✅ **Interacciones**: Qué medicamentos o alimentos evitar
- ✅ **URL del prospecto**: Enlace al PDF oficial

## Cómo Usar

### Paso 1: Configurar la Base de Datos

Ejecuta el script SQL en Supabase SQL Editor:

```sql
-- Archivo: migracion-prospecto.sql
ALTER TABLE medicamentos
ADD COLUMN IF NOT EXISTS prospecto JSONB;

CREATE INDEX IF NOT EXISTS idx_medicamentos_prospecto
ON medicamentos USING GIN (prospecto);
```

### Paso 2: Buscar Prospecto al Crear/Editar Medicamento

1. **Ingresa el nombre del medicamento** en el formulario
2. Haz clic en el botón **"🔍 Buscar información del medicamento"**
3. La app buscará automáticamente en las bases de datos disponibles
4. Si encuentra información, se mostrará un resumen
5. Haz clic en **"✓ Guardar información"** para asociarla al medicamento

### Paso 3: Ver el Prospecto

Una vez guardado el medicamento con prospecto:

1. En la lista de medicamentos, verás un botón **"📋 Ver prospecto"**
2. Haz clic para abrir el modal con toda la información
3. Navega entre las diferentes secciones (indicaciones, dosificación, etc.)
4. Si hay un PDF oficial, puedes descargarlo

## Medicamentos en Base de Datos Local

Los siguientes medicamentos tienen información pre-cargada:

- **Paracetamol** (Acetaminofén)
- **Ibuprofeno**
- **Amoxicilina**
- **Omeprazol**
- **Atorvastatina**
- **Metformina**
- **Enalapril**
- **Salbutamol**

## Estructura de Datos

El prospecto se guarda en formato JSON:

```json
{
  "principioActivo": "Paracetamol",
  "laboratorio": "Laboratorio XYZ",
  "indicaciones": "Dolor leve a moderado, fiebre",
  "contraindicaciones": "Hipersensibilidad, insuficiencia hepática grave",
  "efectosSecundarios": "Raros: reacciones alérgicas",
  "dosificacion": "Adultos: 500-1000 mg cada 6-8 horas",
  "interacciones": "Precaución con alcohol",
  "urlProspecto": "https://ejemplo.com/prospecto.pdf"
}
```

## Componentes Creados

### Frontend

1. **ProspectoView.tsx**: Modal para visualizar el prospecto completo
2. **ProspectoSearch.tsx**: Componente de búsqueda integrado en el formulario
3. **ProspectoView.css**: Estilos del modal
4. **ProspectoSearch.css**: Estilos del buscador

### Backend/Servicios

1. **medicamentoSearchService.ts**: Servicio de búsqueda en múltiples fuentes
2. **types/index.ts**: Interfaz `ProspectoMedicamento`

### Base de Datos

1. **migracion-prospecto.sql**: Script para agregar columna JSONB
2. **supabaseStorage.ts**: Actualizado para manejar prospectos

## APIs Utilizadas

### CIMA (España)
```
https://cima.aemps.es/cima/rest/medicamentos?nombre={nombre}
```

### OpenFDA (EE.UU.)
```
https://api.fda.gov/drug/label.json?search=openfda.brand_name:"{nombre}"&limit=1
```

## Ejemplos de Uso

### Buscar Paracetamol

```typescript
import { medicamentoSearchService } from './utils/medicamentoSearchService';

const prospecto = await medicamentoSearchService.buscarProspecto('paracetamol');

console.log(prospecto);
// {
//   principioActivo: "Paracetamol",
//   indicaciones: "Analgésico y antipirético...",
//   dosificacion: "Adultos: 500-1000 mg cada 6-8 horas",
//   ...
// }
```

### Obtener Sugerencias

```typescript
const sugerencias = medicamentoSearchService.obtenerSugerencias('para');
// ["paracetamol"]
```

## Consultas SQL Útiles

### Ver medicamentos con prospecto

```sql
SELECT
  id,
  nombre,
  prospecto->>'principioActivo' as principio_activo,
  prospecto->>'laboratorio' as laboratorio
FROM medicamentos
WHERE prospecto IS NOT NULL
ORDER BY nombre;
```

### Buscar por principio activo

```sql
SELECT id, nombre
FROM medicamentos
WHERE prospecto->>'principioActivo' ILIKE '%paracetamol%';
```

### Actualizar prospecto manualmente

```sql
UPDATE medicamentos
SET prospecto = '{
  "principioActivo": "Paracetamol",
  "laboratorio": "Laboratorio XYZ",
  "indicaciones": "Dolor y fiebre",
  "dosificacion": "500mg cada 6h"
}'::jsonb
WHERE id = 'ID_DEL_MEDICAMENTO';
```

## Notas Importantes

⚠️ **Disclaimer Médico**: La información proporcionada es solo de referencia. Siempre consulta con un profesional de la salud antes de tomar cualquier medicamento.

💡 **Mejoras Futuras**:
- Agregar más medicamentos a la base local
- Integrar con más APIs farmacéuticas
- Búsqueda por código nacional (CN)
- Alertas de interacciones entre medicamentos
- Traducción automática de prospectos en inglés

## Solución de Problemas

### La búsqueda no encuentra el medicamento

1. Verifica que el nombre esté escrito correctamente
2. Prueba con el nombre genérico en lugar del comercial (ej: "paracetamol" en lugar de "Tylenol")
3. Algunos medicamentos pueden no estar en las bases de datos públicas

### Error de CORS en las APIs

Las APIs de CIMA y OpenFDA pueden tener restricciones CORS. Si esto ocurre:
- La app intentará con la siguiente fuente automáticamente
- Puedes agregar el medicamento manualmente a la base de datos local

### El prospecto no se guarda

1. Verifica que ejecutaste la migración SQL: `migracion-prospecto.sql`
2. Comprueba que el campo `prospecto` existe en la tabla `medicamentos`
3. Revisa la consola del navegador (F12) para ver errores

## Licencia y Fuentes de Datos

- **CIMA**: Datos oficiales de la Agencia Española de Medicamentos y Productos Sanitarios
- **OpenFDA**: Datos públicos de la FDA (Food and Drug Administration) de EE.UU.
- Los datos locales son informativos y deben verificarse con fuentes oficiales
