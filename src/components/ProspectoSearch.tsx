import React, { useState } from 'react';
import { medicamentoSearchService } from '../utils/medicamentoSearchService';
import type { ProspectoMedicamento } from '../types';
import './ProspectoSearch.css';

interface ProspectoSearchProps {
  nombreMedicamento: string;
  onProspectoEncontrado: (prospecto: ProspectoMedicamento) => void;
}

const ProspectoSearch: React.FC<ProspectoSearchProps> = ({ nombreMedicamento, onProspectoEncontrado }) => {
  const [buscando, setBuscando] = useState(false);
  const [resultado, setResultado] = useState<ProspectoMedicamento | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const buscarProspecto = async () => {
    if (!nombreMedicamento.trim()) {
      setError('Ingresa el nombre del medicamento primero');
      return;
    }

    setBuscando(true);
    setError(null);
    setResultado(null);

    try {
      const prospecto = await medicamentoSearchService.buscarProspecto(nombreMedicamento);

      if (prospecto) {
        setResultado(prospecto);
        setMostrarResultado(true);
      } else {
        setError('No se encontró información para este medicamento');
      }
    } catch (err) {
      setError('Error al buscar información del medicamento');
      console.error('Error en búsqueda:', err);
    } finally {
      setBuscando(false);
    }
  };

  const guardarProspecto = () => {
    if (resultado) {
      onProspectoEncontrado(resultado);
      setMostrarResultado(false);
    }
  };

  const descartarProspecto = () => {
    setResultado(null);
    setMostrarResultado(false);
  };

  return (
    <div className="prospecto-search">
      <div className="prospecto-search-header">
        <button
          type="button"
          onClick={buscarProspecto}
          disabled={buscando || !nombreMedicamento.trim()}
          className="btn-buscar-prospecto"
        >
          {buscando ? (
            <>⏳ Buscando...</>
          ) : (
            <>🔍 Buscar información del medicamento</>
          )}
        </button>
      </div>

      {error && (
        <div className="prospecto-search-error">
          ⚠️ {error}
        </div>
      )}

      {mostrarResultado && resultado && (
        <div className="prospecto-search-resultado">
          <div className="resultado-header">
            <h4>📋 Información encontrada</h4>
          </div>

          <div className="resultado-content">
            {resultado.principioActivo && (
              <div className="resultado-campo">
                <strong>Principio activo:</strong> {resultado.principioActivo}
              </div>
            )}

            {resultado.laboratorio && (
              <div className="resultado-campo">
                <strong>Laboratorio:</strong> {resultado.laboratorio}
              </div>
            )}

            {resultado.indicaciones && (
              <div className="resultado-campo">
                <strong>Indicaciones:</strong>
                <p className="resultado-texto">{resultado.indicaciones.substring(0, 200)}...</p>
              </div>
            )}

            {resultado.dosificacion && (
              <div className="resultado-campo">
                <strong>Dosificación:</strong>
                <p className="resultado-texto">{resultado.dosificacion.substring(0, 150)}...</p>
              </div>
            )}
          </div>

          <div className="resultado-acciones">
            <button
              type="button"
              onClick={guardarProspecto}
              className="btn-guardar-prospecto"
            >
              ✓ Guardar información
            </button>
            <button
              type="button"
              onClick={descartarProspecto}
              className="btn-descartar-prospecto"
            >
              ✕ Descartar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProspectoSearch;
