import type { ProspectoMedicamento } from '../types';

/**
 * Servicio para buscar información de medicamentos
 * Utiliza APIs públicas de información farmacéutica
 */

interface OpenFDAResult {
  results?: Array<{
    openfda?: {
      brand_name?: string[];
      generic_name?: string[];
      manufacturer_name?: string[];
    };
    indications_and_usage?: string[];
    contraindications?: string[];
    adverse_reactions?: string[];
    dosage_and_administration?: string[];
    drug_interactions?: string[];
  }>;
}

/**
 * Busca información del medicamento en OpenFDA (base de datos de la FDA de EE.UU.)
 */
const buscarEnOpenFDA = async (nombreMedicamento: string): Promise<ProspectoMedicamento | null> => {
  try {
    const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(nombreMedicamento)}"&limit=1`;

    const response = await fetch(url);
    if (!response.ok) {
      console.log('No se encontró en OpenFDA');
      return null;
    }

    const data: OpenFDAResult = await response.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    const medicamento = data.results[0];
    const openfda = medicamento.openfda;

    return {
      principioActivo: openfda?.generic_name?.[0] || undefined,
      laboratorio: openfda?.manufacturer_name?.[0] || undefined,
      indicaciones: medicamento.indications_and_usage?.[0] || undefined,
      contraindicaciones: medicamento.contraindications?.[0] || undefined,
      efectosSecundarios: medicamento.adverse_reactions?.[0] || undefined,
      dosificacion: medicamento.dosage_and_administration?.[0] || undefined,
      interacciones: medicamento.drug_interactions?.[0] || undefined,
    };
  } catch (error) {
    console.error('Error al buscar en OpenFDA:', error);
    return null;
  }
};

/**
 * Busca información del medicamento en CIMA (Agencia Española de Medicamentos)
 */
const buscarEnCIMA = async (nombreMedicamento: string): Promise<ProspectoMedicamento | null> => {
  try {
    // CIMA API endpoint para buscar medicamentos
    const searchUrl = `https://cima.aemps.es/cima/rest/medicamentos?nombre=${encodeURIComponent(nombreMedicamento)}`;

    const response = await fetch(searchUrl);
    if (!response.ok) {
      console.log('No se encontró en CIMA');
      return null;
    }

    const data = await response.json();

    if (!data.resultados || data.resultados.length === 0) {
      return null;
    }

    // Tomar el primer resultado
    const medicamento = data.resultados[0];

    return {
      principioActivo: medicamento.principiosActivos || undefined,
      laboratorio: medicamento.laboratorio || undefined,
      // CIMA proporciona un número de registro que puede usarse para obtener más detalles
      urlProspecto: medicamento.docs?.[0]?.url || undefined,
    };
  } catch (error) {
    console.error('Error al buscar en CIMA:', error);
    return null;
  }
};

/**
 * Búsqueda local simple basada en nombre
 * Base de datos local de medicamentos comunes
 */
const medicamentosComunes: Record<string, ProspectoMedicamento> = {
  'paracetamol': {
    principioActivo: 'Paracetamol',
    indicaciones: 'Analgésico y antipirético. Se utiliza para aliviar dolores leves a moderados y reducir la fiebre.',
    contraindicaciones: 'Hipersensibilidad al paracetamol. Insuficiencia hepática grave.',
    efectosSecundarios: 'Raros: reacciones alérgicas, alteraciones hepáticas en dosis altas.',
    dosificacion: 'Adultos: 500-1000 mg cada 6-8 horas. Dosis máxima: 4000 mg/día.',
  },
  'ibuprofeno': {
    principioActivo: 'Ibuprofeno',
    indicaciones: 'Antiinflamatorio no esteroideo (AINE). Dolor leve a moderado, inflamación, fiebre.',
    contraindicaciones: 'Úlcera péptica activa, insuficiencia cardíaca grave, tercer trimestre de embarazo.',
    efectosSecundarios: 'Molestias gastrointestinales, náuseas, dolor abdominal. Raramente: úlcera gástrica.',
    dosificacion: 'Adultos: 200-400 mg cada 6-8 horas. Dosis máxima: 1200-2400 mg/día.',
    interacciones: 'No combinar con otros AINES. Precaución con anticoagulantes.',
  },
  'amoxicilina': {
    principioActivo: 'Amoxicilina',
    indicaciones: 'Antibiótico betalactámico. Infecciones bacterianas: respiratorias, urinarias, piel.',
    contraindicaciones: 'Alergia a penicilinas o betalactámicos.',
    efectosSecundarios: 'Diarrea, náuseas, erupciones cutáneas. Raramente: reacciones alérgicas graves.',
    dosificacion: 'Adultos: 250-500 mg cada 8 horas o 500-875 mg cada 12 horas según infección.',
  },
  'omeprazol': {
    principioActivo: 'Omeprazol',
    indicaciones: 'Inhibidor de la bomba de protones. Úlcera gástrica y duodenal, reflujo gastroesofágico.',
    contraindicaciones: 'Hipersensibilidad al omeprazol.',
    efectosSecundarios: 'Cefalea, dolor abdominal, náuseas, diarrea o estreñimiento.',
    dosificacion: 'Adultos: 20-40 mg una vez al día, preferiblemente por la mañana.',
  },
  'atorvastatina': {
    principioActivo: 'Atorvastatina',
    indicaciones: 'Estatina. Hipercolesterolemia, prevención de eventos cardiovasculares.',
    contraindicaciones: 'Enfermedad hepática activa, embarazo, lactancia.',
    efectosSecundarios: 'Dolor muscular, cefalea, molestias gastrointestinales.',
    dosificacion: 'Adultos: 10-80 mg una vez al día.',
    interacciones: 'Evitar zumo de pomelo. Precaución con otros medicamentos que afecten el hígado.',
  },
  'metformina': {
    principioActivo: 'Metformina',
    indicaciones: 'Antidiabético oral. Diabetes mellitus tipo 2.',
    contraindicaciones: 'Insuficiencia renal grave, acidosis metabólica.',
    efectosSecundarios: 'Molestias gastrointestinales (diarrea, náuseas), sabor metálico.',
    dosificacion: 'Adultos: iniciar con 500 mg, aumentar gradualmente. Dosis usual: 1000-2000 mg/día.',
  },
  'enalapril': {
    principioActivo: 'Enalapril',
    indicaciones: 'Inhibidor de la ECA. Hipertensión arterial, insuficiencia cardíaca.',
    contraindicaciones: 'Antecedentes de angioedema, embarazo.',
    efectosSecundarios: 'Tos seca, mareos, hipotensión, cefalea.',
    dosificacion: 'Adultos: iniciar con 5 mg/día. Dosis usual: 10-20 mg una o dos veces al día.',
  },
  'salbutamol': {
    principioActivo: 'Salbutamol',
    indicaciones: 'Broncodilatador beta-2 agonista. Asma, broncoespasmo.',
    contraindicaciones: 'Hipersensibilidad al salbutamol.',
    efectosSecundarios: 'Temblor, taquicardia, cefalea, calambres musculares.',
    dosificacion: 'Inhalado: 100-200 mcg según necesidad. Máximo: 8 inhalaciones/día.',
  },
};

const buscarEnBaseDatosLocal = (nombreMedicamento: string): ProspectoMedicamento | null => {
  const nombreNormalizado = nombreMedicamento.toLowerCase().trim();

  // Buscar coincidencia exacta
  if (medicamentosComunes[nombreNormalizado]) {
    return medicamentosComunes[nombreNormalizado];
  }

  // Buscar coincidencia parcial
  for (const [nombre, prospecto] of Object.entries(medicamentosComunes)) {
    if (nombreNormalizado.includes(nombre) || nombre.includes(nombreNormalizado)) {
      return prospecto;
    }
  }

  return null;
};

/**
 * Servicio principal de búsqueda de prospectos
 * Intenta buscar en múltiples fuentes en orden de prioridad
 */
export const medicamentoSearchService = {
  /**
   * Busca información del medicamento en múltiples fuentes
   * @param nombreMedicamento - Nombre del medicamento a buscar
   * @returns Información del prospecto o null si no se encuentra
   */
  buscarProspecto: async (nombreMedicamento: string): Promise<ProspectoMedicamento | null> => {
    console.log('Buscando información para:', nombreMedicamento);

    // 1. Primero buscar en base de datos local (más rápido)
    const resultadoLocal = buscarEnBaseDatosLocal(nombreMedicamento);
    if (resultadoLocal) {
      console.log('Encontrado en base de datos local');
      return resultadoLocal;
    }

    // 2. Buscar en CIMA (España) - datos en español
    try {
      const resultadoCIMA = await buscarEnCIMA(nombreMedicamento);
      if (resultadoCIMA) {
        console.log('Encontrado en CIMA');
        return resultadoCIMA;
      }
    } catch (error) {
      console.log('Error en CIMA, continuando con otras fuentes...');
    }

    // 3. Buscar en OpenFDA (EE.UU.) - datos en inglés
    try {
      const resultadoFDA = await buscarEnOpenFDA(nombreMedicamento);
      if (resultadoFDA) {
        console.log('Encontrado en OpenFDA');
        return resultadoFDA;
      }
    } catch (error) {
      console.log('Error en OpenFDA');
    }

    console.log('No se encontró información del medicamento');
    return null;
  },

  /**
   * Obtiene sugerencias de medicamentos basadas en el nombre
   */
  obtenerSugerencias: (nombreParcial: string): string[] => {
    const nombreNormalizado = nombreParcial.toLowerCase().trim();
    if (nombreNormalizado.length < 2) return [];

    return Object.keys(medicamentosComunes)
      .filter(nombre => nombre.includes(nombreNormalizado))
      .slice(0, 5);
  },
};
