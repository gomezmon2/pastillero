import React from 'react';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">💊 Pastillero Digital</h1>
        <p className="header-subtitle">Gestiona tu medicación de forma simple</p>
      </div>
    </header>
  );
};

export default Header;
