import jsPDF from 'jspdf';
import apiClient from "@/lib/apiClient";

// 1. Helper Functions
// ---

/**
 * Formats a boolean or number value into 'BIEN', 'MAL', 'N/A', or an empty string.
 * This function is used for fields with three possible states.
 *
 * @param value The boolean, number, null, or undefined value to format.
 * @returns A formatted string.
 */
const formatBoolean = (value: boolean | number | null | undefined): string => {
    if (value === 1 || value === true) return 'BIEN';
    if (value === 2) return 'MAL';
    if (value === 3) return 'N/A';
    if (value === 0 || value === false) return '';
    return 'N/A';
};

/**
 * Formats a boolean value to 'SÍ' or 'NO'.
 * This function is used for boolean fields.
 *
 * @param value The boolean value to format.
 * @returns 'SÍ' if value is true, 'NO' if value is false.
 */
const formatSiNo = (value: boolean): string => {
    return value ? 'SÍ' : 'NO';
};
// Mapeo local para la generación del PDF.
// Esto debe reflejar las opciones definidas en tu formulario.
// Define el tipo de tu objeto de mapeo para que TypeScript sepa qué claves y valores esperar.
type BolsasAireMap = {
    "1": string;
    "2": string;
    "3": string;
};

// ... (código anterior) ...

const bolsasAireMap: BolsasAireMap = {
    "1": "NINGUNA",
    "2": "FRONTALES",
    "3": "FRONTALES Y LATERALES",
};

/**
 * Helper function to truncate text and add ellipsis if it exceeds max width or max characters.
 *
 * @param doc The jsPDF document instance for text measurement.
 * @param text The string to truncate.
 * @param maxWidth The maximum allowed width for the text in mm.
 * @param fontSize The font size in points to use for text measurement.
 * @param maxChars Optional: The maximum number of characters allowed before truncation, including ellipsis.
 * @returns The truncated string with ellipsis if necessary, or "N/A" if text is null/undefined.
 */
const truncateText = (
    doc: jsPDF,
    text: string | number | null | undefined,
    maxWidth: number,
    fontSize: number,
    maxChars?: number
): string => {
    const inputText = (text === null || text === undefined) ? 'N/A' : String(text);
    let resultText = inputText;
    const ellipsis = '...';

    if (maxChars !== undefined && inputText.length > maxChars) {
        const sliceLength = Math.max(0, maxChars - ellipsis.length);
        resultText = inputText.slice(0, sliceLength) + ellipsis;
    }

    doc.setFontSize(fontSize);
    const scaleFactor = doc.internal.scaleFactor;
    let currentTextWidth = doc.getStringUnitWidth(resultText) * fontSize / scaleFactor;

    if (currentTextWidth > maxWidth) {
        const ellipsisWidth = doc.getStringUnitWidth(ellipsis) * fontSize / scaleFactor;
        let truncatedByWidthText = resultText;
        let newWidth = currentTextWidth;

        while (newWidth >= maxWidth - ellipsisWidth && truncatedByWidthText.length > 0) {
            truncatedByWidthText = truncatedByWidthText.slice(0, -1);
            newWidth = doc.getStringUnitWidth(truncatedByWidthText) * fontSize / scaleFactor;
        }
        resultText = truncatedByWidthText + ellipsis;
    }

    return resultText;
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

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

    try {
        const responseData = await apiClient(`/revista/${idRV}`, {
            method: 'GET',
            withCredentials: true,
        });
        const inspectionData = responseData.data;
        console.log('[PDF] Datos de inspección obtenidos:', inspectionData);
        if (!inspectionData) {
            throw new Error('No se encontraron datos para la revista vehicular.');
        }

        doc.setFont('helvetica');
        doc.setFontSize(12);

        // --- Imgs urls ---
        const logoIzquierdo = "/imagens/LogotipoMovilidadHidalgo.png";
        doc.addImage(logoIzquierdo, "PNG", 15, 10, 40, 20);

        const logoDerecho = "/imagens/EscudodeHidalgo.png";
        doc.addImage(logoDerecho, "JPEG", 180, 10, 20, 20);

        // --- ETIQUETA Y VALOR DE FOLIO ---
        /*
         El valor se imprime en las coordenadas (188, 35). La posición X de 188 está más cerca de 179
         */
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.setTextColor(255, 0, 0);
        doc.text('Folio:', 178, 35);


        doc.setTextColor(0, 0, 0);
        doc.text(truncateText(doc, inspectionData.IdRevistaVehicular, 30, 10, 20), 188, 35);


        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        let y = 40;
        const fechaInspeccion = inspectionData.DiaInspeccion && inspectionData.MesInspeccion && inspectionData.AnioInspeccion
            ? `${inspectionData.DiaInspeccion}/${inspectionData.MesInspeccion}/${inspectionData.AnioInspeccion}`
            : 'N/A';
        doc.text(`FECHA DE INSPECCIÓN: ${fechaInspeccion}`, 15, y);
        doc.text(`AUTORIZACIÓN: ${truncateText(doc, inspectionData.NumeroAutorizacion, 60, 10, 20)}`, 130, y);

        y += 6;
        doc.text(`PARA TRÁMITE DE: ${truncateText(doc, inspectionData.Tramite, 80, 10, 20)}`, 15, y);
        doc.text(`MODALIDAD: ${truncateText(doc, inspectionData.Modalidad, 60, 10, 20)}`, 130, y);

        y += 6;
        doc.text(`MUNICIPIO: ${truncateText(doc, inspectionData.Municipio, 80, 10, 20)}`, 15, y);
        doc.text(`TÉLEFONO: ${truncateText(doc, inspectionData.Telefono, 60, 10, 20)}`, 130, y);

        y += 6;
        doc.text(`PROPIETARIO:`, 15, y);
        const propietarioText = doc.splitTextToSize(inspectionData.NombreCompletoNA || 'N/A', 150);
        doc.text(propietarioText, 45, y);

        y += (propietarioText.length - 1) * 5;

        y += 2;
        doc.setFont('helvetica', 'bold');
        doc.text('CARACTERÍSTICAS VEHICULARES', 115, y + 5, { align: 'center' });
        doc.setFont('helvetica', 'normal');

        y += 10;
        const col1X = 15;
        const col2X = 75;
        const col3X = 145;
        // Row 1
        doc.text(`MARCA: ${truncateText(doc, inspectionData.Marca, 50, 10, 20)}`, col1X, y);
        doc.text(`No. DE MOTOR: ${truncateText(doc, inspectionData.NumeroMotor, 60, 10, 20)}`, col2X, y);
        doc.text(`No. DE SERIE: ${truncateText(doc, inspectionData.NumeroSerie, 60, 10, 20)}`, col3X, y);
        y += 6;

        // Row 2
        doc.text(`TIPO: ${truncateText(doc, inspectionData.TipoVehiculo, 50, 10, 20)}`, col1X, y);
        doc.text(`SUBMARCA: ${truncateText(doc, inspectionData.SubMarca, 60, 10, 20)}`, col2X, y);
        doc.text(`IMAGEN CROMÁTICA: ${formatSiNo(inspectionData.ImagenCromaticaVer)}`, col3X, y);
        y += 6;

        // Row 3
        doc.text(`MODELO: ${truncateText(doc, String(inspectionData.Modelo), 50, 10, 20)}`, col1X, y);
        doc.text(`PLACA DELANTERA: ${formatSiNo(inspectionData.PlacaDelantera)}`, col2X, y);
        doc.text(`PLACA TRASERA: ${formatSiNo(inspectionData.PlacaTrasera)}`, col3X, y);
        y += 6;

        // Row 4
        doc.text(`PLACAS ASIG.: ${truncateText(doc, inspectionData.PlacaAsignada, 50, 10, 20)}`, col1X, y);
        doc.text(`CALCOMANÍA DE VERIFICACIÓN: ${formatSiNo(inspectionData.CalcaVerificacionVer)}`, col2X, y);
        doc.text(`CALCOMANÍA DE LA TENENCIA: ${formatSiNo(inspectionData.CalcaTenenciaVer)}`, col3X, y);
        y += 6;

        // --- Inspection Checklist Section ---
        y += 2;
        doc.setFontSize(9);
        let positiveChecksCount = 0;
        const checklistItems = [
            // Campos con 'SI' o 'NO'
            ['PINTURA Y CARROCERÍA', 'PinturaCarroceriaVer', 'CLAXON', 'ClaxonVer', 'EXTINGUIDOR', 'EstinguidorVer'],
            ['ESTADO DE LLANTAS', 'EstadoLlantasVer', 'LUZ BAJA', 'LuzBajaVer', 'HERRAMIENTAS', 'HerramientaVer'],
            ['DEFENSAS', 'DefensasVer', 'LUZ ALTA', 'LuzAltaVer', 'SISTEMA DE FRENADO', 'SistemaFrenadoVer'],
            ['CINTURÓN DE SEGURIDAD', 'CinturonSeguridadVer', 'CUARTOS', 'CuartosVer', 'SISTEMA DE DIRECCIÓN', 'SistemaDireccionVer'],
            ['INTERIORES', 'InterioresVer', 'DIRECCIONALES', 'DireccionalesVer', 'SISTEMA DE SUSPENSIÓN', 'SistemaSuspensionVer'],
            ['BOTIQUÍN', 'BotiquinVer', 'INTERMITENTES', 'IntermitentesVer', 'TIMBRE', 'TimbreVer'],
            ['IMAGEN CROMÁTICA', 'ImagenCromaticaVer', 'STOP', 'StopVer'],
        ];

        checklistItems.forEach((row) => {
            doc.text(row[0], 15, y);
            const val1 = inspectionData[row[1] as keyof typeof inspectionData];
            doc.text(formatSiNo(val1), 80, y); // <-- Se usa formatSiNo
            if (val1) positiveChecksCount++;

            if (row[2]) {
                doc.text(row[2], 95, y);
                const val2 = inspectionData[row[3] as keyof typeof inspectionData];
                doc.text(formatSiNo(val2), 130, y); // <-- Se usa formatSiNo
                if (val2) positiveChecksCount++;
            }

            if (row[4]) {
                doc.text(row[4], 145, y);
                const val3 = inspectionData[row[5] as keyof typeof inspectionData];
                doc.text(formatSiNo(val3), 200, y); // <-- Se usa formatSiNo
                if (val3) positiveChecksCount++;
            }
            y += 6;
        });

        const checklistItemsBoolean = [
            // Campos con 'BIEN', 'MAL' o 'N/A'
            ['DEFENSAS', 'DefensasVer'],
            ['VIDRIOS', 'VidriosVer'],
            ['LIMPIADORES', 'LimpiadoresVer'],
            ['ESPEJOS', 'EspejosVer'],
            ['LLANTA DE REFACCIÓN', 'LlantaRefaccionVer'],
            ['PARABRISAS MEDALLÓN', 'ParabrisasMedallonVer']
        ];


        // Configuración de columnas para la verificación adicional
        const colVerifX1 = 15;
        const colVerifX2 = 80;
        const colVerifX3 = 145;
        const valueOffset = 40; // Espacio entre nombre y valor
        const rowHeight = 6;

        // Primera columna (2 elementos)
        doc.text(checklistItemsBoolean[0][0], colVerifX1, y);
        doc.text(formatBoolean(inspectionData[checklistItemsBoolean[0][1] as keyof typeof inspectionData]), colVerifX1 + valueOffset, y);
        doc.text(checklistItemsBoolean[1][0], colVerifX1, y + rowHeight);
        doc.text(formatBoolean(inspectionData[checklistItemsBoolean[1][1] as keyof typeof inspectionData]), colVerifX1 + valueOffset, y + rowHeight);

        // Segunda columna (2 elementos)
        doc.text(checklistItemsBoolean[2][0], colVerifX2, y);
        doc.text(formatBoolean(inspectionData[checklistItemsBoolean[2][1] as keyof typeof inspectionData]), colVerifX2 + valueOffset, y);
        doc.text(checklistItemsBoolean[3][0], colVerifX2, y + rowHeight);
        doc.text(formatBoolean(inspectionData[checklistItemsBoolean[3][1] as keyof typeof inspectionData]), colVerifX2 + valueOffset, y + rowHeight);

        // Tercera columna (2 elementos)
        doc.text(checklistItemsBoolean[4][0], colVerifX3, y);
        doc.text(formatBoolean(inspectionData[checklistItemsBoolean[4][1] as keyof typeof inspectionData]), colVerifX3 + valueOffset, y);
        doc.text(checklistItemsBoolean[5][0], colVerifX3, y + rowHeight);
        doc.text(formatBoolean(inspectionData[checklistItemsBoolean[5][1] as keyof typeof inspectionData]), colVerifX3 + valueOffset, y + rowHeight);

        y += rowHeight * 2; // Ajustamos el valor de y para el siguiente elemento

        doc.setFontSize(10);

        // Insurance Information
        y += 2;
        doc.text(`CIA. ASEGURADORA: ${truncateText(doc, inspectionData.ciaAseguradora, 60, 10, 20)}`, 15, y);
        doc.text(`NÚMERO DE PÓLIZA: ${truncateText(doc, inspectionData.NumeroPoliza, 50, 10, 20)}`, 80, y);
        doc.text(`VIGENCIA: ${inspectionData.FechaVencimiento ? new Date(inspectionData.FechaVencimiento).toLocaleDateString() : 'N/A'}`, 150, y);

        // --- Ponderation Details Section ---
        y += 8;
        doc.text(`MODELO: ${truncateText(doc, inspectionData.RangoAnio, 50, 10, 20)}`, col1X, y);
        doc.text(`CON AIRE ACONDICIONADO: ${formatSiNo(inspectionData.TieneAire)}`, col2X, y);
        doc.text(`CAPACIDAD: ${truncateText(doc, inspectionData.Capacidad, 50, 10, 20)}`, col3X, y);
        y += 2;
        // La línea corregida. 
        // Usamos una aserción de tipo para decirle a TypeScript que el valor de TipoBolsa
        // es una clave válida para el mapa.
        const tipoBolsaKey = String(inspectionData.TipoBolsa) as keyof BolsasAireMap;
        const tipoBolsaLabel = bolsasAireMap[tipoBolsaKey] || 'N/A';


        const tipoVehiculoLabel = truncateText(doc, inspectionData.Tipo, 50, 10, 20);
        const tipoFrenoLabel = truncateText(doc, inspectionData.TipoFreno, 50, 10, 20);

        // --- Código con la posición vertical más alta ---
        doc.text(`BOLSA DE AIRE: ${tipoBolsaLabel}`, 10, 170);
        doc.text(`TIPO: ${tipoVehiculoLabel}`, 90, 170);
        doc.text(`TIPO DE FRENO: ${tipoFrenoLabel}`, 150, 170);
        y += 3;

        doc.text(`CANTIDAD DE CINTURONES: ${truncateText(doc, String(inspectionData.Cantidad), 50, 10, 20)}`, col1X, y);
        doc.text(`MATERIAL DE TAPICERÍA: ${truncateText(doc, inspectionData.Material, 50, 10, 20)}`, 120, y);
        y += 10;

        doc.setFont('helvetica', 'bold');
        doc.text('CARACTERÍSTICAS VEHICULARES', 115, y + 5, { align: 'center' });
        doc.setFont('helvetica', 'normal');

        y += 10;
        // Tu código original para el texto sin bordes
        doc.text('No. DE MOTOR:', 40, y);
        doc.text('No. DE SERIE:', 140, y);

        // ---
        // Definimos una nueva coordenada 'y' para el espacio de abajo
        // Por ejemplo, le sumamos 10 a la coordenada 'y' original para que aparezca más abajo.
        const y_abajo = y + 10;

        // Ahora, dibuja un rectángulo más alto debajo del texto "No. DE MOTOR:"
        doc.setDrawColor(0, 0, 0); // Color del borde: negro
        doc.setLineWidth(0.5); // Ancho del borde: 0.5 puntos
        // El último valor, '20', hace que el rectángulo sea más alto.
        doc.rect(10, y_abajo - 5, 90, 30); // x, y, ancho, alto

        // Y el rectángulo más alto debajo del texto "No. DE SERIE:"
        // El último valor, '20', hace que el rectángulo sea más alto.
        doc.rect(120, y_abajo - 5, 90, 30); // x, y, ancho, alto
        y = Math.max(y, doc.internal.pageSize.height / 2 + 30);

        // --- Observations and Approval Section ---
        y += 40;
        doc.setFont('helvetica', 'bold');
        doc.text('OBSERVACIONES:', 15, y);
        doc.setFont('helvetica', 'normal');
        const observationsText = doc.splitTextToSize(inspectionData.Observaciones || 'Sin observaciones.', 140);
        doc.text(observationsText, 50, y);
        y += (observationsText.length - 1) * doc.getLineHeight() / doc.internal.scaleFactor + 5;

        y += 5;
        doc.setFont('helvetica', 'bold');
        doc.text(`APROBADO: ${formatSiNo(inspectionData.Aprobado)}`, doc.internal.pageSize.width / 2, y, { align: 'center' });

        // --- Signatures Section ---
        y += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        doc.text('INTERESADO', doc.internal.pageSize.width / 2, y, { align: 'center' });
        doc.text(inspectionData.NombreCompletoNA || 'N/A', doc.internal.pageSize.width / 2, y + 5, { align: 'center' });

        const signatureLineLength = 50;
        const signatureLineX = (doc.internal.pageSize.width - signatureLineLength) / 2;
        doc.line(signatureLineX, y + 15, signatureLineX + signatureLineLength, y + 15);

        doc.text('NOMBRE Y FIRMA', doc.internal.pageSize.width / 2, y + 20, { align: 'center' });

        // --- Score and Classification Section (placed absolutely at the bottom, before footer) ---
        const footerHeight = 25;
        const scoreClassificationHeight = 6;
        let bottomPonderationY = doc.internal.pageSize.height - footerHeight - scoreClassificationHeight - 5;
        bottomPonderationY = Math.max(bottomPonderationY, y + 40);

        /*
        const lineY = inspectorY - 2;: Se define una nueva variable lineY para la posición vertical de la línea. 
        Se resta 2 de la posición del texto (inspectorY) para que la línea quede ligeramente arriba del texto, dejando un pequeño espacio.
        doc.line(col1X, lineY, col1X + 100, lineY);: Esta es la función clave para dibujar la línea.
        col1X: La coordenada X de inicio de la línea.
        lineY: La coordenada Y de inicio y fin de la línea.
        col1X + 100: La coordenada X de fin. Se extiende 100 unidades para que sea lo suficientemente larga para una firma.
        lineY: La coordenada Y de fin.
        */

        doc.setFontSize(10);

        const inspectorLabel = 'INSPECTOR: ';
        const inspectorName = inspectionData.Inspector;
        const inspectorY = bottomPonderationY - 15;

        // Dibuja la línea horizontal para la firma
        const lineY = inspectorY - 5; // Ajusta la posición de la línea
        doc.line(col1X, lineY, col1X + 60, lineY);// modificado para que la línea sea más corta de 100 a 60
        doc.setFont('helvetica', 'bold');
        // Muestra la etiqueta y el nombre del inspector, con salto de línea si es necesario
        const inspectorText = inspectorLabel + inspectorName;
        const maxWidthForInspector = 100;
        const inspectorTextLines = doc.splitTextToSize(inspectorText, maxWidthForInspector);
        doc.text(inspectorTextLines, col1X, inspectorY);
        /*
        // **************************************************************************************
        // esta parte del código se ha comentado porque no se está utilizando en este momento.
        // Si en el futuro necesitas mostrar la puntuación y clasificación, puedes descomentarla y
        // ajustar la lógica según sea necesario.
        // **************************************************************************************
      
        // const newYForPonderation = inspectorY + (inspectorTextLines.length * 6);
        // doc.setFont('helvetica', 'bold');

        // const puntuacionText = `PUNTUACIÓN OBTENIDA: ${truncateText(doc, String(inspectionData.Puntuacion), 40, 10, 20)}`;
        // doc.text(puntuacionText, col1X, newYForPonderation);

        // const puntuacionWidth = doc.getStringUnitWidth(puntuacionText) * doc.getFontSize() / doc.internal.scaleFactor;
        // const marginX = 10;
        // const newCol2X = col1X + puntuacionWidth + marginX;

        // doc.text(`CLASIFICACIÓN: ${truncateText(doc, inspectionData.Clasificacion, 60, 10, 20)}`, newCol2X, newYForPonderation);
        */
        // --- Footer Section ---
        let footerY = doc.internal.pageSize.height - 15;

        /*
        /*******************************************************************************
        // El valor de coordenadaX define la posición horizontal desde la izquierda. Un valor más pequeño, como 10 en este caso, lo a
        /*******************************************************************************
        */
        doc.setFontSize(9);
        doc.text('Avenida de Los Prismas N° 205, Colonia La Colonia', 135, footerY);
        doc.text('Pachuca de Soto, Hidalgo; México, C.P. 42083', 143, footerY + 5);
        doc.text('Tel: 01 (771) 717 6000 Ext. 1797', 165, footerY + 10);
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