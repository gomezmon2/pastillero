import React from 'react';
import type { Medicamento } from '../types';
import './MedicamentoList.css';

interface MedicamentoListProps {
  medicamentos: Medicamento[];
  onToggleActivo: (id: string) => void;
  onDelete: (id: string) => void;
  onMarcarTomado: (medicamentoId: string, horario: string) => void;
  onEdit: (medicamento: Medicamento) => void;
}

const MedicamentoList: React.FC<MedicamentoListProps> = ({
  medicamentos,
  onToggleActivo,
  onDelete,
  onMarcarTomado,
  onEdit,
}) => {
  if (medicamentos.length === 0) {
    return (
      <div className="empty-state">
        <p>No hay medicamentos registrados.</p>
        <p>Agrega tu primer medicamento para comenzar.</p>
      </div>
    );
  }

  const medicamentosActivos = medicamentos.filter(m => m.activo);
  const medicamentosInactivos = medicamentos.filter(m => !m.activo);

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderMedicamento = (med: Medicamento) => (
    <div key={med.id} className={`medicamento-card ${!med.activo ? 'inactive' : ''}`}>
      <div className="medicamento-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {med.imagenUrl && (
            <img
              src={med.imagenUrl}
              alt={med.nombre}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '8px',
                objectFit: 'cover',
                border: '2px solid #e0e0e0'
              }}
            />
          )}
          <h3>{med.nombre}</h3>
        </div>
        <div className="medicamento-actions">
          <button
            onClick={() => onEdit(med)}
            className="btn-edit"
            title="Editar"
          >
            ✏️
          </button>
          <button
            onClick={() => onToggleActivo(med.id)}
            className={`btn-toggle ${med.activo ? 'active' : 'inactive'}`}
            title={med.activo ? 'Desactivar' : 'Activar'}
          >
            {med.activo ? '✓' : '○'}
          </button>
          <button
            onClick={() => {
              if (window.confirm('¿Estás seguro de eliminar este medicamento?')) {
                onDelete(med.id);
              }
            }}
            className="btn-delete"
            title="Eliminar"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="medicamento-info">
        <div className="info-row">
          <span className="info-label">Dosis:</span>
          <span className="info-value">{med.dosis}</span>
        </div>

        {med.numeroPastillas && (
          <div className="info-row">
            <span className="info-label">Cantidad:</span>
            <span className="info-value">
              💊 {med.numeroPastillas} {med.numeroPastillas === 1 ? 'pastilla' : 'pastillas'}
            </span>
          </div>
        )}

        <div className="info-row">
          <span className="info-label">Frecuencia:</span>
          <span className="info-value">{med.frecuencia}</span>
        </div>

        <div className="info-row">
          <span className="info-label">Horarios:</span>
          <div className="horarios-list">
            {med.horarios.map((horario, index) => (
              <button
                key={index}
                onClick={() => onMarcarTomado(med.id, horario)}
                className="horario-badge"
                disabled={!med.activo}
                title="Marcar como tomado"
              >
                🕐 {horario}
              </button>
            ))}
          </div>
        </div>

        <div className="info-row">
          <span className="info-label">Inicio:</span>
          <span className="info-value">{formatFecha(med.fechaInicio)}</span>
        </div>

        {med.fechaFin && (
          <div className="info-row">
            <span className="info-label">Fin:</span>
            <span className="info-value">{formatFecha(med.fechaFin)}</span>
          </div>
        )}

        {med.notas && (
          <div className="info-row notas">
            <span className="info-label">Notas:</span>
            <span className="info-value">{med.notas}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="medicamento-list">
      {medicamentosActivos.length > 0 && (
        <section>
          <h2 className="section-title">Medicamentos Activos</h2>
          <div className="medicamentos-grid">
            {medicamentosActivos.map(renderMedicamento)}
          </div>
        </section>
      )}

      {medicamentosInactivos.length > 0 && (
        <section>
          <h2 className="section-title">Medicamentos Inactivos</h2>
          <div className="medicamentos-grid">
            {medicamentosInactivos.map(renderMedicamento)}
          </div>
        </section>
      )}
    </div>
  );
};

export default MedicamentoList;
