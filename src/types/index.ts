export interface ProspectoMedicamento {
  principioActivo?: string;
  laboratorio?: string;
  indicaciones?: string;
  contraindicaciones?: string;
  efectosSecundarios?: string;
  dosificacion?: string;
  interacciones?: string;
  urlProspecto?: string; // URL del PDF del prospecto oficial
}

export interface Medicamento {
  id: string;
  nombre: string;
  dosis: string;
  frecuencia: string; // ej: "Cada 8 horas", "Diario", etc.
  horarios: string[]; // ["08:00", "16:00", "00:00"]
  numeroPastillas?: number; // Número de pastillas por toma (ej: 1, 2, 0.5)
  imagenUrl?: string; // URL de la imagen del medicamento
  fechaInicio: string;
  fechaFin?: string;
  notas?: string;
  activo: boolean;
  prospecto?: ProspectoMedicamento; // Información del prospecto
}

export interface TomaMedicamento {
  id: string;
  medicamentoId: string;
  fecha: string;
  hora: string;
  tomado: boolean;
  notasToma?: string;
}

export interface Paciente {
  nombre: string;
  edad?: number;
  alergias?: string[];
  condiciones?: string[];
}

export interface Usuario {
  id: string;
  email: string;
  nombre?: string;
  createdAt: string;
}

export interface AuthState {
  usuario: Usuario | null;
  cargando: boolean;
  error: string | null;
}
