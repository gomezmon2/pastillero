import { jsPDF } from 'jspdf';
import type { Medicamento } from '../types';

export const exportarMedicamentosPDF = (medicamentos: Medicamento[], nombrePaciente?: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Función para agregar nueva página si es necesario
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Título del documento
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Hoja de Medicamentos', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Información del paciente
  if (nombrePaciente) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Paciente: ${nombrePaciente}`, margin, yPosition);
    yPosition += 8;
  }

  // Fecha de generación
  doc.setFontSize(10);
  doc.setTextColor(100);
  const fechaActual = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Fecha: ${fechaActual}`, margin, yPosition);
  yPosition += 15;

  // Resetear color
  doc.setTextColor(0);

  // Si no hay medicamentos
  if (medicamentos.length === 0) {
    doc.setFontSize(12);
    doc.text('No hay medicamentos registrados.', margin, yPosition);
    doc.save('medicamentos.pdf');
    return;
  }

  // Iterar sobre cada medicamento
  medicamentos.forEach((med, index) => {
    // Verificar si necesitamos nueva página
    checkPageBreak(60);

    // Número del medicamento
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${med.nombre}`, margin, yPosition);
    yPosition += 8;

    // Información básica
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    if (med.dosis) {
      doc.text(`Dosis: ${med.dosis}`, margin + 5, yPosition);
      yPosition += 6;
    }

    if (med.frecuencia) {
      doc.text(`Frecuencia: ${med.frecuencia}`, margin + 5, yPosition);
      yPosition += 6;
    }

    if (med.numeroPastillas) {
      doc.text(`Cantidad: ${med.numeroPastillas} pastilla(s)`, margin + 5, yPosition);
      yPosition += 6;
    }

    // Horarios
    if (med.horarios && med.horarios.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Horarios:', margin + 5, yPosition);
      yPosition += 6;
      doc.setFont('helvetica', 'normal');

      const horariosOrdenados = [...med.horarios].sort();
      const horariosTexto = horariosOrdenados.join(', ');

      // Dividir en líneas si es muy largo
      const maxWidth = pageWidth - margin * 2 - 5;
      const lineas = doc.splitTextToSize(horariosTexto, maxWidth);

      lineas.forEach((linea: string) => {
        checkPageBreak(6);
        doc.text(linea, margin + 10, yPosition);
        yPosition += 6;
      });
    }

    // Fecha de inicio y fin
    if (med.fechaInicio) {
      const fechaInicio = new Date(med.fechaInicio).toLocaleDateString('es-ES');
      doc.text(`Inicio: ${fechaInicio}`, margin + 5, yPosition);
      yPosition += 6;
    }

    if (med.fechaFin) {
      const fechaFin = new Date(med.fechaFin).toLocaleDateString('es-ES');
      doc.text(`Fin: ${fechaFin}`, margin + 5, yPosition);
      yPosition += 6;
    }

    // Notas
    if (med.notas) {
      checkPageBreak(15);
      doc.setFont('helvetica', 'bold');
      doc.text('Notas:', margin + 5, yPosition);
      yPosition += 6;
      doc.setFont('helvetica', 'normal');

      const maxWidth = pageWidth - margin * 2 - 5;
      const lineas = doc.splitTextToSize(med.notas, maxWidth);

      lineas.forEach((linea: string) => {
        checkPageBreak(6);
        doc.text(linea, margin + 10, yPosition);
        yPosition += 6;
      });
    }

    // Prospecto disponible
    if (med.prospecto) {
      doc.setFontSize(9);
      doc.setTextColor(0, 100, 200);
      doc.text('ℹ Información del prospecto disponible en la aplicación', margin + 5, yPosition);
      doc.setTextColor(0);
      yPosition += 6;
      doc.setFontSize(10);
    }

    // Línea separadora
    yPosition += 5;
    doc.setDrawColor(200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
  });

  // Pie de página en la última página
  doc.setFontSize(8);
  doc.setTextColor(150);
  const footerY = pageHeight - 15;
  doc.text(
    'Generado por Pastillero Digital - No sustituye la consulta médica profesional',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  // Guardar el PDF
  const fileName = `medicamentos_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
