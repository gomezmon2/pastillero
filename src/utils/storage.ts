import type { Medicamento, TomaMedicamento, Paciente } from '../types';

const STORAGE_KEYS = {
  MEDICAMENTOS: 'pastillero_medicamentos',
  TOMAS: 'pastillero_tomas',
  PACIENTE: 'pastillero_paciente',
};

export const storage = {
  // Medicamentos
  getMedicamentos: (): Medicamento[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MEDICAMENTOS);
    return data ? JSON.parse(data) : [];
  },

  saveMedicamentos: (medicamentos: Medicamento[]): void => {
    localStorage.setItem(STORAGE_KEYS.MEDICAMENTOS, JSON.stringify(medicamentos));
  },

  addMedicamento: (medicamento: Medicamento): void => {
    const medicamentos = storage.getMedicamentos();
    medicamentos.push(medicamento);
    storage.saveMedicamentos(medicamentos);
  },

  updateMedicamento: (id: string, medicamento: Partial<Medicamento>): void => {
    const medicamentos = storage.getMedicamentos();
    const index = medicamentos.findIndex(m => m.id === id);
    if (index !== -1) {
      medicamentos[index] = { ...medicamentos[index], ...medicamento };
      storage.saveMedicamentos(medicamentos);
    }
  },

  deleteMedicamento: (id: string): void => {
    const medicamentos = storage.getMedicamentos().filter(m => m.id !== id);
    storage.saveMedicamentos(medicamentos);
  },

  // Tomas
  getTomas: (): TomaMedicamento[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TOMAS);
    return data ? JSON.parse(data) : [];
  },

  saveTomas: (tomas: TomaMedicamento[]): void => {
    localStorage.setItem(STORAGE_KEYS.TOMAS, JSON.stringify(tomas));
  },

  addToma: (toma: TomaMedicamento): void => {
    const tomas = storage.getTomas();
    tomas.push(toma);
    storage.saveTomas(tomas);
  },

  updateToma: (id: string, toma: Partial<TomaMedicamento>): void => {
    const tomas = storage.getTomas();
    const index = tomas.findIndex(t => t.id === id);
    if (index !== -1) {
      tomas[index] = { ...tomas[index], ...toma };
      storage.saveTomas(tomas);
    }
  },

  deleteToma: (id: string): void => {
    const tomas = storage.getTomas().filter(t => t.id !== id);
    storage.saveTomas(tomas);
  },

  // Paciente
  getPaciente: (): Paciente | null => {
    const data = localStorage.getItem(STORAGE_KEYS.PACIENTE);
    return data ? JSON.parse(data) : null;
  },

  savePaciente: (paciente: Paciente): void => {
    localStorage.setItem(STORAGE_KEYS.PACIENTE, JSON.stringify(paciente));
  },
};
