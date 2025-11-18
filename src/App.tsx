import { useState, useEffect } from 'react';
import Header from './components/Header';
import MedicamentoForm from './components/MedicamentoForm';
import MedicamentoList from './components/MedicamentoList';
import CalendarioView from './components/CalendarioView';
import { NotificationSetup } from './components/NotificationSetup';
import type { Medicamento, TomaMedicamento } from './types';
import { supabaseStorage } from './utils/supabaseStorage';
import { storage } from './utils/storage';
import './App.css';

// Detectar si Supabase está configurado
const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

type Vista = 'lista' | 'calendario';

function App() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [tomas, setTomas] = useState<TomaMedicamento[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [medicamentoEditando, setMedicamentoEditando] = useState<Medicamento | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState<Vista>('lista');

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
        await supabaseStorage.addMedicamento(nuevoMedicamento);
        await loadMedicamentos();
      } else {
        setMedicamentos([...medicamentos, nuevoMedicamento]);
      }

      showNotification(`✓ ${medicamento.nombre} agregado correctamente`);
    }
    setShowForm(false);
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

  if (loading) {
    return (
      <div className="app">
        <Header />
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
      <Header />

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
    </div>
  );
}

export default App;
