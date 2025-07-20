// Asegúrate de que jsPDF esté instalado: npm install jspdf
// Asegúrate de que axios esté instalado: npm install axios
import jsPDF from 'jspdf';
import axios from 'axios'; // Aunque uses apiClient, axios se importa para tipado o si lo usas directamente en otro lugar.
import apiClient from "@/lib/apiClient"; // Tu instancia de Axios personalizada

// Helper function to format boolean and specific numeric values for display
const formatBoolean = (value: boolean | number | null | undefined) => {
    if (value === 2 || value === true) return 'BIEN'; // Corresponds to value="2" or true
    if (value === 1) return 'MAL';  // Corresponds to value="1"
    if (value === 0 || value === false) return ''; // Corresponds to value="0" or false, now returns empty string
    return 'N/A'; // Not Applicable or Unknown
};

// Function to generate the PDF dynamically
export async function generarPDF(idRV: string) { // Accept idRV as parameter
    if (!idRV) {
        console.error('[PDF] ID de Revista (idRV) no proporcionado.');
        throw new Error('ID de Revista (idRV) es requerido para generar el PDF.');
    }

    console.log(`[PDF] Iniciando generación de PDF para IdRevistaVehicular: ${idRV}...`);
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' }); // Tamaño carta

    try {
        // 1. Fetch Inspection Data
        // apiClient ya devuelve response.data directamente, no necesitas .data de nuevo
        const responseData = await apiClient(`/revista/${idRV}`, { // Endpoint ajustado, asumiendo que es /api/revista/:idRV
            method: 'GET',
            withCredentials: true,
        });
        console.log("Respuesta completa de la API:", responseData); // Log para ver la estructura real

        // Accede a la propiedad 'data' si tu API la anida, de lo contrario usa responseData directamente
        // Basado en tu ejemplo, parece que la data relevante está anidada en 'data'
        const inspectionData = responseData.data; 

        if (!inspectionData) {
            throw new Error('No se encontraron datos para la revista vehicular.');
        }

        console.log("Datos de inspección procesados:", inspectionData);
        // 2. NO SE CARGAN NI SE USAN IMÁGENES (esto es una nota, no una funcionalidad)


        doc.setFont('helvetica');
        doc.setFontSize(12);

        // Logos (comentados, si no quieres que se generen)
        const logoIzquierdo = "https://res.cloudinary.com/dvvhnrvav/image/upload/v1750179371/transporte/ydrefbxmpld29lrcskkt.png";
        doc.addImage(logoIzquierdo, "PNG", 15, 10, 40, 20);

        const logoDerecho = "https://res.cloudinary.com/dvvhnrvav/image/upload/v1750179074/transporte/lamhdjofyqwajgu6rzno.png";
        doc.addImage(logoDerecho, "JPEG", 180, 10, 20, 20);

        // Folio Dinámico
        doc.setTextColor(255, 0, 0);
        doc.text('No:', 185, 35);
        doc.setTextColor(0, 0, 0);
        doc.text(inspectionData.IdRevistaVehicular || 'N/A', 195, 35); // Usar IdRevistaVehicular como Folio

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Información básica dinámica
        let y = 40;
        // Construir FechaInspeccion a partir de Dia, Mes, Anio
        const fechaInspeccion = inspectionData.DiaInspeccion && inspectionData.MesInspeccion && inspectionData.AnioInspeccion
            ? `${inspectionData.DiaInspeccion}/${inspectionData.MesInspeccion}/${inspectionData.AnioInspeccion}`
            : 'N/A';
        doc.text(`FECHA DE INSPECCIÓN: ${fechaInspeccion}`, 15, y);
        doc.text(`NÚMERO DE AUTORIZACIÓN: ${inspectionData.IdConsesion || 'N/A'}`, 120, y); // Usar IdConsesion

        y += 6;
        doc.text(`NOMBRE DEL PROPIETARIO: ${inspectionData.NombreCompletoNA || 'N/A'}`, 15, y); // Usar NombreCompletoNA
        doc.text(`TELÉFONO: ${inspectionData.Telefono || 'N/A'}`, 120, y); // Usar Telefono

        y += 6;
        doc.text(`PARA TRÁMITE DE: ${inspectionData.Tramite || 'N/A'}`, 15, y); // Usar Tramite
        doc.text(`MUNICIPIO: ${inspectionData.Municipio || 'N/A'}`, 120, y);

        y += 6;
        doc.text(`TIPO DE SERVICIO (MODALIDAD): ${inspectionData.Modalidad || 'N/A'}`, 15, y);

        // Características Vehiculares
        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('CARACTERÍSTICAS VEHICULARES', doc.internal.pageSize.width / 2, y, { align: 'center' }); // Centrado horizontal
        doc.setFont('helvetica', 'normal');

        y += 10;
        doc.text(`MARCA: ${inspectionData.Marca || 'N/A'}`, 15, y);
        doc.text(`TIPO DE VEHÍCULO: ${inspectionData.TipoVehiculo || 'N/A'}`, 120, y);

        y += 6;
        doc.text(`No. DE MOTOR: ${inspectionData.NumeroMotor || 'N/A'}`, 15, y);
        doc.text(`SUBMARCA: ${inspectionData.SubMarca || 'N/A'}`, 120, y);

        y += 6;
        doc.text(`IMAGEN CROMÁTICA: ${formatBoolean(inspectionData.ImagenCromaticaVer)}`, 15, y);
        doc.text(`MODELO: ${inspectionData.Modelo || 'N/A'}`, 120, y); // Ajustado para usar Modelo

        y += 6;
        doc.text(`No. DE SERIE: ${inspectionData.NumeroSerie || 'N/A'}`, 15, y);
        doc.text(`PLACA DELANTERA: ${formatBoolean(inspectionData.PlacaDelantera)}`, 120, y); // Usar PlacaDelantera (boolean)

        y += 6;
        doc.text(`PLACAS ASIG.: ${inspectionData.PlacaAsignada || 'N/A'}`, 15, y); // Usar PlacaAsignada
        doc.text(`PLACA TRASERA: ${formatBoolean(inspectionData.PlacaTrasera)}`, 120, y); // Usar PlacaTrasera (boolean)

        y += 6;
        doc.text(`CALCOMANÍA DE VERIFICACIÓN: ${formatBoolean(inspectionData.CalcaVerificacionVer)}`, 120, y);

        y += 6;
        doc.text(`CALCOMANÍA DE LA TENENCIA: ${formatBoolean(inspectionData.CalcaTenenciaVer)}`, 120, y);

        // Tabla compacta dinámica (Ponderación)
        y += 10;
        doc.setFontSize(9); // Smaller font for checklist
        let positiveChecksCount = 0;
        // Solo contamos los elementos que realmente se muestran en el checklist
        // Hay 8 filas * 3 columnas = 24 posibles checks.
        const totalChecks = 24; 

        const checklistItems = [
            // [Label1, DataField1, Label2, DataField2, Label3, DataField3]
            ['PINTURA Y CARROCERÍA', 'PinturaCarroceriaVer', 'CLAXON', 'ClaxonVer', 'EXTINTOR', 'EstinguidorVer'],
            ['ESTADO DE LLANTAS', 'EstadoLlantasVer', 'LUZ BAJA', 'LuzBajaVer', 'HERRAMIENTA', 'HerramientaVer'], // Corregido HerramientaVer
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
            // La lógica de conteo sigue siendo para "SI:BIEN" (valor 2 o true)
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
        doc.setFontSize(10); // Reset font size

        y += 2;
        doc.text(`CIA. ASEGURADORA: ${inspectionData.ciaAseguradora || 'N/A'}`, 15, y); // Usar ciaAseguradora
        doc.text(`NÚMERO DE PÓLIZA: ${inspectionData.NumeroPoliza || 'N/A'}`, 80, y);
        doc.text(`VIGENCIA: ${inspectionData.FechaVencimiento ? new Date(inspectionData.FechaVencimiento).toLocaleDateString() : 'N/A'}`, 150, y); // Usar FechaVencimiento

        // --- Ponderación / Calificación del Vehículo ---
        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('PONDERACIÓN DEL VEHÍCULO', doc.internal.pageSize.width / 2, y, { align: 'center' });
        doc.setFont('helvetica', 'normal'); // Reset font to normal for the text content
        y += 7; // Espacio después del título de la sección

        let ratingLabel = ''; // La etiqueta especial (DEFICIENTE, REGULAR, ÓPTIMO)
        let displayRatingText = ''; // El texto que se mostrará (PRIME o el porcentaje/conteo)
        let ratingDescription = ''; // Nueva variable para la descripción
        
        // Calcular el porcentaje de ponderación
        const ponderacionPercentage = totalChecks > 0 ? Math.round((positiveChecksCount / totalChecks) * 100) : 0;

        // Los umbrales de ponderación se basan en el total de 24 checks (8 filas * 3 columnas)
        if (positiveChecksCount < 9) { // Menos de 9 checks "SI:BIEN" o true
            ratingLabel = 'DEFICIENTE';
            displayRatingText = `${ratingLabel} (${ponderacionPercentage}%)`; // Incluir porcentaje
            ratingDescription = 'Requiere atención inmediata para cumplir los estándares mínimos.'; 
        } else if (positiveChecksCount >= 9 && positiveChecksCount <= 18) { // Entre 9 y 18 checks "SI:BIEN" o true
            ratingLabel = 'REGULAR';
            displayRatingText = `${ratingLabel} (${ponderacionPercentage}%)`; // Incluir porcentaje
            ratingDescription = 'Condiciones aceptables, con áreas identificadas para mejora.'; 
        } else if (positiveChecksCount > 18) { // Más de 18 checks "SI:BIEN" o true
            ratingLabel = 'ÓPTIMO';
            displayRatingText = `PRIME (${ponderacionPercentage}%)`; // PRIME ahora incluye porcentaje
            ratingDescription = 'Vehículo en excelentes condiciones, superando los estándares de seguridad y operación.'; // Descripción específica para PRIME
        } else {
            // Fallback en caso de que no caiga en ninguna categoría (aunque debería)
            ratingLabel = 'N/A';
            displayRatingText = `N/A (${ponderacionPercentage}%)`; // Incluir porcentaje
            ratingDescription = 'No se pudo determinar la calificación por falta de datos.';
        }

        // Muestra el texto de la calificación (siempre en negro)
        doc.setTextColor(0, 0, 0); // Establecer color de texto a negro
        doc.setFontSize(10); // Tamaño de fuente para el texto principal de la calificación
        doc.text(displayRatingText, doc.internal.pageSize.width / 2, y, { align: 'center' }); 

        // Muestra la descripción si está disponible
        if (ratingDescription) {
            doc.setFontSize(8); // Tamaño de fuente más pequeño para la descripción
            doc.text(ratingDescription, doc.internal.pageSize.width / 2, y + 5, { align: 'center' }); 
            y += 15; // Incrementar Y para acomodar el texto principal y la descripción
        } else {
            y += 10; // Espacio original si no hay descripción
        }
        doc.setFontSize(10); // Restablecer tamaño de fuente para el contenido subsiguiente
        doc.setFont('helvetica', 'normal');
        // --- Fin Ponderación ---

        // Ajuste de Y para el resto del contenido
        y = Math.max(y, doc.internal.pageSize.height / 2 + 30); // Asegurarse de que Y esté por debajo de la mitad de la página


        doc.setFont('helvetica', 'bold');
        doc.text('OBSERVACIONES:', 15, y);
        doc.setFont('helvetica', 'normal');
        // Handle multi-line observations
        const observationsText = doc.splitTextToSize(inspectionData.Observaciones || 'Sin observaciones.', 180);
        doc.text(observationsText, 50, y);
        y += (observationsText.length - 1) * doc.getLineHeight() / doc.internal.scaleFactor + 5; // Adjust y based on observation lines

        y = Math.max(y, 212); // Ensure APROBADO starts at least at 212 if observations are short

        doc.text(`APROBADO: ${formatBoolean(inspectionData.Aprobado)}`, doc.internal.pageSize.width / 2, y, { align: 'center' }); // Dynamic Aprobado, centrado

        y += 10;
        doc.setFontSize(9);
        doc.text('NOTA: NO CUMPLIR CON CUALQUIERA DE LOS PUNTOS ANTERIORES IMPLICA LA NO APROBACIÓN DE LA INSPECCIÓN VEHICULAR', 15, y, {
            maxWidth: 180,
        });

        y += 12;
        doc.setFontSize(10);
        doc.text('INSPECTOR', 45, y);
        doc.text(inspectionData.Inspector || 'N/A', 30, y + 5); // Dynamic Inspector name
        doc.text('INTERESADO', 140, y);
        doc.text(inspectionData.NombreCompletoNA || 'N/A', 130, y + 5); // Dynamic Interesado name (using NombreCompletoNA)

        doc.line(30, y + 15, 80, y + 15);
        doc.text('NOMBRE Y FIRMA', 40, y + 20);
        doc.line(130, y + 15, 180, y + 15);
        doc.text('NOMBRE Y FIRMA', 140, y + 20);

        y += 30;
        doc.setFontSize(9);
        doc.text('Av. de la Prensa No. 205, Col. L. García', 150, y);
        doc.text('Pachuca de Soto, Hidalgo, México', 158, y + 5);
        doc.text('Tel: 01 (771) 717 8000 ext. 1755', 160, y + 10);

        console.log('[PDF] PDF generado dinámicamente.');
        return doc;
    } catch (error) {
        console.error('[PDF] Error al generar el PDF:', error);
        throw error;
    }
}

export function savePDF(doc: jsPDF, filename: string) {
    try {
        console.log(`[PDF] Guardando PDF como: ${filename}.pdf`);
        doc.save(`${filename}.pdf`);
        console.log('[PDF] Archivo guardado correctamente');
    } catch (error) {
        console.error('[PDF] Error al guardar el PDF:', error);
    }
}
