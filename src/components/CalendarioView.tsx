import React, { useState, useEffect } from 'react';
import type { Medicamento, TomaMedicamento } from '../types';
import './CalendarioView.css';

interface CalendarioViewProps {
  medicamentos: Medicamento[];
  tomas: TomaMedicamento[];
  onMarcarTomado: (medicamentoId: string, horario: string, fecha: Date, estabaTomado: boolean) => void;
}

interface DiaCalendario {
  fecha: Date;
  esHoy: boolean;
  esMesActual: boolean;
  tomas: {
    medicamento: Medicamento;
    horario: string;
    tomado: boolean;
  }[];
}

const CalendarioView: React.FC<CalendarioViewProps> = ({
  medicamentos,
  tomas,
  onMarcarTomado,
}) => {
  const [mesActual, setMesActual] = useState(new Date());
  const [diasDelMes, setDiasDelMes] = useState<DiaCalendario[]>([]);

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    generarDiasDelMes();
  }, [mesActual, medicamentos, tomas]);

  const generarDiasDelMes = () => {
    const año = mesActual.getFullYear();
    const mes = mesActual.getMonth();

    // Primer y último día del mes
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);

    // Días a mostrar antes del primer día (del mes anterior)
    const diasAntesDelPrimerDia = primerDia.getDay();

    // Generar array de días
    const dias: DiaCalendario[] = [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Días del mes anterior
    for (let i = diasAntesDelPrimerDia - 1; i >= 0; i--) {
      const fecha = new Date(año, mes, -i);
      dias.push({
        fecha,
        esHoy: fecha.getTime() === hoy.getTime(),
        esMesActual: false,
        tomas: obtenerTomasDelDia(fecha),
      });
    }

    // Días del mes actual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const fecha = new Date(año, mes, dia);
      dias.push({
        fecha,
        esHoy: fecha.getTime() === hoy.getTime(),
        esMesActual: true,
        tomas: obtenerTomasDelDia(fecha),
      });
    }

    // Días del mes siguiente para completar la semana
    const diasRestantes = 42 - dias.length; // 6 semanas * 7 días = 42
    for (let i = 1; i <= diasRestantes; i++) {
      const fecha = new Date(año, mes + 1, i);
      dias.push({
        fecha,
        esHoy: fecha.getTime() === hoy.getTime(),
        esMesActual: false,
        tomas: obtenerTomasDelDia(fecha),
      });
    }

    setDiasDelMes(dias);
  };

  const obtenerTomasDelDia = (fecha: Date): DiaCalendario['tomas'] => {
    const fechaStr = fecha.toISOString().split('T')[0];
    const tomasDelDia: DiaCalendario['tomas'] = [];

    medicamentos.forEach((med) => {
      // Verificar si el medicamento está activo en esta fecha
      const fechaInicio = new Date(med.fechaInicio);
      fechaInicio.setHours(0, 0, 0, 0);
      const fechaFin = med.fechaFin ? new Date(med.fechaFin) : null;
      if (fechaFin) fechaFin.setHours(0, 0, 0, 0);

      const fechaActual = new Date(fecha);
      fechaActual.setHours(0, 0, 0, 0);

      if (fechaActual >= fechaInicio && (!fechaFin || fechaActual <= fechaFin)) {
        // Agregar todas las tomas programadas del día
        med.horarios.forEach((horario) => {
          const tomaRegistrada = tomas.find(
            (t) => t.medicamentoId === med.id && t.fecha === fechaStr && t.hora === horario
          );

          tomasDelDia.push({
            medicamento: med,
            horario,
            tomado: tomaRegistrada?.tomado || false,
          });
        });
      }
    });

    // Ordenar por hora de toma
    tomasDelDia.sort((a, b) => {
      const horaA = a.horario.split(':').map(Number);
      const horaB = b.horario.split(':').map(Number);

      // Comparar horas
      if (horaA[0] !== horaB[0]) {
        return horaA[0] - horaB[0];
      }
      // Si las horas son iguales, comparar minutos
      return horaA[1] - horaB[1];
    });

    return tomasDelDia;
  };

  const cambiarMes = (direccion: number) => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + direccion, 1));
  };

  const irHoy = () => {
    setMesActual(new Date());
  };

  const handleTomaClick = (toma: DiaCalendario['tomas'][0], fecha: Date) => {
    // Permitir marcar y desmarcar
    onMarcarTomado(toma.medicamento.id, toma.horario, fecha, toma.tomado);
  };

  const renderDia = (dia: DiaCalendario, index: number) => {
    const tomasPendientes = dia.tomas.filter((t) => !t.tomado).length;
    const tomasCompletadas = dia.tomas.filter((t) => t.tomado).length;
    const totalTomas = dia.tomas.length;

    return (
      <div
        key={index}
        className={`calendario-dia ${!dia.esMesActual ? 'otro-mes' : ''} ${
          dia.esHoy ? 'hoy' : ''
        }`}
      >
        <div className="dia-numero">{dia.fecha.getDate()}</div>

        {totalTomas > 0 && (
          <div className="dia-tomas">
            <div className="tomas-resumen">
              {tomasCompletadas > 0 && (
                <span className="tomas-completadas" title="Tomas completadas">
                  ✓ {tomasCompletadas}
                </span>
              )}
              {tomasPendientes > 0 && (
                <span className="tomas-pendientes" title="Tomas pendientes">
                  ⏰ {tomasPendientes}
                </span>
              )}
            </div>

            <div className="tomas-detalle">
              {dia.tomas.map((toma, idx) => (
                <div
                  key={idx}
                  className={`toma-item ${toma.tomado ? 'completada' : 'pendiente'} clickable`}
                  title={toma.tomado ? `Click para desmarcar: ${toma.medicamento.nombre} - ${toma.horario}` : `Click para marcar como tomado: ${toma.medicamento.nombre} - ${toma.horario}`}
                  onClick={() => handleTomaClick(toma, dia.fecha)}
                >
                  <span className="toma-hora">{toma.horario}</span>
                  <span className="toma-nombre">{toma.medicamento.nombre}</span>
                  {!toma.tomado && <span className="click-indicator">👆</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="calendario-view">
      <div className="calendario-header">
        <button onClick={() => cambiarMes(-1)} className="btn-nav">
          ← Anterior
        </button>
        <div className="mes-actual">
          <h2>
            {meses[mesActual.getMonth()]} {mesActual.getFullYear()}
          </h2>
          <button onClick={irHoy} className="btn-hoy">
            Hoy
          </button>
        </div>
        <button onClick={() => cambiarMes(1)} className="btn-nav">
          Siguiente →
        </button>
      </div>

      <div className="calendario-grid">
        {/* Encabezados de días de la semana */}
        {diasSemana.map((dia) => (
          <div key={dia} className="dia-semana">
            {dia}
          </div>
        ))}

        {/* Días del mes */}
        {diasDelMes.map(renderDia)}
      </div>

      <div className="calendario-leyenda">
        <div className="leyenda-item">
          <span className="leyenda-icono completada">✓</span>
          <span>Toma completada</span>
        </div>
        <div className="leyenda-item">
          <span className="leyenda-icono pendiente">⏰</span>
          <span>Toma pendiente</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarioView;
