import React, { useState, useEffect } from 'react';
import type { Medicamento } from '../types';
import './MedicamentoForm.css';

interface MedicamentoFormProps {
  onSubmit: (medicamento: Omit<Medicamento, 'id'>) => void;
  onCancel?: () => void;
  medicamentoToEdit?: Medicamento;
}

const MedicamentoForm: React.FC<MedicamentoFormProps> = ({ onSubmit, onCancel, medicamentoToEdit }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    dosis: '',
    frecuencia: '',
    horarios: [''],
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: '',
    notas: '',
    activo: true,
  });

  // Cargar datos si estamos editando
  useEffect(() => {
    if (medicamentoToEdit) {
      setFormData({
        nombre: medicamentoToEdit.nombre,
        dosis: medicamentoToEdit.dosis,
        frecuencia: medicamentoToEdit.frecuencia,
        horarios: medicamentoToEdit.horarios,
        fechaInicio: medicamentoToEdit.fechaInicio,
        fechaFin: medicamentoToEdit.fechaFin || '',
        notas: medicamentoToEdit.notas || '',
        activo: medicamentoToEdit.activo,
      });
    }
  }, [medicamentoToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre || !formData.dosis || !formData.frecuencia) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    const horariosFiltrados = formData.horarios.filter(h => h.trim() !== '');

    if (horariosFiltrados.length === 0) {
      alert('Por favor agrega al menos un horario');
      return;
    }

    onSubmit({
      ...formData,
      horarios: horariosFiltrados,
      activo: formData.activo,
    });

    // Reset form solo si no estamos editando
    if (!medicamentoToEdit) {
      setFormData({
        nombre: '',
        dosis: '',
        frecuencia: '',
        horarios: [''],
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: '',
        notas: '',
        activo: true,
      });
    }
  };

  const handleHorarioChange = (index: number, value: string) => {
    const newHorarios = [...formData.horarios];
    newHorarios[index] = value;
    setFormData({ ...formData, horarios: newHorarios });
  };

  const addHorario = () => {
    setFormData({ ...formData, horarios: [...formData.horarios, ''] });
  };

  const removeHorario = (index: number) => {
    const newHorarios = formData.horarios.filter((_, i) => i !== index);
    setFormData({ ...formData, horarios: newHorarios.length > 0 ? newHorarios : [''] });
  };

  return (
    <form className="medicamento-form" onSubmit={handleSubmit}>
      <h2>{medicamentoToEdit ? 'Editar Medicamento' : 'Agregar Medicamento'}</h2>

      <div className="form-group">
        <label htmlFor="nombre">Nombre del medicamento *</label>
        <input
          type="text"
          id="nombre"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          placeholder="ej: Ibuprofeno"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="dosis">Dosis *</label>
        <input
          type="text"
          id="dosis"
          value={formData.dosis}
          onChange={(e) => setFormData({ ...formData, dosis: e.target.value })}
          placeholder="ej: 400mg"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="frecuencia">Frecuencia *</label>
        <select
          id="frecuencia"
          value={formData.frecuencia}
          onChange={(e) => setFormData({ ...formData, frecuencia: e.target.value })}
          required
        >
          <option value="">Selecciona una frecuencia</option>
          <option value="Cada 4 horas">Cada 4 horas</option>
          <option value="Cada 6 horas">Cada 6 horas</option>
          <option value="Cada 8 horas">Cada 8 horas</option>
          <option value="Cada 12 horas">Cada 12 horas</option>
          <option value="Diario">Una vez al día</option>
          <option value="Dos veces al día">Dos veces al día</option>
          <option value="Tres veces al día">Tres veces al día</option>
          <option value="Semanal">Semanal</option>
          <option value="Personalizado">Personalizado</option>
        </select>
      </div>

      <div className="form-group">
        <label>Horarios *</label>
        {formData.horarios.map((horario, index) => (
          <div key={index} className="horario-input-group">
            <input
              type="time"
              value={horario}
              onChange={(e) => handleHorarioChange(index, e.target.value)}
              required
            />
            {formData.horarios.length > 1 && (
              <button
                type="button"
                onClick={() => removeHorario(index)}
                className="btn-remove"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addHorario} className="btn-add-horario">
          + Agregar otro horario
        </button>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="fechaInicio">Fecha de inicio</label>
          <input
            type="date"
            id="fechaInicio"
            value={formData.fechaInicio}
            onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="fechaFin">Fecha de fin (opcional)</label>
          <input
            type="date"
            id="fechaFin"
            value={formData.fechaFin}
            onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="notas">Notas adicionales</label>
        <textarea
          id="notas"
          value={formData.notas}
          onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
          placeholder="Instrucciones especiales, efectos secundarios, etc."
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {medicamentoToEdit ? 'Actualizar Medicamento' : 'Guardar Medicamento'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default MedicamentoForm;
