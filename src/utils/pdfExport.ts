import { jsPDF } from 'jspdf';
import type { Medicamento } from '../types';

// Función para cargar imagen desde URL y convertirla a base64
const loadImageAsBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error cargando imagen:', error);
    return null;
  }
};

export const exportarMedicamentosPDF = async (medicamentos: Medicamento[], nombrePaciente?: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const columnGap = 8;
  const columnWidth = (pageWidth - margin * 2 - columnGap) / 2;
  let currentColumn: 0 | 1 = 0;
  let yPosition = margin;

  // Función para obtener la posición X según la columna actual
  const getColumnX = () => {
    return currentColumn === 0 ? margin : margin + columnWidth + columnGap;
  };

  // Función para cambiar de columna o página
  const nextColumn = () => {
    if (currentColumn === 0) {
      currentColumn = 1;
    } else {
      doc.addPage();
      currentColumn = 0;
      yPosition = 45; // Posición después del header
    }
  };

  // Función para verificar si hay espacio suficiente
  const checkSpace = (requiredSpace: number): boolean => {
    if (yPosition + requiredSpace > pageHeight - margin - 15) {
      nextColumn();
      yPosition = doc.internal.pages.length > 2 ? margin : 45;
      return true;
    }
    return false;
  };

  // ========== ENCABEZADO (solo primera página) ==========
  const drawHeader = () => {
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Hoja de Medicamentos', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    if (nombrePaciente) {
      doc.text(`Paciente: ${nombrePaciente}`, pageWidth / 2, 26, { align: 'center' });
    }

    const fechaActual = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.setFontSize(9);
    doc.text(`Fecha: ${fechaActual}`, pageWidth / 2, 35, { align: 'center' });
  };

  drawHeader();
  yPosition = 45;
  doc.setTextColor(0);

  // Si no hay medicamentos
  if (medicamentos.length === 0) {
    doc.setFontSize(12);
    doc.text('No hay medicamentos registrados.', pageWidth / 2, yPosition, { align: 'center' });
    doc.save(`medicamentos_${new Date().toISOString().split('T')[0]}.pdf`);
    return;
  }

  // ========== ITERAR SOBRE MEDICAMENTOS ==========
  for (let index = 0; index < medicamentos.length; index++) {
    const med = medicamentos[index];

    // Calcular altura aproximada de la tarjeta
    let cardHeight = 35; // Base mínima
    if (med.imagenUrl) cardHeight += 30;
    if (med.dosis) cardHeight += 5;
    if (med.frecuencia) cardHeight += 5;
    if (med.numeroPastillas) cardHeight += 5;
    if (med.fechaInicio) cardHeight += 5;
    if (med.fechaFin) cardHeight += 5;
    if (med.horarios && med.horarios.length > 0) {
      cardHeight += 8 + Math.ceil(med.horarios.length / 3) * 5;
    }
    if (med.notas) {
      const notasLines = doc.splitTextToSize(med.notas, columnWidth - 10);
      cardHeight += 8 + notasLines.length * 4;
    }

    // Verificar espacio
    checkSpace(cardHeight + 8);

    const columnX = getColumnX();
    const cardStartY = yPosition;

    // Dibujar tarjeta
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.roundedRect(columnX, cardStartY, columnWidth, cardHeight, 2, 2);

    // Header de la tarjeta
    doc.setFillColor(102, 126, 234);
    doc.roundedRect(columnX, cardStartY, columnWidth, 8, 2, 2, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    const nombreTexto = `${index + 1}. ${med.nombre}`;
    const nombreLines = doc.splitTextToSize(nombreTexto, columnWidth - 6);
    doc.text(nombreLines[0], columnX + 3, cardStartY + 5.5);

    let currentY = cardStartY + 11;
    doc.setTextColor(60, 60, 60);

    // Imagen del medicamento
    if (med.imagenUrl) {
      try {
        const imgData = await loadImageAsBase64(med.imagenUrl);
        if (imgData) {
          const imgSize = 22;
          const imgX = columnX + (columnWidth - imgSize) / 2;
          doc.addImage(imgData, 'JPEG', imgX, currentY, imgSize, imgSize);
          currentY += imgSize + 3;
        }
      } catch (error) {
        console.error('Error al agregar imagen:', error);
      }
    }

    // Información del medicamento
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    if (med.dosis) {
      doc.text(`Dosis: ${med.dosis}`, columnX + 3, currentY);
      currentY += 5;
    }

    if (med.frecuencia) {
      doc.text(`Frecuencia: ${med.frecuencia}`, columnX + 3, currentY);
      currentY += 5;
    }

    if (med.numeroPastillas) {
      doc.text(`Cantidad: ${med.numeroPastillas} pastilla(s)`, columnX + 3, currentY);
      currentY += 5;
    }

    if (med.fechaInicio) {
      const fechaInicio = new Date(med.fechaInicio).toLocaleDateString('es-ES');
      doc.text(`Inicio: ${fechaInicio}`, columnX + 3, currentY);
      currentY += 5;
    }

    if (med.fechaFin) {
      const fechaFin = new Date(med.fechaFin).toLocaleDateString('es-ES');
      doc.text(`Fin: ${fechaFin}`, columnX + 3, currentY);
      currentY += 5;
    }

    // Horarios
    if (med.horarios && med.horarios.length > 0) {
      currentY += 2;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(102, 126, 234);
      doc.text('Horarios:', columnX + 3, currentY);
      currentY += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      const horariosOrdenados = [...med.horarios].sort();
      const horariosTexto = horariosOrdenados.join(' - ');
      const horariosLines = doc.splitTextToSize(horariosTexto, columnWidth - 6);

      horariosLines.forEach((line: string) => {
        doc.text(line, columnX + 3, currentY);
        currentY += 4.5;
      });
    }

    // Notas
    if (med.notas) {
      currentY += 2;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(102, 126, 234);
      doc.text('Notas:', columnX + 3, currentY);
      currentY += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(80, 80, 80);
      const notasLines = doc.splitTextToSize(med.notas, columnWidth - 6);

      notasLines.forEach((line: string) => {
        doc.text(line, columnX + 3, currentY);
        currentY += 4;
      });
      doc.setFontSize(8);
    }

    // Indicador de prospecto
    if (med.prospecto) {
      currentY += 2;
      doc.setFontSize(7);
      doc.setTextColor(0, 100, 200);
      doc.text('(i) Info del prospecto disponible en app', columnX + 3, currentY);
    }

    // Mover posición Y al final de la tarjeta
    yPosition = cardStartY + cardHeight + 6;
  }

  // ========== PIE DE PÁGINA ==========
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text(
      'Generado por Pastillero Digital - No sustituye la consulta medica profesional',
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
    doc.text(
      `Pagina ${i} de ${totalPages}`,
      pageWidth - margin,
      pageHeight - 8,
      { align: 'right' }
    );
  }

  // Guardar el PDF
  const fileName = `medicamentos_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
