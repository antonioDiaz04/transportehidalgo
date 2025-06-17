import jsPDF from 'jspdf';

/**
 * Crea un archivo PDF vacío (sin importar contenido HTML).
 * @returns jsPDF - Instancia del documento PDF.
 */
export const createEmptyPDF = (): jsPDF => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: 'a4',
  });

  return pdf;
};

/**
 * Guarda un documento PDF con el nombre de archivo indicado.
 * @param pdf - Instancia de jsPDF.
 * @param filename - Nombre del archivo (sin extensión).
 */
export const savePDF = (pdf: jsPDF, filename: string) => {
  pdf.save(`${filename}.pdf`);
};
