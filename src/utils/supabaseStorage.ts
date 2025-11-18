import { supabase } from '../lib/supabase';
import type { Medicamento, TomaMedicamento, Paciente } from '../types';

export const supabaseStorage = {
  // Medicamentos
  getMedicamentos: async (): Promise<Medicamento[]> => {
    const { data, error } = await supabase
      .from('medicamentos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener medicamentos:', error);
      return [];
    }

    return data || [];
  },

  saveMedicamentos: async (medicamentos: Medicamento[]): Promise<void> => {
    // Esta función no se usa con Supabase ya que guardamos individualmente
    // La mantenemos por compatibilidad
    console.log('saveMedicamentos no se usa con Supabase');
  },

  addMedicamento: async (medicamento: Medicamento): Promise<Medicamento | null> => {
    const { data, error } = await supabase
      .from('medicamentos')
      .insert([{
        id: medicamento.id,
        nombre: medicamento.nombre,
        dosis: medicamento.dosis,
        frecuencia: medicamento.frecuencia,
        horarios: medicamento.horarios,
        fecha_inicio: medicamento.fechaInicio,
        fecha_fin: medicamento.fechaFin || null,
        notas: medicamento.notas || null,
        activo: medicamento.activo,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error al agregar medicamento:', error);
      return null;
    }

    // Convertir de formato BD a formato app
    return {
      id: data.id,
      nombre: data.nombre,
      dosis: data.dosis,
      frecuencia: data.frecuencia,
      horarios: data.horarios,
      fechaInicio: data.fecha_inicio,
      fechaFin: data.fecha_fin,
      notas: data.notas,
      activo: data.activo,
    };
  },

  updateMedicamento: async (id: string, medicamento: Partial<Medicamento>): Promise<void> => {
    const updateData: Record<string, unknown> = {};

    if (medicamento.nombre) updateData.nombre = medicamento.nombre;
    if (medicamento.dosis) updateData.dosis = medicamento.dosis;
    if (medicamento.frecuencia) updateData.frecuencia = medicamento.frecuencia;
    if (medicamento.horarios) updateData.horarios = medicamento.horarios;
    if (medicamento.fechaInicio) updateData.fecha_inicio = medicamento.fechaInicio;
    if (medicamento.fechaFin !== undefined) updateData.fecha_fin = medicamento.fechaFin;
    if (medicamento.notas !== undefined) updateData.notas = medicamento.notas;
    if (medicamento.activo !== undefined) updateData.activo = medicamento.activo;

    const { error } = await supabase
      .from('medicamentos')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error al actualizar medicamento:', error);
    }
  },

  deleteMedicamento: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('medicamentos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar medicamento:', error);
    }
  },

  // Tomas
  getTomas: async (): Promise<TomaMedicamento[]> => {
    const { data, error } = await supabase
      .from('tomas')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error al obtener tomas:', error);
      return [];
    }

    return (data || []).map((toma) => ({
      id: toma.id,
      medicamentoId: toma.medicamento_id,
      fecha: toma.fecha,
      hora: toma.hora,
      tomado: toma.tomado,
      notasToma: toma.notas_toma,
    }));
  },

  saveTomas: async (tomas: TomaMedicamento[]): Promise<void> => {
    // No se usa con Supabase
    console.log('saveTomas no se usa con Supabase');
  },

  addToma: async (toma: TomaMedicamento): Promise<void> => {
    const { error } = await supabase
      .from('tomas')
      .insert([{
        id: toma.id,
        medicamento_id: toma.medicamentoId,
        fecha: toma.fecha,
        hora: toma.hora,
        tomado: toma.tomado,
        notas_toma: toma.notasToma,
      }]);

    if (error) {
      console.error('Error al agregar toma:', error);
    }
  },

  updateToma: async (id: string, toma: Partial<TomaMedicamento>): Promise<void> => {
    const updateData: Record<string, unknown> = {};

    if (toma.tomado !== undefined) updateData.tomado = toma.tomado;
    if (toma.notasToma !== undefined) updateData.notas_toma = toma.notasToma;

    const { error } = await supabase
      .from('tomas')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error al actualizar toma:', error);
    }
  },

  // Paciente
  getPaciente: async (): Promise<Paciente | null> => {
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .single();

    if (error) {
      console.error('Error al obtener paciente:', error);
      return null;
    }

    return data ? {
      nombre: data.nombre,
      edad: data.edad,
      alergias: data.alergias,
      condiciones: data.condiciones,
    } : null;
  },

  savePaciente: async (paciente: Paciente): Promise<void> => {
    const { error } = await supabase
      .from('pacientes')
      .upsert([{
        nombre: paciente.nombre,
        edad: paciente.edad,
        alergias: paciente.alergias,
        condiciones: paciente.condiciones,
      }]);

    if (error) {
      console.error('Error al guardar paciente:', error);
    }
  },
};
