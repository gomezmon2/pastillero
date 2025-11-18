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
