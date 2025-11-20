import React from 'react';
import './AcercaDe.css';

interface AcercaDeProps {
  onClose: () => void;
}

const AcercaDe: React.FC<AcercaDeProps> = ({ onClose }) => {
  return (
    <div className="acerca-modal" onClick={onClose}>
      <div className="acerca-content" onClick={(e) => e.stopPropagation()}>
        <button className="btn-close-acerca" onClick={onClose}>
          ✕
        </button>

        <div className="acerca-header">
          <h2>💊 Pastillero Digital</h2>
          <p className="version">Versión 1.0.0</p>
        </div>

        <div className="acerca-body">
          <section className="acerca-section">
            <h3>📋 Descripción</h3>
            <p>
              Pastillero Digital es una aplicación web progresiva diseñada para ayudarte a
              gestionar tu medicación de forma simple y eficiente. Organiza tus medicamentos,
              configura recordatorios, consulta prospectos y mantén un control completo de tu
              tratamiento.
            </p>
          </section>

          <section className="acerca-section">
            <h3>✨ Características</h3>
            <ul>
              <li>Gestión completa de medicamentos</li>
              <li>Vista de calendario con horarios</li>
              <li>Búsqueda de prospectos médicos</li>
              <li>Modo oscuro/claro</li>
              <li>Exportación a PDF</li>
              <li>Sincronización en la nube con Supabase</li>
              <li>Progressive Web App (PWA)</li>
            </ul>
          </section>

          <section className="acerca-section">
            <h3>👥 Autoría</h3>
            <div className="autores">
              <div className="autor">
                <div className="autor-icon">👤</div>
                <div className="autor-info">
                  <h4>José Manuel Gómez</h4>
                  <p className="autor-rol">Creador del Proyecto</p>
                  <p className="autor-desc">Ideación, requisitos y coordinación del desarrollo</p>
                </div>
              </div>
              <div className="autor">
                <div className="autor-icon">🤖</div>
                <div className="autor-info">
                  <h4>Claude (Anthropic)</h4>
                  <p className="autor-rol">Desarrollo e Implementación</p>
                  <p className="autor-desc">
                    Arquitectura, código, diseño UI/UX y documentación técnica
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="acerca-section">
            <h3>🛠️ Tecnologías</h3>
            <div className="tecnologias">
              <span className="tech-badge">React 18</span>
              <span className="tech-badge">TypeScript</span>
              <span className="tech-badge">Vite</span>
              <span className="tech-badge">Supabase</span>
              <span className="tech-badge">PWA</span>
              <span className="tech-badge">jsPDF</span>
            </div>
          </section>

          <section className="acerca-section">
            <h3>⚖️ Licencia y Uso</h3>
            <p>
              Esta aplicación ha sido desarrollada con fines personales y educativos.
              No sustituye la consulta médica profesional. Siempre consulta con tu médico
              o farmacéutico sobre tu tratamiento.
            </p>
          </section>

          <section className="acerca-section acerca-footer-section">
            <p className="copyright">
              © 2024 Pastillero Digital
              <br />
              Desarrollado con ❤️ por José Manuel Gómez y Claude
            </p>
          </section>
        </div>

        <div className="acerca-actions">
          <button onClick={onClose} className="btn-cerrar-acerca">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcercaDe;
