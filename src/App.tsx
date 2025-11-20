import { useState, useEffect } from 'react';
import Header from './components/Header';
import MedicamentoForm from './components/MedicamentoForm';
import MedicamentoList from './components/MedicamentoList';
import CalendarioView from './components/CalendarioView';
import { NotificationSetup } from './components/NotificationSetup';
import Auth from './components/Auth';
import AcercaDe from './components/AcercaDe';
import type { Medicamento, TomaMedicamento, Usuario } from './types';
import { supabaseStorage } from './utils/supabaseStorage';
import { storage } from './utils/storage';
import { authService } from './utils/authService';
import { exportarMedicamentosPDF } from './utils/pdfExport';
import './App.css';

// Detectar si Supabase está configurado
const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

type Vista = 'lista' | 'calendario';

function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [tomas, setTomas] = useState<TomaMedicamento[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [medicamentoEditando, setMedicamentoEditando] = useState<Medicamento | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState<Vista>('lista');
  const [showAcercaDe, setShowAcercaDe] = useState(false);

  // Verificar autenticación al cargar
  useEffect(() => {
    const initAuth = async () => {
      if (isSupabaseConfigured) {
        try {
          const user = await authService.getCurrentUser();
          setUsuario(user);
        } catch (error) {
          console.error('Error al verificar autenticación:', error);
        }
      } else {
        // Si no hay Supabase, permitir uso sin autenticación
        setUsuario({ id: 'local', email: 'local@user', createdAt: new Date().toISOString() });
      }
      setAuthLoading(false);
    };

    initAuth();

    // Listener para cambios en autenticación
    if (isSupabaseConfigured) {
      const unsubscribe = authService.onAuthStateChange((user) => {
        setUsuario(user);
        if (user) {
          loadMedicamentos();
          loadTomas();
        }
      });
      return unsubscribe;
    }
  }, []);

  // Registrar Service Worker y escuchar mensajes
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('Service Worker registrado:', registration);
      }).catch((error) => {
        console.error('Error al registrar Service Worker:', error);
      });

      // Escuchar mensajes del Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'MARK_MEDICATION_TAKEN') {
          handleMarcarTomado(event.data.medicamentoId, event.data.hora, new Date(), false);
        }
      });
    }
  }, []);

  // Cargar medicamentos al iniciar
  useEffect(() => {
    loadMedicamentos();
    loadTomas();
  }, []);

  const loadMedicamentos = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const meds = await supabaseStorage.getMedicamentos();
        setMedicamentos(meds);
      } else {
        const meds = storage.getMedicamentos();
        setMedicamentos(meds);
      }
    } catch (error) {
      console.error('Error al cargar medicamentos:', error);
      showNotification('Error al cargar medicamentos');
    } finally {
      setLoading(false);
    }
  };

  const loadTomas = async () => {
    try {
      if (isSupabaseConfigured) {
        const tomasData = await supabaseStorage.getTomas();
        setTomas(tomasData);
      } else {
        const tomasData = storage.getTomas();
        setTomas(tomasData);
      }
    } catch (error) {
      console.error('Error al cargar tomas:', error);
    }
  };

  // Guardar medicamentos cuando cambien (solo para localStorage)
  useEffect(() => {
    if (!isSupabaseConfigured && medicamentos.length > 0) {
      storage.saveMedicamentos(medicamentos);
    }
  }, [medicamentos]);

  const handleAddMedicamento = async (medicamento: Omit<Medicamento, 'id'>) => {
    try {
      if (medicamentoEditando) {
        // Modo edición
        const updatedMedicamento = { ...medicamento, id: medicamentoEditando.id };

        if (isSupabaseConfigured) {
          await supabaseStorage.updateMedicamento(medicamentoEditando.id, updatedMedicamento);
          await loadMedicamentos();
        } else {
          setMedicamentos(
            medicamentos.map((med) =>
              med.id === medicamentoEditando.id ? updatedMedicamento : med
            )
          );
        }

        showNotification(`✓ ${medicamento.nombre} actualizado correctamente`);
        setMedicamentoEditando(undefined);
      } else {
        // Modo agregar
        const nuevoMedicamento: Medicamento = {
          ...medicamento,
          id: Date.now().toString(),
        };

        if (isSupabaseConfigured) {
          const resultado = await supabaseStorage.addMedicamento(nuevoMedicamento);
          if (!resultado) {
            showNotification(`❌ Error al agregar ${medicamento.nombre}. Verifica la consola del navegador (F12).`);
            console.error('addMedicamento retornó null');
            return;
          }
          await loadMedicamentos();
        } else {
          setMedicamentos([...medicamentos, nuevoMedicamento]);
        }

        showNotification(`✓ ${medicamento.nombre} agregado correctamente`);
      }
      setShowForm(false);
    } catch (error) {
      console.error('Error en handleAddMedicamento:', error);
      showNotification(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleEditMedicamento = (medicamento: Medicamento) => {
    setMedicamentoEditando(medicamento);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setMedicamentoEditando(undefined);
  };

  const handleToggleActivo = async (id: string) => {
    const med = medicamentos.find((m) => m.id === id);
    if (!med) return;

    const newActivo = !med.activo;

    if (isSupabaseConfigured) {
      await supabaseStorage.updateMedicamento(id, { activo: newActivo });
      await loadMedicamentos();
    } else {
      setMedicamentos(
        medicamentos.map((m) =>
          m.id === id ? { ...m, activo: newActivo } : m
        )
      );
    }

    showNotification(
      newActivo
        ? `${med.nombre} activado`
        : `${med.nombre} desactivado`
    );
  };

  const handleDelete = async (id: string) => {
    const med = medicamentos.find((m) => m.id === id);
    if (!med) return;

    if (isSupabaseConfigured) {
      await supabaseStorage.deleteMedicamento(id);
      await loadMedicamentos();
    } else {
      setMedicamentos(medicamentos.filter((m) => m.id !== id));
    }

    showNotification(`${med.nombre} eliminado`);
  };

  const handleMarcarTomado = async (medicamentoId: string, horario: string, fecha: Date, estabaTomado: boolean) => {
    const med = medicamentos.find((m) => m.id === medicamentoId);
    if (!med) return;

    const fechaStr = fecha.toISOString().split('T')[0];

    if (estabaTomado) {
      // Desmarcar - buscar y eliminar la toma
      const tomaExistente = tomas.find(
        (t) => t.medicamentoId === medicamentoId && t.fecha === fechaStr && t.hora === horario
      );

      if (tomaExistente) {
        if (isSupabaseConfigured) {
          await supabaseStorage.deleteToma(tomaExistente.id);
        } else {
          storage.deleteToma(tomaExistente.id);
        }
        showNotification(`${med.nombre} desmarcado (${horario})`);
      }
    } else {
      // Marcar como tomado
      const toma: TomaMedicamento = {
        id: Date.now().toString(),
        medicamentoId,
        fecha: fechaStr,
        hora: horario,
        tomado: true,
      };

      if (isSupabaseConfigured) {
        await supabaseStorage.addToma(toma);
      } else {
        storage.addToma(toma);
      }
      showNotification(`✓ ${med.nombre} marcado como tomado a las ${horario}`);
    }

    // Recargar tomas para actualizar el calendario
    await loadTomas();
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExportarPDF = async () => {
    if (medicamentos.length === 0) {
      showNotification('No hay medicamentos para exportar');
      return;
    }
    try {
      showNotification('Generando PDF...');
      await exportarMedicamentosPDF(medicamentos, usuario?.nombre || usuario?.email);
      showNotification('✓ PDF generado correctamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      showNotification('❌ Error al generar PDF');
    }
  };

  // Funciones de autenticación
  const handleLogin = async (email: string, password: string) => {
    try {
      setAuthError(null);
      console.log('Intentando login con email:', email);
      const user = await authService.login(email, password);
      console.log('Login exitoso:', user);
      setUsuario(user);
      showNotification(`Bienvenido ${user.nombre || user.email}`);
    } catch (error) {
      console.error('Error en login:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';

      // Traducir errores comunes de Supabase
      let userFriendlyMessage = errorMessage;
      if (errorMessage.includes('Invalid login credentials')) {
        userFriendlyMessage = 'Email o contraseña incorrectos';
      } else if (errorMessage.includes('Email not confirmed')) {
        userFriendlyMessage = 'Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.';
      } else if (errorMessage.includes('User not found')) {
        userFriendlyMessage = 'Usuario no encontrado. ¿Necesitas registrarte?';
      }

      setAuthError(userFriendlyMessage);
    }
  };

  const handleRegister = async (email: string, password: string, nombre: string) => {
    try {
      setAuthError(null);
      console.log('Intentando registro con email:', email, 'nombre:', nombre);
      const user = await authService.register(email, password, nombre);
      console.log('Registro exitoso:', user);
      setUsuario(user);
      showNotification(`Cuenta creada exitosamente. Bienvenido ${nombre}`);
    } catch (error) {
      console.error('Error en registro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al registrarse';

      // Traducir errores comunes de Supabase
      let userFriendlyMessage = errorMessage;
      if (errorMessage.includes('already registered')) {
        userFriendlyMessage = 'Este email ya está registrado. Intenta iniciar sesión.';
      } else if (errorMessage.includes('Password should be')) {
        userFriendlyMessage = 'La contraseña debe tener al menos 6 caracteres';
      }

      setAuthError(userFriendlyMessage);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUsuario(null);
      setMedicamentos([]);
      setTomas([]);
      showNotification('Sesión cerrada');
    } catch (error) {
      showNotification('Error al cerrar sesión');
    }
  };

  // Mostrar loading durante verificación de autenticación
  if (authLoading) {
    return (
      <div className="app">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2>💊 Pastillero Digital</h2>
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si Supabase está configurado y no hay usuario, mostrar login
  if (isSupabaseConfigured && !usuario) {
    return <Auth onLogin={handleLogin} onRegister={handleRegister} error={authError} cargando={false} />;
  }

  if (loading) {
    return (
      <div className="app">
        <Header onLogout={isSupabaseConfigured ? handleLogout : undefined} usuario={usuario} />
        <main className="main-content">
          <div className="container">
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p>Cargando medicamentos...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Header onLogout={isSupabaseConfigured ? handleLogout : undefined} usuario={usuario} />

      {notification && (
        <div className="notification">{notification}</div>
      )}

      {!isSupabaseConfigured && (
        <div style={{
          background: '#fff3cd',
          padding: '1rem',
          textAlign: 'center',
          borderBottom: '1px solid #ffc107'
        }}>
          ⚠️ Usando almacenamiento local. Configura Supabase para sincronización en la nube.
        </div>
      )}

      <main className="main-content">
        <div className="container">
          <NotificationSetup medicamentos={medicamentos} />

          <div className="top-actions">
            <button
              onClick={() => {
                if (showForm) {
                  handleCancelForm();
                } else {
                  setShowForm(true);
                }
              }}
              className="btn-add-medicamento"
            >
              {showForm ? '✕ Cancelar' : '+ Agregar Medicamento'}
            </button>

            <div className="view-toggle">
              <button
                onClick={() => setVista('lista')}
                className={`btn-view ${vista === 'lista' ? 'active' : ''}`}
              >
                📋 Lista
              </button>
              <button
                onClick={() => setVista('calendario')}
                className={`btn-view ${vista === 'calendario' ? 'active' : ''}`}
              >
                📅 Calendario
              </button>
            </div>

            <div className="utility-buttons">
              <button
                onClick={handleExportarPDF}
                className="btn-utility"
                title="Exportar a PDF"
              >
                📄 PDF
              </button>
              <button
                onClick={() => setShowAcercaDe(true)}
                className="btn-utility"
                title="Acerca de"
              >
                ℹ️ Acerca de
              </button>
            </div>
          </div>

          {showForm && (
            <MedicamentoForm
              onSubmit={handleAddMedicamento}
              onCancel={handleCancelForm}
              medicamentoToEdit={medicamentoEditando}
            />
          )}

          {vista === 'lista' ? (
            <MedicamentoList
              medicamentos={medicamentos}
              onToggleActivo={handleToggleActivo}
              onDelete={handleDelete}
              onMarcarTomado={handleMarcarTomado}
              onEdit={handleEditMedicamento}
            />
          ) : (
            <CalendarioView
              medicamentos={medicamentos}
              tomas={tomas}
              onMarcarTomado={handleMarcarTomado}
            />
          )}
        </div>
      </main>

      <footer className="footer">
        <p>Pastillero Digital - Tu salud es importante</p>
      </footer>

      {showAcercaDe && <AcercaDe onClose={() => setShowAcercaDe(false)} />}
    </div>
  );
}

export default App;
