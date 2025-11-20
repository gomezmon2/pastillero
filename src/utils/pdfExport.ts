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
  const margin = 15;
  const columnWidth = (pageWidth - margin * 3) / 2; // Dos columnas con margen central
  let currentColumn = 0; // 0 = izquierda, 1 = derecha
  let yPosition = margin;

  // Función para obtener la posición X según la columna actual
  const getColumnX = () => {
    return currentColumn === 0 ? margin : margin * 2 + columnWidth;
  };

  // Función para cambiar de columna o página
  const nextColumn = () => {
    if (currentColumn === 0) {
      // Pasar a columna derecha
      currentColumn = 1;
    } else {
      // Pasar a nueva página
      doc.addPage();
      currentColumn = 0;
      yPosition = margin;
    }
  };

  // Función para verificar si hay espacio suficiente
  const checkSpace = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin - 10) {
      nextColumn();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // ========== ENCABEZADO (página completa) ==========
  doc.setFillColor(102, 126, 234);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('💊 Hoja de Medicamentos', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  if (nombrePaciente) {
    doc.text(`Paciente: ${nombrePaciente}`, pageWidth / 2, 25, { align: 'center' });
  }

  const fechaActual = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.setFontSize(9);
  doc.text(`Fecha: ${fechaActual}`, pageWidth / 2, 31, { align: 'center' });

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
    const startY = yPosition;

    // Calcular espacio necesario aproximado
    let estimatedHeight = 40; // Base
    if (med.imagenUrl) estimatedHeight += 35;
    if (med.horarios && med.horarios.length > 0) estimatedHeight += 15;
    if (med.notas) estimatedHeight += 20;

    // Verificar espacio
    checkSpace(estimatedHeight);
    const finalColumnX = getColumnX();
    yPosition = startY === margin + 45 ? startY : yPosition;

    // Borde de la tarjeta
    const cardHeight = estimatedHeight;
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.roundedRect(finalColumnX, yPosition, columnWidth, cardHeight, 3, 3);

    // Fondo del header
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(finalColumnX, yPosition, columnWidth, 10, 3, 3, 'F');

    // Número y nombre del medicamento
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(102, 126, 234);
    const nombreTexto = `${index + 1}. ${med.nombre}`;
    const nombreLines = doc.splitTextToSize(nombreTexto, columnWidth - 10);
    doc.text(nombreLines, finalColumnX + 5, yPosition + 7);
    yPosition += 12;

    // Imagen del medicamento (si existe)
    if (med.imagenUrl) {
      try {
        const imgData = await loadImageAsBase64(med.imagenUrl);
        if (imgData) {
          const imgWidth = 25;
          const imgHeight = 25;
          const imgX = finalColumnX + (columnWidth - imgWidth) / 2;
          doc.addImage(imgData, 'JPEG', imgX, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 3;
        }
      } catch (error) {
        console.error('Error al agregar imagen:', error);
      }
    }

    // Información del medicamento
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);

    const infoLines: string[] = [];

    if (med.dosis) infoLines.push(`📋 Dosis: ${med.dosis}`);
    if (med.frecuencia) infoLines.push(`🔄 Frecuencia: ${med.frecuencia}`);
    if (med.numeroPastillas) infoLines.push(`💊 Cantidad: ${med.numeroPastillas} pastilla(s)`);

    if (med.fechaInicio) {
      const fechaInicio = new Date(med.fechaInicio).toLocaleDateString('es-ES');
      infoLines.push(`📅 Inicio: ${fechaInicio}`);
    }

    if (med.fechaFin) {
      const fechaFin = new Date(med.fechaFin).toLocaleDateString('es-ES');
      infoLines.push(`📅 Fin: ${fechaFin}`);
    }

    infoLines.forEach(line => {
      const lines = doc.splitTextToSize(line, columnWidth - 10);
      lines.forEach((l: string) => {
        doc.text(l, finalColumnX + 5, yPosition);
        yPosition += 5;
      });
    });

    // Horarios
    if (med.horarios && med.horarios.length > 0) {
      yPosition += 2;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(102, 126, 234);
      doc.text('⏰ Horarios:', finalColumnX + 5, yPosition);
      yPosition += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      const horariosOrdenados = [...med.horarios].sort();
      const horariosTexto = horariosOrdenados.join(' • ');
      const horariosLines = doc.splitTextToSize(horariosTexto, columnWidth - 10);

      horariosLines.forEach((line: string) => {
        doc.text(line, finalColumnX + 5, yPosition);
        yPosition += 4.5;
      });
    }

    // Notas
    if (med.notas) {
      yPosition += 2;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(102, 126, 234);
      doc.text('📝 Notas:', finalColumnX + 5, yPosition);
      yPosition += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      const notasLines = doc.splitTextToSize(med.notas, columnWidth - 10);

      notasLines.forEach((line: string) => {
        doc.text(line, finalColumnX + 5, yPosition);
        yPosition += 4;
      });
      doc.setFontSize(9);
    }

    // Indicador de prospecto
    if (med.prospecto) {
      yPosition += 2;
      doc.setFontSize(7);
      doc.setTextColor(0, 100, 200);
      doc.text('ℹ️ Info del prospecto disponible en app', finalColumnX + 5, yPosition);
      doc.setFontSize(9);
    }

    // Preparar para siguiente medicamento
    yPosition = startY + cardHeight + 8;

    // Si este no es el último medicamento, preparar siguiente columna
    if (index < medicamentos.length - 1) {
      if (yPosition > pageHeight - margin - 60) {
        nextColumn();
        yPosition = margin;
      }
    }
  }

  // ========== PIE DE PÁGINA ==========
  const totalPages = doc.internal.pages.length - 1; // -1 porque la primera es null
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text(
      'Generado por Pastillero Digital - No sustituye la consulta médica profesional',
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - margin,
      pageHeight - 8,
      { align: 'right' }
    );
  }

  // Guardar el PDF
  const fileName = `medicamentos_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
