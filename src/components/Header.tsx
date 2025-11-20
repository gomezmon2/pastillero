import React from 'react';
import type { Usuario } from '../types';
import { useTheme } from '../context/ThemeContext';
import './Header.css';

interface HeaderProps {
  usuario?: Usuario | null;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ usuario, onLogout }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="header-content">
        <div>
          <h1 className="header-title">💊 Pastillero Digital</h1>
          <p className="header-subtitle">Gestiona tu medicación de forma simple</p>
        </div>
        <div className="header-actions">
          <button
            onClick={toggleTheme}
            className="btn-theme-toggle"
            title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          {usuario && onLogout && (
            <div className="header-user">
              <span className="user-info">
                👤 {usuario.nombre || usuario.email}
              </span>
              <button onClick={onLogout} className="btn-logout">
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
