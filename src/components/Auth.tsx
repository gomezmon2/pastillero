import React, { useState } from 'react';
import './Auth.css';

interface AuthProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, nombre: string) => Promise<void>;
  error: string | null;
  cargando: boolean;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onRegister, error, cargando }) => {
  const [modo, setModo] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    if (modo === 'register') {
      // Validaciones para registro
      if (!nombre.trim()) {
        setErrorLocal('El nombre es requerido');
        return;
      }
      if (password.length < 6) {
        setErrorLocal('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      if (password !== confirmPassword) {
        setErrorLocal('Las contraseñas no coinciden');
        return;
      }
      await onRegister(email, password, nombre);
    } else {
      // Login
      if (!email || !password) {
        setErrorLocal('Email y contraseña son requeridos');
        return;
      }
      await onLogin(email, password);
    }
  };

  const cambiarModo = () => {
    setModo(modo === 'login' ? 'register' : 'login');
    setErrorLocal(null);
    setEmail('');
    setPassword('');
    setNombre('');
    setConfirmPassword('');
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h1>💊 Pastillero Digital</h1>
          <p>{modo === 'login' ? 'Inicia sesión para continuar' : 'Crea tu cuenta'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {modo === 'register' && (
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                disabled={cargando}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              disabled={cargando}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={cargando}
              required
              minLength={6}
            />
          </div>

          {modo === 'register' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={cargando}
                required
                minLength={6}
              />
            </div>
          )}

          {(error || errorLocal) && (
            <div className="auth-error">
              {error || errorLocal}
            </div>
          )}

          <button type="submit" className="auth-button" disabled={cargando}>
            {cargando ? 'Procesando...' : modo === 'login' ? 'Iniciar sesión' : 'Registrarse'}
          </button>
        </form>

        <div className="auth-footer">
          <button onClick={cambiarModo} className="auth-switch" disabled={cargando}>
            {modo === 'login'
              ? '¿No tienes cuenta? Regístrate'
              : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
