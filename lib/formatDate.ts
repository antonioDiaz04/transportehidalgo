/**
 * Formatea una fecha de formato ISO 8601 a un formato legible en español (dd mes aaaa).
 *
 * @param {string} dateString - La cadena de fecha a formatear (ej. "2024-12-10T00:00:00.000Z").
 * @returns {string} La fecha formateada (ej. "10 dic 2024") o una cadena vacía si es nula.
 */
export const formatDate = (dateString:any) => {
  if (!dateString || dateString.startsWith('0001-01-01')) {
    return "";
  }

  try {
    const date = new Date(dateString);
    
    const months = [
      "ene", "feb", "mar", "abr", "may", "jun",
      "jul", "ago", "sep", "oct", "nov", "dic"
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  } catch (error) {
    console.error("Error al formatear la fecha:", error);
    return "";
  }
};