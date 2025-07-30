import jsPDF from 'jspdf';
import apiClient from "@/lib/apiClient";

// 1. Helper Functions
// ---
/**
 * Formats a boolean or number value into 'BIEN', 'MAL', 'N/A', or an empty string.
 * - `2` or `true` maps to 'SI:MAL'.
 * - `1` maps to 'SI:BIEN'.
 * - `0` or `false` maps to an empty string.
 * - Other values (null, undefined) map to 'N/A'.
 *
 * @param value The boolean, number, null, or undefined value to format.
 * @returns A formatted string.
 */
const formatBoolean = (value: boolean | number | null | undefined): string => {
    // Si el valor es '1' (de SI:BIEN en el select) o 'true' (de un checkbox), retorna 'BIEN'
    if (value === 1 || value === true) return 'BIEN';
    // Si el valor es '2' (de SI:MAL en el select), retorna 'MAL'
    if (value === 2) return 'MAL';
    // Si el valor es '3' (de NO en el select), retorna 'N/A' (como "No aplica" o "Ausente")
    if (value === 3) return 'N/A';
    // Si el valor es '0' (de Seleccione...) o 'false' (de un checkbox), retorna un string vacío
    if (value === 0 || value === false) return '';
    // Para cualquier otro caso (null, undefined, etc.), retorna 'N/A'
    return 'N/A';
};

// 2. Main PDF Generation Function
// ---
/**
 * Generates a dynamic PDF for a vehicular inspection report based on the provided ID.
 *    
 * @param idRV The ID of the vehicular inspection record.
 * @returns A jsPDF document instance.
 * @throws {Error} If `idRV` is not provided or if no data is found for the given ID.
 */
export async function generarPDF(idRV: string): Promise<jsPDF> {
    if (!idRV) {
        console.error('[PDF] ID de Revista (idRV) no proporcionado.');
        throw new Error('ID de Revista (idRV) es requerido para generar el PDF.');
    }

    console.log(`[PDF] Iniciando generación de PDF para IdRevistaVehicular: ${idRV}...`);

    // Initialize jsPDF document with A4 portrait orientation
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' }); // Tamaño carta

    try {
        // Fetch inspection data from the API
        const responseData = await apiClient(`/revista/${idRV}`, {
            method: 'GET',
            withCredentials: true,
        });
        const inspectionData = responseData.data;
        console.log('[PDF] Datos de inspección obtenidos:', inspectionData);
        if (!inspectionData) {
            throw new Error('No se encontraron datos para la revista vehicular.');
        }

        // Set default font and size for the document
        doc.setFont('helvetica');
        doc.setFontSize(12);

        // --- Header Section ---
        // Logos
        const logoIzquierdo = "https://res.cloudinary.com/dvvhnrvav/image/upload/v1750179371/transporte/ydrefbxmpld29lrcskkt.png";
        doc.addImage(logoIzquierdo, "PNG", 15, 10, 40, 20);

        const logoDerecho = "https://res.cloudinary.com/dvvhnrvav/image/upload/v1750179074/transporte/lamhdjofyqwajgu6rzno.png";
        doc.addImage(logoDerecho, "JPEG", 180, 10, 20, 20);

        // Dynamic Folio
        doc.setTextColor(255, 0, 0); // Red color for "No:"
        doc.text('No:', 185, 35);
        doc.setTextColor(0, 0, 0); // Black color for the folio number
        doc.text(inspectionData.IdRevistaVehicular || 'N/A', 195, 35);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Basic Information
        let y = 40; // Initial Y position for basic info
        const fechaInspeccion = inspectionData.DiaInspeccion && inspectionData.MesInspeccion && inspectionData.AnioInspeccion
            ? `${inspectionData.DiaInspeccion}/${inspectionData.MesInspeccion}/${inspectionData.AnioInspeccion}`
            : 'N/A';
        doc.text(`FECHA DE INSPECCIÓN: ${fechaInspeccion}`, 15, y);
        doc.text(`NÚMERO DE AUTORIZACIÓN: ${inspectionData.IdConsesion || 'N/A'}`, 130, y);

        y += 6;
        doc.text(`PARA TRÁMITE DE: ${inspectionData.Tramite || 'N/A'}`, 15, y);
        doc.text(`MUNICIPIO: ${inspectionData.Municipio || 'N/A'}`, 130, y);
        
        y += 6;
        doc.text(`PROPIETARIO: ${inspectionData.NombreCompletoNA || 'N/A'}`, 130, y);
        doc.text(`TIPO DE SERVICIO (MODALIDAD): ${inspectionData.Modalidad || 'N/A'}`, 15, y);

        // --- Vehicular Characteristics Section ---
        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('CARACTERÍSTICAS VEHICULARES', doc.internal.pageSize.width / 2, y, { align: 'center' });
        doc.setFont('helvetica', 'normal');

        y += 10;
        // Define X coordinates for the three columns
        const col1X = 15;
        const col2X = 75;
        const col3X = 145;

        // Row 1
        doc.text(`MARCA: ${inspectionData.Marca || 'N/A'}`, col1X, y);
        doc.text(`No. DE MOTOR: ${inspectionData.NumeroMotor || 'N/A'}`, col2X, y);
        doc.text(`No. DE SERIE: ${inspectionData.NumeroSerie || 'N/A'}`, col3X, y);
        y += 6;
        
        // Row 2
        doc.text(`TIPO DE VEHÍCULO: ${inspectionData.TipoVehiculo || 'N/A'}`, col1X, y);
        doc.text(`SUBMARCA: ${inspectionData.SubMarca || 'N/A'}`, col2X, y);
        doc.text(`IMAGEN CROMÁTICA: ${formatBoolean(inspectionData.ImagenCromaticaVer)}`, col3X, y);
        y += 6;
        
        // Row 3
        doc.text(`MODELO: ${inspectionData.Modelo || 'N/A'}`, col1X, y);
        doc.text(`PLACA DELANTERA: ${formatBoolean(inspectionData.PlacaDelantera)}`, col2X, y);
        doc.text(`PLACA TRASERA: ${formatBoolean(inspectionData.PlacaTrasera)}`, col3X, y);
        y += 6;

        // Row 4
        doc.text(`PLACAS ASIG.: ${inspectionData.PlacaAsignada || 'N/A'}`, col1X, y);
        doc.text(`CALCOMANÍA DE VERIFICACIÓN: ${formatBoolean(inspectionData.CalcaVerificacionVer)}`, col2X, y);
        doc.text(`CALCOMANÍA DE LA TENENCIA: ${formatBoolean(inspectionData.CalcaTenenciaVer)}`, col3X, y);
        y += 6;

        // --- Inspection Checklist Section ---
        y += 10;
        doc.setFontSize(9);
        let positiveChecksCount = 0; // This variable is declared but not used for any output in the PDF, consider removing or using it.
        const totalChecks = 24; // 8 rows * 3 columns - This variable is declared but not used for any output in the PDF, consider removing or using it.

        const checklistItems = [
            ['PINTURA Y CARROCERÍA', 'PinturaCarroceriaVer', 'CLAXON', 'ClaxonVer', 'EXTINTOR', 'EstinguidorVer'],
            ['ESTADO DE LLANTAS', 'EstadoLlantasVer', 'LUZ BAJA', 'LuzBajaVer', 'HERRAMIENTA', 'HerramientaVer'],
            ['DEFENSAS', 'DefensasVer', 'LUZ ALTA', 'LuzAltaVer', 'SISTEMA DE FRENADO', 'SistemaFrenadoVer'],
            ['VIDRIOS', 'VidriosVer', 'CUARTOS', 'CuartosVer', 'SISTEMA DE DIRECCIÓN', 'SistemaDireccionVer'],
            ['LIMPIADORES', 'LimpiadoresVer', 'DIRECCIONALES', 'DireccionalesVer', 'SISTEMA DE SUSPENSIÓN', 'SistemaSuspensionVer'],
            ['ESPEJOS', 'EspejosVer', 'INTERMITENTES', 'IntermitentesVer', 'INTERIORES', 'InterioresVer'],
            ['LLANTA DE REFACCIÓN', 'LlantaRefaccionVer', 'STOP', 'StopVer', 'BOTIQUÍN', 'BotiquinVer'],
            ['PARABRISAS MEDALLÓN', 'ParabrisasMedallonVer', 'TIMBRE', 'TimbreVer', 'CINTURÓN DE SEGURIDAD', 'CinturonSeguridadVer']
        ];

        checklistItems.forEach((row) => {
            doc.text(row[0], 15, y);
            const val1 = inspectionData[row[1] as keyof typeof inspectionData];
            doc.text(formatBoolean(val1), 80, y);
            if (val1 === 2 || val1 === true) positiveChecksCount++;

            doc.text(row[2], 95, y);
            const val2 = inspectionData[row[3] as keyof typeof inspectionData];
            doc.text(formatBoolean(val2), 130, y);
            if (val2 === 2 || val2 === true) positiveChecksCount++;

            doc.text(row[4], 145, y);
            const val3 = inspectionData[row[5] as keyof typeof inspectionData];
            doc.text(formatBoolean(val3), 200, y);
            if (val3 === 2 || val3 === true) positiveChecksCount++;

            y += 6;
        });
        doc.setFontSize(10);

        // Insurance Information
        y += 2;
        doc.text(`CIA. ASEGURADORA: ${inspectionData.ciaAseguradora || 'N/A'}`, 15, y);
        doc.text(`NÚMERO DE PÓLIZA: ${inspectionData.NumeroPoliza || 'N/A'}`, 80, y);
        doc.text(`VIGENCIA: ${inspectionData.FechaVencimiento ? new Date(inspectionData.FechaVencimiento).toLocaleDateString() : 'N/A'}`, 150, y);

        // --- Ponderation Details Section (placed before Observations as per new order) ---
        // Define X coordinates for the three columns

        // --- Ponderation Details Section (placed before Observations as per new order) ---

        // Row 1 of Ponderation
        y += 8; // Add more space from the insurance info
        doc.text(`MODELO: ${inspectionData.RangoAnio || 'N/A'}`, col1X, y);
        doc.text(`TIENE AIRE ACONDICIONADO: ${formatBoolean(inspectionData.TieneAire)}`, col2X, y);
        doc.text(`CAPACIDAD: ${inspectionData.Capacidad || 'N/A'}`, col3X, y);

        // Row 2 of Ponderation
        y += 8;
        doc.text(`TIPO DE BOLSA DE AIRE: ${inspectionData.TipoBolsa !== undefined ? inspectionData.TipoBolsa : 'N/A'}`, col1X, y);
        doc.text(`TIPO: ${inspectionData.Tipo || 'N/A'}`, col2X, y);
        doc.text(`TIPO DE FRENO: ${inspectionData.TipoFreno || 'N/A'}`, col3X, y);

        // Row 3 of Ponderation
        y += 8;
        doc.text(`CANTIDAD DE CINTURONES: ${inspectionData.Cantidad || 'N/A'}`, col1X, y);
        doc.text(`MATERIAL DE TAPICERÍA: ${inspectionData.Material || 'N/A'}`, 120, y);

        // --- Observations and Approval Section ---
        y += 10; // Space after ponderation details
        doc.setFont('helvetica', 'bold');
        doc.text('OBSERVACIONES:', 15, y);
        doc.setFont('helvetica', 'normal');
        // Split text to fit within the column width for observations
        const observationsText = doc.splitTextToSize(inspectionData.Observaciones || 'Sin observaciones.', 180);
        doc.text(observationsText, 50, y);
        // Adjust Y position based on the number of lines in observations
        y += (observationsText.length - 1) * doc.getLineHeight() / doc.internal.scaleFactor + 5;

        y += 10;
        doc.text(`APROBADO: ${formatBoolean(inspectionData.Aprobado)}`, doc.internal.pageSize.width / 2, y, { align: 'center' });

        y += 10;
        doc.setFontSize(9);
        doc.text('NOTA: NO CUMPLIR CON CUALQUIERA DE LOS PUNTOS ANTERIORES IMPLICA LA NO APROBACIÓN DE LA INSPECCIÓN VEHICULAR', 15, y, {
            maxWidth: 180,
        });

        // --- Signatures Section ---
        y += 12;
        doc.setFontSize(10);
        doc.text('INSPECTOR', 45, y);
        doc.text(inspectionData.Inspector || 'N/A', 30, y + 5);
        doc.text('INTERESADO', 140, y);
        doc.text(inspectionData.NombreCompletoNA || 'N/A', 130, y + 5);

        // Signature lines
        doc.line(30, y + 15, 80, y + 15);
        doc.text('NOMBRE Y FIRMA', 40, y + 20);
        doc.line(130, y + 15, 180, y + 15);
        doc.text('NOMBRE Y FIRMA', 140, y + 20);

        // --- Score and Classification Section (placed absolutely at the bottom, before footer) ---
        // Calculate the initial Y position for this final part of the ponderation.
        const footerHeight = 25; // Estimated height for the footer
        const scoreClassificationHeight = 6; // Only 1 row of 6mm
        let bottomPonderationY = doc.internal.pageSize.height - footerHeight - scoreClassificationHeight - 5; // -5 for a small margin

        // Ensure it doesn't overlap with the signatures content, if space is tight
        bottomPonderationY = Math.max(bottomPonderationY, y + 40); // 'y' is the current position after signatures + 20mm buffer

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold'); // Keep bold for Score and Classification
        doc.text(`PUNTUACIÓN OBTENIDA: ${inspectionData.Puntuacion !== undefined ? inspectionData.Puntuacion : 'N/A'}`, col1X, bottomPonderationY);
        doc.text(`CLASIFICACIÓN: ${inspectionData.Clasificacion || 'N/A'}`, col2X, bottomPonderationY);
        // No increment needed after this as the footer comes immediately after

        // --- Footer Section ---
        let footerY = doc.internal.pageSize.height - 20; // Fixed to 20mm from the bottom for the footer

        doc.setFontSize(9);
        doc.text('Av. de la Prensa No. 205, Col. L. García', 150, footerY);
        doc.text('Pachuca de Soto, Hidalgo, México', 158, footerY + 5);
        doc.text('Tel: 01 (771) 717 8000 ext. 1755', 160, footerY + 10);

        console.log('[PDF] PDF generado dinámicamente.');
        return doc;
    } catch (error) {
        console.error('[PDF] Error al generar el PDF:', error);
        throw error;
    }
}

// 3. PDF Saving Function
// ---
/**
 * Saves the generated jsPDF document to a file.
 *
 * @param doc The jsPDF document instance to save.
 * @param filename The desired name for the PDF file (without extension).
 */
export function savePDF(doc: jsPDF, filename: string): void {
    try {
        console.log(`[PDF] Guardando PDF como: ${filename}.pdf`);
        doc.save(`${filename}.pdf`);
        console.log('[PDF] Archivo guardado correctamente');
    } catch (error) {
        console.error('[PDF] Error al guardar el PDF:', error);
    }
}