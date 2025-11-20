import React, { useState } from 'react';
import type { ProspectoMedicamento } from '../types';
import './ProspectoView.css';

interface ProspectoViewProps {
  prospecto: ProspectoMedicamento;
  nombreMedicamento: string;
  onClose: () => void;
}

const ProspectoView: React.FC<ProspectoViewProps> = ({ prospecto, nombreMedicamento, onClose }) => {
  const [seccionActiva, setSeccionActiva] = useState<string>('indicaciones');

  const secciones = [
    { id: 'indicaciones', titulo: 'Indicaciones', contenido: prospecto.indicaciones },
    { id: 'dosificacion', titulo: 'Dosificación', contenido: prospecto.dosificacion },
    { id: 'contraindicaciones', titulo: 'Contraindicaciones', contenido: prospecto.contraindicaciones },
    { id: 'efectos', titulo: 'Efectos secundarios', contenido: prospecto.efectosSecundarios },
    { id: 'interacciones', titulo: 'Interacciones', contenido: prospecto.interacciones },
  ].filter(s => s.contenido);

  return (
    <div className="prospecto-modal">
      <div className="prospecto-content">
        <div className="prospecto-header">
          <div>
            <h2>📋 Prospecto: {nombreMedicamento}</h2>
            {prospecto.principioActivo && (
              <p className="prospecto-principio-activo">
                Principio activo: <strong>{prospecto.principioActivo}</strong>
              </p>
            )}
            {prospecto.laboratorio && (
              <p className="prospecto-laboratorio">
                Laboratorio: {prospecto.laboratorio}
              </p>
            )}
          </div>
          <button onClick={onClose} className="prospecto-close-btn">✕</button>
        </div>

        {secciones.length > 0 && (
          <>
            <div className="prospecto-tabs">
              {secciones.map(seccion => (
                <button
                  key={seccion.id}
                  className={`prospecto-tab ${seccionActiva === seccion.id ? 'active' : ''}`}
                  onClick={() => setSeccionActiva(seccion.id)}
                >
                  {seccion.titulo}
                </button>
              ))}
            </div>

            <div className="prospecto-body">
              {secciones.map(seccion => (
                <div
                  key={seccion.id}
                  className={`prospecto-seccion ${seccionActiva === seccion.id ? 'active' : ''}`}
                >
                  <h3>{seccion.titulo}</h3>
                  <p>{seccion.contenido}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {prospecto.urlProspecto && (
          <div className="prospecto-footer">
            <a
              href={prospecto.urlProspecto}
              target="_blank"
              rel="noopener noreferrer"
              className="prospecto-link"
            >
              📄 Ver prospecto completo (PDF)
            </a>
          </div>
        )}

        {secciones.length === 0 && !prospecto.urlProspecto && (
          <div className="prospecto-empty">
            <p>No hay información detallada disponible para este medicamento.</p>
            {prospecto.principioActivo && (
              <p>Principio activo: <strong>{prospecto.principioActivo}</strong></p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProspectoView;
